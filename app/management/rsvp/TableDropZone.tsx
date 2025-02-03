import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "./TableDropZone.module.css";
import { Table, Guest } from "@app/types";

const ITEM_TYPE = "GUEST";

interface ExtendedTable extends Table {
  guests: Guest[]; // Ensure these are the guests assigned to this table
}

interface TableDropZoneProps {
  table: ExtendedTable;
  onDropGuest: (guestId: number, tableId: number) => void;
}

export default function TableDropZone({ table, onDropGuest }: TableDropZoneProps) {
  // Track which seat is being hovered (for tooltips or similar effects)
  const [hoveredSeatIndex, setHoveredSeatIndex] = useState<number | null>(null);

  // Create an array representing the seat indexes for the table capacity
  const seats = Array.from({ length: table.capacity }, (_, index) => index);

  // Table radius in pixels for positioning seats around the circumference
  const radius = 70;

  return (
    <div className={styles.tableContainer}>
      {/* Table-level drop zone */}
      <TableCircle table={table} onDropGuest={onDropGuest} />

      {/* Render seat nodes around the circle */}
      <div className={styles.seatsContainer}>
        {seats.map((seatIndex) => {
          const guest = table.guests[seatIndex]; // Use seatIndex as the array index
          return (
            <SeatNode
              key={seatIndex}
              seatIndex={seatIndex}
              guest={guest}
              table={table}
              onDropGuest={onDropGuest}
              hoveredSeatIndex={hoveredSeatIndex}
              setHoveredSeatIndex={setHoveredSeatIndex}
              radius={radius}
            />
          );
        })}
      </div>
    </div>
  );
}

interface SeatNodeProps {
  seatIndex: number;
  guest: Guest | undefined;
  table: ExtendedTable;
  onDropGuest: (guestId: number, tableId: number) => void;
  hoveredSeatIndex: number | null;
  setHoveredSeatIndex: (index: number | null) => void;
  radius: number;
}

function SeatNode({
  seatIndex,
  guest,
  table,
  onDropGuest,
  hoveredSeatIndex,
  setHoveredSeatIndex,
  radius,
}: SeatNodeProps) {
  // Calculate the angle and transform for the seat's placement
  const angle = (360 / table.capacity) * seatIndex;
  const transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;

  // Set up the drop zone for this seat.
  // Note: We are no longer extracting `isOver` since it isn't used.
  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number; currentTableId: number | null }) => {
      if (item.currentTableId !== table.id) {
        onDropGuest(item.id, table.id);
      }
    },
  }));

  // Set up dragging for the guest if present.
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: guest?.id, currentTableId: table.id },
    canDrag: !!guest, // Only draggable if a guest exists
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Determine the seat color based on occupancy
  const seatColor = guest ? "#4caf50" : "rgba(0,0,0,0.1)";

  return (
    <div
      ref={(node) => {
        // Attach both drop and drag refs
        dropRef(node);
        if (guest) dragRef(node);
      }}
      className={`${styles.seatNode} ${isDragging ? styles.dragging : ""}`}
      style={{ transform, backgroundColor: seatColor }}
      onMouseEnter={() => setHoveredSeatIndex(seatIndex)}
      onMouseLeave={() => setHoveredSeatIndex(null)}
    >
      {guest ? guest.name : ""}
      {hoveredSeatIndex === seatIndex && (
        <div className={styles.hoverOverlay}>
          {guest ? `Occupied by ${guest.name}` : "Empty seat"}
        </div>
      )}
    </div>
  );
}

interface TableCircleProps {
  table: ExtendedTable;
  onDropGuest: (guestId: number, tableId: number) => void;
}

// A separate component for the table-level drop zone (the dashed circle)
function TableCircle({ table, onDropGuest }: TableCircleProps) {
  const [, dropRef] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number; currentTableId: number | null }) => {
      if (item.currentTableId !== table.id) {
        onDropGuest(item.id, table.id);
      }
    },
  }));

  return (
    <div
      className={styles.table}
      ref={(node) => {
        if (node) dropRef(node);
      }}
    >
      <h3 className={styles.tableTitle}>
        {table.name} <span className={styles.capacity}>({table.capacity})</span>
      </h3>
    </div>
  );
}
