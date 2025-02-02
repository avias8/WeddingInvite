"use client";

import React from "react";
import { useDrop } from "react-dnd";
import styles from "./SeatingAssignment.module.css";
import { Guest as GuestType } from "@app/types";
import { Guest } from "./Guest";

const ITEM_TYPE = "GUEST";

export interface UnassignedGuestsProps {
  guests: GuestType[];
  unassignGuest: (guestId: number) => void;
}

export function UnassignedGuests({ guests, unassignGuest }: UnassignedGuestsProps) {
  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number }) => unassignGuest(item.id),
  }));

  return (
    <div
      ref={(node) => {
        dropRef(node as HTMLDivElement);
      }}
      className={styles.unassigned}
    >
      <h3>Unassigned Guests</h3>
      <div className={styles.guestList}>
        {guests.map((guest) => (
          // moveGuest not needed here because drop triggers unassignment.
          <Guest key={guest.id} guest={guest} moveGuest={() => {}} />
        ))}
      </div>
    </div>
  );
}