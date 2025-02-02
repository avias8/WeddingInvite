"use client";

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./SeatingAssignment.module.css";

import { Guest as GuestType, Table as TableType } from "@app/types";
import { Table } from "./Table";
import { UnassignedGuests } from "./UnassignedGuests";
import { CreateTableForm } from "./CreateTableForm";

export default function SeatingAssignment() {
  const [guests, setGuests] = useState<GuestType[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the new table form
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resInvitees, resTables] = await Promise.all([
          fetch("/api/invitees"),
          fetch("/api/tables"),
        ]);

        if (!resInvitees.ok || !resTables.ok) {
          throw new Error("Failed to fetch data");
        }

        const [inviteesData, tablesData] = await Promise.all([
          resInvitees.json(),
          resTables.json(),
        ]);

        // Map invitees to our Guest interface.
        const processedGuests = inviteesData.map((invitee: any, index: number) => ({
          id: invitee.id,
          name:
            invitee.name && invitee.name.trim().length > 0
              ? invitee.name
              : `Invitee Name ${String(index + 1).padStart(2, "0")}`,
          tableId: invitee.tableId ?? null,
        }));

        // Provide a default table if none exist.
        const processedTables =
          tablesData.length > 0 ? tablesData : [{ id: 1, name: "Joe Mama", capacity: 1 }];

        setGuests(processedGuests);
        setTables(processedTables);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const moveGuest = async (guestId: number, tableId: number) => {
    try {
      const res = await fetch("/api/tables/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, tableId }),
      });

      if (!res.ok) throw new Error("Failed to assign guest to table");

      setGuests((prevGuests) =>
        prevGuests.map((guest) =>
          guest.id === guestId ? { ...guest, tableId } : guest
        )
      );
    } catch (error) {
      console.error("Error assigning guest:", error);
    }
  };

  const unassignGuest = async (guestId: number) => {
    try {
      const res = await fetch("/api/tables/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      if (!res.ok) throw new Error("Failed to unassign guest");

      setGuests((prevGuests) =>
        prevGuests.map((guest) =>
          guest.id === guestId ? { ...guest, tableId: null } : guest
        )
      );
    } catch (error) {
      console.error("Error unassigning guest:", error);
    }
  };

  const createTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTableName, capacity: newTableCapacity }),
      });

      if (!res.ok) throw new Error("Failed to create table");

      const tableData = await res.json();
      setTables((prevTables) => [...prevTables, tableData]);
      setNewTableName("");
      setNewTableCapacity(0);
    } catch (error) {
      console.error("Error creating table:", error);
    }
  };

  if (loading) return <p className="text-center">Loading seating chart...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <h1>Seating Overview</h1>
        <h2>Seating Assignment</h2>
        <CreateTableForm
          newTableName={newTableName}
          newTableCapacity={newTableCapacity}
          setNewTableName={setNewTableName}
          setNewTableCapacity={setNewTableCapacity}
          createTable={createTable}
        />
        <div className={styles.layout}>
          <UnassignedGuests
            guests={guests.filter((g) => g.tableId === null)}
            unassignGuest={unassignGuest}
          />
          {tables.map((table) => (
            <Table
              key={table.id}
              table={table}
              guests={guests.filter((g) => g.tableId === table.id)}
              moveGuest={moveGuest}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}