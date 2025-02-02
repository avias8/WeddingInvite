"use client";

import React from "react";
import { useDrag } from "react-dnd";
import styles from "./SeatingAssignment.module.css";
import { Guest as GuestType } from "@app/types";; // if using types.ts

// If not using types.ts, you can re-declare interface Guest here.
const ITEM_TYPE = "GUEST";

export interface GuestComponentProps {
  guest: GuestType;
  moveGuest: (guestId: number, tableId: number) => void;
}

export function Guest({ guest, moveGuest }: GuestComponentProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: guest.id, tableId: guest.tableId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => {
        dragRef(node as HTMLDivElement);
      }} // Callback ref returns void
      className={`${styles.guest} ${isDragging ? styles.dragging : ""}`}
    >
      {guest.name}
    </div>
  );
}