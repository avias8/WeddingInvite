"use client";

import React from "react";
import { useDrop } from "react-dnd";
import styles from "./SeatingAssignment.module.css";
import { Guest as GuestType, Table as TableType } from "@app/types";
import { Guest } from "./Guest";

const ITEM_TYPE = "GUEST";

export interface TableComponentProps {
  table: TableType;
  guests: GuestType[];
  moveGuest: (guestId: number, tableId: number) => void;
}

export function Table({ table, guests, moveGuest }: TableComponentProps) {
  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number }) => moveGuest(item.id, table.id),
  }));

  return (
    <div
      ref={(node) => {
        dropRef(node as HTMLDivElement);
      }}
      className={styles.table}
    >
      <h3>
        {table.name} (Capacity: {table.capacity})
      </h3>
      <div className={styles.guestList}>
        {guests.map((guest) => (
          <Guest key={guest.id} guest={guest} moveGuest={moveGuest} />
        ))}
      </div>
    </div>
  );
}