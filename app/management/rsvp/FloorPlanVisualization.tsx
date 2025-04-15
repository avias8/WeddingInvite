// app/management/rsvp/FloorPlanVisualization.tsx (React-based SVG)
// Using User's Corrected TABLE_LAYOUTS
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './FloorPlanVisualization.module.css'; // Use the same CSS Module
import type { Guest, Table } from '@/app/types';

interface TableWithGuests extends Table {
    guests: Guest[];
}

// Keep the initials helper (User's version)
function getInitials(name: string): string {
    if (!name) return ''; // Handle empty names
    const parts = name.trim().split(' ').filter(Boolean); // Trim and filter empty parts
    if (parts.length === 0) return '';
    const initials = parts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials.substring(0, 2); // Limit to max 2 initials
}


// Define an interface for table layout properties
interface TableLayout {
    id: number; // Corresponds to Table ID from DB
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: number; // Keep capacity info
    name: string; // Keep name/label (mostly for debugging, label uses table number)
    displayName: string; // What to actually display on the table
}

// --- USER PROVIDED Layout Coordinates ---
const TABLE_LAYOUTS: TableLayout[] = [
    // === Head Table ===
    { id: 1, name: "Head Table", displayName: "Head", x: 300, y: 50, width: 400, height: 40, capacity: 16 }, // DB ID: 1

    // === Right Side ===
    // Column 1 (Far Right) - Now 7 tables tall
    { id: 2, name: "Table 1", displayName: "1", x: 820, y: 100, width: 50, height: 150, capacity: 8 }, // DB ID: 2
    { id: 3, name: "Table 2", displayName: "2", x: 820, y: 250, width: 50, height: 150, capacity: 8 }, // DB ID: 3
    { id: 4, name: "Table 3", displayName: "3", x: 820, y: 450, width: 50, height: 150, capacity: 8 }, // DB ID: 4
    { id: 5, name: "Table 4", displayName: "4", x: 820, y: 600, width: 50, height: 150, capacity: 8 }, // DB ID: 5
    { id: 6, name: "Table 5", displayName: "5", x: 820, y: 750, width: 50, height: 150, capacity: 8 }, // DB ID: 6 - Now Vertical
    { id: 7, name: "Table 6", displayName: "6", x: 820, y: 950, width: 50, height: 150, capacity: 8 }, // DB ID: 7 - Now Vertical
    { id: 8, name: "Table 7", displayName: "7", x: 820, y: 1100, width: 50, height: 150, capacity: 8 },// DB ID: 8 - Now Vertical

    // Column 2 (Inner Right) - x: 680
    { id: 14, name: "Table 13", displayName: "13", x: 680, y: 150, width: 50, height: 150, capacity: 9 }, // DB ID: 14
    { id: 13, name: "Table 12", displayName: "12", x: 680, y: 300, width: 50, height: 150, capacity: 8 }, // DB ID: 13
    { id: 12, name: "Table 11", displayName: "11", x: 680, y: 450, width: 50, height: 150, capacity: 8 }, // DB ID: 12
    { id: 11, name: "Table 10", displayName: "10", x: 680, y: 650, width: 50, height: 150, capacity: 8 }, // DB ID: 11
    { id: 10, name: "Table 9", displayName: "9", x: 680, y: 800, width: 50, height: 150, capacity: 8 }, // DB ID: 10 - Height increased
    { id: 9, name: "Table 8", displayName: "8", x: 680, y: 1000, width: 50, height: 150, capacity: 8 }, // DB ID: 9 - Now Vertical, Below T9

    // === Center === (Starting lower at y=400)
    // Column 1 (Right Center) - x: 510
    { id: 15, name: "Table 14", displayName: "14", x: 510, y: 400, width: 50, height: 150, capacity: 8 }, // DB ID: 15
    { id: 16, name: "Table 15", displayName: "15", x: 510, y: 550, width: 50, height: 150, capacity: 8 }, // DB ID: 16
    { id: 17, name: "Table 16", displayName: "16", x: 510, y: 700, width: 50, height: 150, capacity: 8 }, // DB ID: 17
    { id: 18, name: "Table 17", displayName: "17", x: 510, y: 850, width: 50, height: 150, capacity: 8 }, // DB ID: 18
    // Column 2 (Left Center) - x: 400
    { id: 22, name: "Table 21", displayName: "21", x: 400, y: 400, width: 50, height: 150, capacity: 8 }, // DB ID: 22
    { id: 21, name: "Table 20", displayName: "20", x: 400, y: 550, width: 50, height: 150, capacity: 8 }, // DB ID: 21
    { id: 20, name: "Table 19", displayName: "19", x: 400, y: 700, width: 50, height: 150, capacity: 8 }, // DB ID: 20
    { id: 19, name: "Table 18", displayName: "18", x: 400, y: 850, width: 50, height: 150, capacity: 9 }, // DB ID: 19

    // === Left Side === - x: 220
    { id: 27, name: "Table 26", displayName: "26", x: 220, y: 150, width: 50, height: 150, capacity: 9 }, // DB ID: 27
    { id: 26, name: "Table 25", displayName: "25", x: 220, y: 300, width: 50, height: 150, capacity: 9 }, // DB ID: 26
    { id: 25, name: "Table 24", displayName: "24", x: 220, y: 450, width: 50, height: 150, capacity: 8 }, // DB ID: 25
    { id: 24, name: "Table 23", displayName: "23", x: 220, y: 650, width: 50, height: 150, capacity: 9 }, // DB ID: 24
    { id: 23, name: "Table 22", displayName: "22", x: 220, y: 800, width: 50, height: 150, capacity: 9 }, // DB ID: 23 - Height increased
];

// Helper to calculate seat positions around a table
function calculateSeatPositions(layout: TableLayout): { x: number, y: number }[] {
    // ... (calculateSeatPositions function remains the same)
    const positions: { x: number, y: number }[] = [];
    const seatRadius = 8;
    const numSeats = layout.capacity;
    const tableWidth = layout.width;
    const tableHeight = layout.height;
    const isVertical = tableHeight > tableWidth;
    const longDim = isVertical ? tableHeight : tableWidth;
    const shortDim = isVertical ? tableWidth : tableHeight;
    let seatsOnLongSide1 = Math.ceil(numSeats / 2);
    let seatsOnLongSide2 = Math.floor(numSeats / 2);
    const spacing1 = seatsOnLongSide1 > 0 ? longDim / (seatsOnLongSide1 + 1) : longDim;
    const spacing2 = seatsOnLongSide2 > 0 ? longDim / (seatsOnLongSide2 + 1) : longDim;

    for (let i = 0; i < numSeats; i++) {
        let sx = 0;
        let sy = 0;
        if (i < seatsOnLongSide1) { // Side 1 (Top or Left)
            if (isVertical) { sx = -seatRadius * 1.5; sy = spacing1 * (i + 1); }
            else { sx = spacing1 * (i + 1); sy = -seatRadius * 1.5; }
        } else { // Side 2 (Bottom or Right)
            const indexOnSide = i - seatsOnLongSide1;
            if (isVertical) { sx = shortDim + seatRadius * 1.5; sy = spacing2 * (indexOnSide + 1); }
            else { sx = spacing2 * (indexOnSide + 1); sy = shortDim + seatRadius * 1.5; }
        }
        positions.push({ x: sx, y: sy });
    }
    return positions;
}


export default function FloorPlanVisualization() {
    // ... state, useEffect, loading/error handling remains the same ...
    const [assignedGuests, setAssignedGuests] = useState<Record<number, Guest[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            // ... (fetch data logic remains the same)
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/tables');
                if (!res.ok) {
                    throw new Error(`Failed to fetch tables: ${res.statusText}`);
                }
                const data: TableWithGuests[] = await res.json();
                const guestMap: Record<number, Guest[]> = {};
                data.forEach(table => {
                    if (table && typeof table.id === 'number') {
                        guestMap[table.id] = table.guests?.filter(g => g.tableId === table.id) || [];
                    }
                });
                setAssignedGuests(guestMap);
            } catch (err) {
                console.error("Error fetching floor plan data:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className={styles.loading}>Loading Floor Plan...</div>;
    if (error) return <div className={styles.error}>Error loading data: {error}</div>;

    // Define Dance Floor coordinates - Adjusted Y
    const danceFloorX = 350;
    const danceFloorY = 130; // Lowered to be between Head table and Center columns
    const danceFloorWidth = 250;
    const danceFloorHeight = 250;

    const staticImagePath = "/images/final_floor_plan.png"; // Adjust path/name as needed


    return (
        <div className={styles.visualizationContainer}>
            <h2 className={styles.mainTitle}>Floor Plan Visualization</h2>
            {/* *** UPDATED viewBox height and Static Element Positions *** */}
            <svg viewBox="0 0 1000 1350" className={styles.floorPlanSvg}>
                {/* Background */}
                <rect x="0" y="0" width="1000" height="1350" className={styles.venueBackground} />

                {/* *** ADDED Outer Border *** */}
                <rect
                    x="20"     // Left edge padding
                    y="20"     // Top edge padding
                    width="960"  // Total width (1000) - left padding (20) - right padding (20)
                    height="1290" // Stops above Guest Book/Entrance area (which starts around y=1280)
                    className={styles.outerBorder}
                />

                {/* *** ADDED Wall Labels *** */}
                <text x="500" y="15" className={styles.wallLabel} textAnchor="middle">
                    East Wall Open
                </text>
                <text
                    x="970" // Position near the right border
                    y="585" // Center vertically along the wall
                    className={styles.wallLabel}
                    textAnchor="middle"
                    transform="rotate(90, 970, 600)" // Rotate 90 degrees around its center
                >
                    South Wall Open
                </text>

                {/* Other Static Elements */}
                <rect x="50" y="50" width="80" height="40" className={styles.djBooth} />
                <text x="90" y="75" className={styles.labelText} textAnchor="middle">DJ</text>
                <rect x="50" y="200" width="50" height="400" className={styles.buffetArea} />
                <text x="75" y="400" className={styles.labelText} textAnchor="middle" transform="rotate(-90, 75, 400)">Buffet</text>
                <rect x="50" y="750" width="50" height="80" className={styles.drinksArea} />
                <text x="75" y="790" className={styles.labelText} textAnchor="middle" transform="rotate(-90, 75, 790)">Drinks</text>
                <rect x="30" y="625" width="80" height="100" className={styles.catererEntranceArea} />
                <text x="70" y="670" className={styles.labelText} textAnchor="middle">Caterer's</text>
                <text x="70" y="685" className={styles.labelText} textAnchor="middle">Entrance</text>

                {/* *** Guest Book Area - Moved Left *** */}
                <rect x="450" y="1280" width="80" height="30" className={styles.guestBookArea} />
                <text x="490" y="1295" className={styles.labelText} textAnchor="middle">Guest Book</text>

                {/* *** Entrance Label - Styled with a Frame *** */}
                <rect x="550" y="1310" width="80" height="30" className={styles.entranceFrame} /> {/* Added frame */}
                <text x="590" y="1325" className={styles.labelText} textAnchor="middle">Entrance</text>


                {/* Render Tables and Seats Dynamically */}
                {TABLE_LAYOUTS.map(layout => {
                    // ... existing table and seat rendering logic ...
                    const guestsAtTable = typeof layout.id === 'number' ? (assignedGuests[layout.id] || []) : [];
                    const seatPositions = calculateSeatPositions(layout);
                    return (
                        <g key={layout.id} transform={`translate(${layout.x}, ${layout.y})`} className={styles.tableGroup}>
                            {/* Table Rect */}
                            <rect x={0} y={0} width={layout.width} height={layout.height} className={styles.tableRect} />
                            {/* Table Label - Using displayName */}
                            <text x={layout.width / 2} y={layout.height / 2 + 5} className={styles.tableLabel} textAnchor="middle">
                                {layout.displayName}
                            </text>
                            {/* Seats */}
                            {seatPositions.map((pos, index) => {
                                const guest = guestsAtTable[index];
                                const initial = guest ? getInitials(guest.name) : '';
                                const seatClass = guest ? styles.seatOccupied : styles.seatEmpty;
                                const seatKey = `seat-${layout.id}-${index}`;
                                return (
                                    <g key={seatKey} transform={`translate(${pos.x}, ${pos.y})`}>
                                        <circle cx="0" cy="0" r="8" className={seatClass} />
                                        <text x="0" y="3" className={styles.seatInitial} textAnchor="middle">
                                            {initial}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}

                {/* *** ADDED Garbage & Recycling Area *** */}
                <g className={styles.garbageArea}>
                    {/* Bins */}
                    <circle cx="280" cy="1290" r="10" className={styles.garbageBin} />
                    <circle cx="320" cy="1290" r="10" className={styles.garbageBin} />
                    {/* Label */}
                    <text x="300" y="1265" className={styles.labelText} textAnchor="middle">Garbage & Recycling</text>
                </g>

                {/* Dance Floor (Rendered AFTER Tables) */}
                <rect
                    x={danceFloorX}
                    y={danceFloorY}
                    width={danceFloorWidth}
                    height={danceFloorHeight}
                    className={styles.danceFloor}
                />
                <text
                    x={danceFloorX + danceFloorWidth / 2}
                    y={danceFloorY + danceFloorHeight / 2 + 5} // Center text
                    className={styles.labelText}
                    textAnchor="middle">
                    Dance
                </text>
            </svg>

            {/* *** ADDED Link to Full Viewer Page *** */}
            {/* Inside FloorPlanVisualization.tsx, update the Link section */}
            <div className={styles.fullViewLinkContainer}>
                <Link
                    // *** UPDATED href to point to the new root path ***
                    href="/floorplan"
                    className={styles.fullViewLinkButton}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open full-screen floor plan viewer"
                >
                    View Full Floor Plan
                </Link>
                 <p className={styles.fullViewLinkNote}>(Opens interactive floor plan in a new tab)</p>
            </div>

        </div>
    );
}