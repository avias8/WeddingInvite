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
      }}
      className={`${styles.guest} ${isDragging ? styles.dragging : ""}`}
      aria-label={`Draggable guest: ${guest.name}`}
    >
      {guest.name}
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
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number }) => onDropGuest(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      className={`${styles.unassigned} ${isActive ? styles.activeUnassigned : ""}`}
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
// TableDropZone and TableCircle Components
// ---------------------------

/**
 * The TableCircle component handles the drop logic and displays the table details
 * along with the list of guests currently assigned.
 */
interface TableProps {
  table: Table;
  onDropGuest: (guestId: number, tableId: number) => void;
}

/**
 * The TableCircle component now uses the `.table` CSS class to apply the
 * rectangular style and hover effects. We also collect the drop state to conditionally
 * add the active hover style.
 */
function TableCircle({ table, onDropGuest }: TableProps) {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number; currentTableId: number | null }) => {
      if (item.currentTableId !== table.id) {
        onDropGuest(item.id, table.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Compute capacity text for the table header.
  const capacityText = `${table.guests.length}/${table.capacity}`;

  // When the table is hovered (and can accept drops), apply the activeTable class.
  const activeClass = isOver && canDrop ? styles.activeTable : "";

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      className={`${styles.table} ${activeClass}`}
    >
      <h3 className={styles.tableTitle}>
        {table.name}{" "}
        <span className={styles.capacity}>({capacityText})</span>
      </h3>
      <div className={styles.tableGuestList}>
        {table.guests.map((guest) => (
          <DraggableGuest key={guest.id} guest={guest} />
        ))}
      </div>
    </div>
  );
}

/**
 * The TableDropZone component is a simple wrapper for the TableCircle.
 * It applies layout styling (e.g., grid) and passes the props through.
 */
function TableDropZone({ table, onDropGuest }: TableProps) {
  return (
    <div className={styles.tableContainer}>
      <TableCircle table={table} onDropGuest={onDropGuest} />
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
  const [assignError, setAssignError] = useState<string>("");

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

        const tablesWithGuests = tablesData.map((table) => ({
          ...table,
          guests: guestsData.filter((guest) => guest.tableId === table.id),
        }));
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

  const assignGuest = async (guestId: number, tableId: number) => {
    try {
      const res = await fetch("/api/tables/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, tableId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to assign guest");
      }
      const updatedGuest = await res.json();

      setGuests((prev) => prev.filter((g) => g.id !== guestId));
      setTables((prev) =>
        prev.map((table) => {
          const updatedGuests = table.guests.filter((g) => g.id !== guestId);
          if (table.id === tableId) {
            return { ...table, guests: [...updatedGuests, updatedGuest] };
          }
          return { ...table, guests: updatedGuests };
        })
      );
      setAssignError("");
    } catch (error) {
      console.error("Error assigning guest:", error);
      const errMsg = error instanceof Error ? error.message : "Error assigning guest";
      setAssignError(errMsg);
      setTimeout(() => setAssignError(""), 3000);
    }
  };

  const unassignGuest = async (guestId: number) => {
    try {
      const res = await fetch("/api/tables/unassign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (!res.ok) throw new Error("Failed to unassign guest");
      const updatedGuest = await res.json();

      setTables((prev) =>
        prev.map((table) => ({
          ...table,
          guests: table.guests.filter((g) => g.id !== guestId),
        }))
      );
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

        {assignError && (
          <div className={styles.errorAnimation}>
            <span role="img" aria-label="error">😢</span> {assignError}
          </div>
        )}

        <div className={styles.layout}>
          {/* Sidebar for unassigned guests */}
          <div className={styles.sidebar}>
            <UnassignedGuests guests={guests} onDropGuest={unassignGuest} />
          </div>

          {/* Tables container */}
          <div className={styles.tablesContainer}>
            {tables.map((table) => (
              <TableDropZone key={table.id} table={table} onDropGuest={assignGuest} />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}