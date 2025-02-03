"use client";

import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import styles from "./ManageTables.module.css";
// Import the Guest type from your shared types
import type { Guest } from "@/app/types";

interface Table {
  id: number;
  name: string;
  capacity: number;
  // Use the imported Guest type instead of any[]
  guests: Guest[];
}

export default function ManageTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // For adding a new table:
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState<number>(0);

  // For editing a table:
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedCapacity, setEditedCapacity] = useState<number>(0);

  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch("/api/tables");
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data: Table[] = await res.json();
        setTables(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName || !newTableCapacity) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTableName, capacity: newTableCapacity }),
      });
      if (!res.ok) {
        throw new Error("Failed to add table");
      }
      const newTable = await res.json();
      setTables((prev) => [...prev, newTable]);
      setNewTableName("");
      setNewTableCapacity(0);
    } catch (error) {
      console.error("Error adding table:", error);
      alert("Error adding table");
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete table");
      }
      setTables((prev) => prev.filter((table) => table.id !== id));
    } catch (error) {
      console.error("Error deleting table:", error);
      alert("Error deleting table");
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setEditedName(table.name);
    setEditedCapacity(table.capacity);
  };

  const handleSaveEdit = async () => {
    // Assumes you have a PUT endpoint at /api/tables/[id]
    try {
      const res = await fetch(`/api/tables/${editingTable?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName, capacity: editedCapacity }),
      });
      if (!res.ok) {
        throw new Error("Failed to update table");
      }
      const updatedTable = await res.json();
      setTables((prev) =>
        prev.map((table) => (table.id === updatedTable.id ? updatedTable : table))
      );
      setEditingTable(null);
    } catch (error) {
      console.error("Error updating table:", error);
      alert("Error updating table");
    }
  };

  if (loading) return <div>Loading tables...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className={styles.container}>
      <h2>Manage Tables</h2>

      {/* Form to add a new table */}
      <form onSubmit={handleAddTable} className={styles.addTableForm}>
        <input
          type="text"
          placeholder="Table Name"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newTableCapacity || ""}
          onChange={(e) => setNewTableCapacity(Number(e.target.value))}
          className={styles.input}
        />
        <button type="submit" className={styles.addButton}>
          Add Table
        </button>
      </form>

      {/* Display existing tables */}
      <div className={styles.tableList}>
        {tables.map((table) => (
          <div key={table.id} className={styles.tableCard}>
            <div className={styles.tableInfo}>
              <h3>{table.name}</h3>
              <p>Capacity: {table.capacity}</p>
              <p>Assigned: {table.guests?.length || 0}</p>
            </div>
            <div className={styles.actions}>
              <FaEdit
                className={styles.editIcon}
                onClick={() => handleEditTable(table)}
                title="Edit Table"
              />
              <FaTrash
                className={styles.deleteIcon}
                onClick={() => handleDeleteTable(table.id)}
                title="Delete Table"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Edit table modal */}
      {editingTable && (
        <div className={styles.editModal}>
          <div className={styles.modalContent}>
            <h3>Edit Table</h3>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className={styles.input}
            />
            <input
              type="number"
              value={editedCapacity}
              onChange={(e) => setEditedCapacity(Number(e.target.value))}
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <button onClick={handleSaveEdit} className={styles.saveButton}>
                Save
              </button>
              <button
                onClick={() => setEditingTable(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
