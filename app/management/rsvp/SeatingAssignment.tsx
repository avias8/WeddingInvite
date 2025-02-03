"use client";

import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./SeatingAssignment.module.css";

// ---------------------------
// Types
// ---------------------------
export interface Guest {
  id: number;
  name: string;
  tableId: number | null;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  guests: Guest[];
}

// ---------------------------
// Drag Item Type
// ---------------------------
const ITEM_TYPE = "GUEST";

// ---------------------------
// Draggable Guest Component
// ---------------------------
interface GuestProps {
  guest: Guest;
}

function DraggableGuest({ guest }: GuestProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: guest.id, currentTableId: guest.tableId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => {
        dragRef(node);
        return;
      }}
      className={`${styles.guest} ${isDragging ? styles.dragging : ""}`}
    >
      {guest.name}
    </div>
  );
}

// ---------------------------
// Table as a Drop Zone Component
// ---------------------------
interface TableProps {
  table: Table;
  onDropGuest: (guestId: number, tableId: number) => void;
}

function TableDropZone({ table, onDropGuest }: TableProps) {
  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number; currentTableId: number | null }) => {
      // Only update if the guest isn't already on this table
      if (item.currentTableId !== table.id) {
        onDropGuest(item.id, table.id);
      }
    },
  }));

  return (
    <div
      ref={(node) => {
        dropRef(node);
        return;
      }}
      className={styles.table}
    >
      <h3 className={styles.tableTitle}>
        {table.name} <span className={styles.capacity}>({table.capacity})</span>
      </h3>
      <div className={styles.tableGuestList}>
        {table.guests.map((guest) => (
          <DraggableGuest key={guest.id} guest={guest} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------
// Unassigned Guests Drop Zone Component
// ---------------------------
interface UnassignedGuestsProps {
  guests: Guest[];
  onDropGuest: (guestId: number) => void;
}

function UnassignedGuests({ guests, onDropGuest }: UnassignedGuestsProps) {
  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number }) => {
      onDropGuest(item.id);
    },
  }));

  return (
    <div
      ref={(node) => {
        dropRef(node);
        return;
      }}
      className={styles.unassigned}
    >
      <h3>Unassigned Guests</h3>
      <div className={styles.guestList}>
        {guests.map((guest) => (
          <DraggableGuest key={guest.id} guest={guest} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------
// Main SeatingAssignment Component
// ---------------------------
export default function SeatingAssignment() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // New state for assignment errors
  const [assignError, setAssignError] = useState<string>("");

  // Fetch guests and tables data from your API endpoints.
  useEffect(() => {
    async function fetchData() {
      try {
        const [resGuests, resTables] = await Promise.all([
          fetch("/api/guests"),
          fetch("/api/tables"),
        ]);
        if (!resGuests.ok || !resTables.ok) {
          throw new Error("Failed to fetch data");
        }
        const guestsData: Guest[] = await resGuests.json();
        const tablesData: Table[] = await resTables.json();

        // For each table, assign its guests based on tableId.
        const tablesWithGuests = tablesData.map((table) => ({
          ...table,
          guests: guestsData.filter((guest) => guest.tableId === table.id),
        }));

        // Guests that are not assigned (tableId === null)
        const unassigned = guestsData.filter((guest) => guest.tableId === null);

        setGuests(unassigned);
        setTables(tablesWithGuests);
      } catch (error) {
        console.error("Error fetching seating data:", error);
        setError("Error fetching seating data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ---------------------------
  // Function to assign a guest to a table.
  // ---------------------------
  const assignGuest = async (guestId: number, tableId: number) => {
    try {
      const res = await fetch("/api/tables/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, tableId }),
      });
      if (!res.ok) {
        // Capture and show the error message returned by the API
        const errData = await res.json();
        throw new Error(errData.error || "Failed to assign guest");
      }
      const updatedGuest = await res.json();

      // Remove guest from unassigned list.
      setGuests((prev) => prev.filter((g) => g.id !== guestId));

      // Remove the guest from any table and add to the new one.
      setTables((prev) =>
        prev.map((table) => {
          const updatedGuests = table.guests.filter((g) => g.id !== guestId);
          if (table.id === tableId) {
            return { ...table, guests: [...updatedGuests, updatedGuest] };
          }
          return { ...table, guests: updatedGuests };
        })
      );
      // Clear any assignment error if assignment is successful.
      setAssignError("");
    } catch (error) {
      console.error("Error assigning guest:", error);
      const errMsg =
        error instanceof Error ? error.message : "Error assigning guest";
      setAssignError(errMsg);
      // Clear error after 3 seconds.
      setTimeout(() => setAssignError(""), 3000);
    }
  };

  // ---------------------------
  // Function to unassign a guest (remove from table).
  // ---------------------------
  const unassignGuest = async (guestId: number) => {
    try {
      const res = await fetch("/api/tables/unassign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (!res.ok) throw new Error("Failed to unassign guest");
      const updatedGuest = await res.json();

      // Remove the guest from its table.
      setTables((prev) =>
        prev.map((table) => ({
          ...table,
          guests: table.guests.filter((g) => g.id !== guestId),
        }))
      );
      // Add the guest to the unassigned list.
      setGuests((prev) => [...prev, updatedGuest]);
    } catch (error) {
      console.error("Error unassigning guest:", error);
      alert("Error unassigning guest");
    }
  };

  if (loading) return <p className="text-center">Loading seating data...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.seatingAssignment}>
        <h1 className={styles.heading}>Seating Assignment</h1>

        {/* Animated Error Message */}
        {assignError && (
          <div className={styles.errorAnimation}>
            <span role="img" aria-label="error">
              😢
            </span>{" "}
            {assignError}
          </div>
        )}

        <div className={styles.layout}>
          <UnassignedGuests guests={guests} onDropGuest={unassignGuest} />
          <div className={styles.tablesContainer}>
            {tables.map((table) => (
              <TableDropZone
                key={table.id}
                table={table}
                onDropGuest={assignGuest}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
