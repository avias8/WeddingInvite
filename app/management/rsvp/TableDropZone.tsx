import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "./TableDropZone.module.css";
import { Table, Guest } from "@app/types";

const ITEM_TYPE = "GUEST";

interface ExtendedTable extends Table {
  guests: Guest[]; // Make sure we already filtered or appended guests belonging to this table
}

interface TableDropZoneProps {
  table: ExtendedTable;
  onDropGuest: (guestId: number, tableId: number) => void;
}

export default function TableDropZone({ table, onDropGuest }: TableDropZoneProps) {
  // Track which seat is being hovered
  const [hoveredSeatIndex, setHoveredSeatIndex] = useState<number | null>(null);

  // We’ll render seat placeholders for the entire capacity:
  const seats = Array.from({ length: table.capacity }, (_, index) => index);

  // Table radius in pixels for positioning seats around the circumference
  const radius = 70;

  return (
    <div className={styles.tableContainer}>
      {/* If you still want a table-level drop zone (drop anywhere on the circle), you can do: */}
      <TableCircle table={table} onDropGuest={onDropGuest} />

      {/* Render seat nodes around the circle */}
      <div className={styles.seatsContainer}>
        {seats.map((seatIndex) => {
          const guest = table.guests[seatIndex]; // If we treat seatIndex == array index
          const angle = (360 / table.capacity) * seatIndex;
          const transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;

          // Each seat node will be its own drop zone:
          const [{ isOver }, dropRef] = useDrop(() => ({
            accept: ITEM_TYPE,
            drop: (item: { id: number; currentTableId: number | null }) => {
              // Optionally pass seatIndex to your backend if you want seat-level assignment
              if (item.currentTableId !== table.id) {
                onDropGuest(item.id, table.id);
              }
            },
            collect: (monitor) => ({
              isOver: monitor.isOver(),
            }),
          }));

          // If there's a guest, also allow dragging them away:
          const [{ isDragging }, dragRef] = useDrag(() => ({
            type: ITEM_TYPE,
            item: { id: guest?.id, currentTableId: table.id },
            canDrag: !!guest, // only draggable if seat is occupied
            collect: (monitor) => ({
              isDragging: monitor.isDragging(),
            }),
          }));

          // Seat color changes if occupied
          const seatColor = guest ? "#4caf50" : "rgba(0,0,0,0.1)";

          return (
            <div
              key={seatIndex}
              ref={(node) => {
                dropRef(node);     // Attach drop ref
                if (guest) dragRef(node); // Attach drag ref only if seat is occupied
              }}
              className={`${styles.seatNode} ${isDragging ? styles.dragging : ""}`}
              style={{ transform, backgroundColor: seatColor }}
              onMouseEnter={() => setHoveredSeatIndex(seatIndex)}
              onMouseLeave={() => setHoveredSeatIndex(null)}
            >
              {/* Show occupant's name if you like */}
              {guest ? guest.name : ""}
              
              {/* Hover tooltip */}
              {hoveredSeatIndex === seatIndex && (
                <div className={styles.hoverOverlay}>
                  {guest ? `Occupied by ${guest.name}` : "Empty seat"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Just the dashed circle for reference (optional drop zone)
function TableCircle({
  table,
  onDropGuest
}: {
  table: ExtendedTable;
  onDropGuest: (guestId: number, tableId: number) => void;
}) {
  // If you still want to drop anywhere on the table circle:
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
        if (node) {
          dropRef(node); 
        }
      }}
    >
      <h3 className={styles.tableTitle}>
        {table.name} <span className={styles.capacity}>({table.capacity})</span>
      </h3>
    </div>
  );  
}
