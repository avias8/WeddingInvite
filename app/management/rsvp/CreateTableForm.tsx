"use client";

import React from "react";
import styles from "./SeatingAssignment.module.css";

export interface CreateTableFormProps {
  newTableName: string;
  newTableCapacity: number;
  setNewTableName: (name: string) => void;
  setNewTableCapacity: (capacity: number) => void;
  createTable: (e: React.FormEvent) => void;
}

export function CreateTableForm({
  newTableName,
  newTableCapacity,
  setNewTableName,
  setNewTableCapacity,
  createTable,
}: CreateTableFormProps) {
  return (
    <section className={styles.createTableSection}>
      <h3>Create Table</h3>
      <form onSubmit={createTable} className={styles.newTableForm}>
        <input
          type="text"
          placeholder="Table Name"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newTableCapacity}
          onChange={(e) => setNewTableCapacity(Number(e.target.value))}
          required
        />
        <button type="submit">Create Table</button>
      </form>
    </section>
  );
}