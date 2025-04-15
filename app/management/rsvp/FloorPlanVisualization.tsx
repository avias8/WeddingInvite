// app/management/rsvp/FloorPlanVisualization.tsx (React-based SVG)
// Final Consolidated Version incorporating user's layout and fixes
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link
import styles from './FloorPlanVisualization.module.css';
import type { Guest, Table } from '@/app/types';

// Interface for joined Table data including assigned guests
interface TableWithGuests extends Table {
    guests: Guest[];
}

/**
 * Generates 1 or 2 initials from a given name string.
 * Handles empty/null names and extra spacing.
 * @param name - The full name string.
 * @returns A string containing 1 or 2 uppercase initials, or an empty string.
 */
function getInitials(name: string): string {
    if (!name) return ''; // Handle empty names
    const parts = name.trim().split(' ').filter(Boolean); // Trim and filter empty parts
    if (parts.length === 0) return '';
    // Create initials from the first letter of each part
    const initials = parts.map(part => part.charAt(0).toUpperCase()).join('');
    // Limit to a maximum of 2 initials
    return initials.substring(0, 2);
}

// Define the structure for layout properties of each table in the SVG
interface TableLayout {
    id: number;         // Corresponds to Table ID from DB - CRUCIAL for linking data
    x: number;          // SVG x-coordinate (top-left corner)
    y: number;          // SVG y-coordinate (top-left corner)
    width: number;      // SVG width
    height: number;     // SVG height
    capacity: number;   // Max number of seats (from DB)
    name: string;       // Actual table name from DB (for reference)
    displayName: string;// Label to display on the SVG table (e.g., "1", "Head")
}

// --- Layout Coordinates & Data Mapping ---
// Defines the visual position, size, label, capacity, and crucially,
// the DATABASE ID for each table to be drawn in the SVG.
// This array MUST match the structure and IDs in your database.
const TABLE_LAYOUTS: TableLayout[] = [
    // === Head Table ===
    { id: 1, name: "Head Table", displayName: "Head", x: 300, y: 50, width: 400, height: 40, capacity: 16 }, // DB ID: 1

    // === Right Side ===
    // Column 1 (Far Right)
    { id: 2, name: "Table 1", displayName: "1", x: 820, y: 100, width: 50, height: 150, capacity: 8 }, // DB ID: 2
    { id: 3, name: "Table 2", displayName: "2", x: 820, y: 250, width: 50, height: 150, capacity: 8 }, // DB ID: 3
    { id: 4, name: "Table 3", displayName: "3", x: 820, y: 450, width: 50, height: 150, capacity: 8 }, // DB ID: 4
    { id: 5, name: "Table 4", displayName: "4", x: 820, y: 600, width: 50, height: 150, capacity: 8 }, // DB ID: 5
    { id: 6, name: "Table 5", displayName: "5", x: 820, y: 750, width: 50, height: 150, capacity: 8 }, // DB ID: 6 - Vertical
    { id: 7, name: "Table 6", displayName: "6", x: 820, y: 950, width: 50, height: 150, capacity: 8 }, // DB ID: 7 - Vertical
    { id: 8, name: "Table 7", displayName: "7", x: 820, y: 1100, width: 50, height: 150, capacity: 8 },// DB ID: 8 - Vertical

    // Column 2 (Inner Right) - x: 680
    { id: 14, name: "Table 13", displayName: "13", x: 680, y: 150, width: 50, height: 150, capacity: 9 }, // DB ID: 14
    { id: 13, name: "Table 12", displayName: "12", x: 680, y: 300, width: 50, height: 150, capacity: 8 }, // DB ID: 13
    { id: 12, name: "Table 11", displayName: "11", x: 680, y: 450, width: 50, height: 150, capacity: 8 }, // DB ID: 12
    { id: 11, name: "Table 10", displayName: "10", x: 680, y: 650, width: 50, height: 150, capacity: 8 }, // DB ID: 11
    { id: 10, name: "Table 9", displayName: "9", x: 680, y: 800, width: 50, height: 150, capacity: 8 }, // DB ID: 10 - Vertical
    { id: 9, name: "Table 8", displayName: "8", x: 680, y: 1000, width: 50, height: 150, capacity: 8 }, // DB ID: 9 - Vertical, Below T9

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
    { id: 23, name: "Table 22", displayName: "22", x: 220, y: 800, width: 50, height: 150, capacity: 9 }, // DB ID: 23
];

/**
 * Calculates the approximate SVG coordinates for seats around a given table layout.
 * Assumes seats are placed evenly along the two longest sides.
 * @param layout - The TableLayout object defining the table's dimensions and capacity.
 * @returns An array of {x, y} coordinates for each seat relative to the table's origin.
 */
function calculateSeatPositions(layout: TableLayout): { x: number, y: number }[] {
    const positions: { x: number, y: number }[] = [];
    const seatRadius = 8; // Visual radius of the seat circle
    const numSeats = layout.capacity;
    const tableWidth = layout.width;
    const tableHeight = layout.height;

    // Determine orientation and dimensions for calculation
    const isVertical = tableHeight > tableWidth;
    const longDim = isVertical ? tableHeight : tableWidth; // Length of the side where seats are placed
    const shortDim = isVertical ? tableWidth : tableHeight; // Width of the table

    // Distribute seats approximately evenly between the two long sides
    let seatsOnLongSide1 = Math.ceil(numSeats / 2);
    let seatsOnLongSide2 = Math.floor(numSeats / 2);

    // Calculate spacing between seats on each long side
    const spacing1 = seatsOnLongSide1 > 0 ? longDim / (seatsOnLongSide1 + 1) : longDim;
    const spacing2 = seatsOnLongSide2 > 0 ? longDim / (seatsOnLongSide2 + 1) : longDim;

    for (let i = 0; i < numSeats; i++) {
        let sx = 0; // Seat x relative to table origin
        let sy = 0; // Seat y relative to table origin

        if (i < seatsOnLongSide1) { // Side 1 (Top edge if horizontal, Left edge if vertical)
            if (isVertical) { // Left side
                 sx = -seatRadius * 1.5; // Position left of the table edge
                 sy = spacing1 * (i + 1); // Distribute vertically
            } else { // Top side
                 sx = spacing1 * (i + 1); // Distribute horizontally
                 sy = -seatRadius * 1.5; // Position above the table edge
            }
        } else { // Side 2 (Bottom edge if horizontal, Right edge if vertical)
            const indexOnSide = i - seatsOnLongSide1;
             if (isVertical) { // Right side
                 sx = shortDim + seatRadius * 1.5; // Position right of the table edge
                 sy = spacing2 * (indexOnSide + 1); // Distribute vertically
            } else { // Bottom side
                 sx = spacing2 * (indexOnSide + 1); // Distribute horizontally
                 sy = shortDim + seatRadius * 1.5; // Position below the table edge
            }
        }
        positions.push({ x: sx, y: sy });
    }
    return positions;
}

// Define Props Interface for the component
interface FloorPlanVisualizationProps {
    fullView?: boolean; // Optional prop to trigger full view styling
}

/**
 * Renders an SVG floor plan visualization with assigned guest initials.
 * Fetches table and guest data from the API.
 * Uses a predefined layout array (TABLE_LAYOUTS) to position elements.
 * Adapts styling based on the `fullView` prop.
 */
export default function FloorPlanVisualization({ fullView = false }: FloorPlanVisualizationProps) {
    // State for storing guest assignments fetched from API (mapped by table ID)
    const [assignedGuests, setAssignedGuests] = useState<Record<number, Guest[]>>({});
    // State for loading indicator
    const [loading, setLoading] = useState<boolean>(true);
    // State for storing fetch errors
    const [error, setError] = useState<string | null>(null);

    // Fetch table and guest data when the component mounts
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch tables (API should include assigned guests)
                const res = await fetch('/api/tables');
                if (!res.ok) {
                    throw new Error(`Failed to fetch tables: ${res.statusText}`);
                }
                const data: TableWithGuests[] = await res.json();

                // Process data into a map for easy lookup: { tableId: [guest1, guest2,...] }
                const guestMap: Record<number, Guest[]> = {};
                data.forEach(table => {
                    // Ensure table.id is valid before using it as a key
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
    }, []); // Empty dependency array means this runs once on mount


    // Display loading state
    if (loading) return <div className={styles.loading}>Loading Floor Plan...</div>;
    // Display error state
    if (error) return <div className={styles.error}>Error loading data: {error}</div>;

    // Define Dance Floor coordinates
    const danceFloorX = 350;
    const danceFloorY = 130;
    const danceFloorWidth = 250;
    const danceFloorHeight = 250;

    // Determine container class based on the fullView prop
    // Use a separate class for constrained view to avoid specificity issues
    const containerClasses = [styles.visualizationContainer];
    if (!fullView) {
        containerClasses.push(styles.constrainedWidth);
    }
    const containerClassName = containerClasses.join(' ');

    return (
        <div className={containerClassName}>
            {/* Only show the main title when not in full view mode */}
            {!fullView && <h2 className={styles.mainTitle}>Floor Plan Visualization</h2>}

            {/* SVG Canvas - viewBox adjusted for vertical space */}
            <svg viewBox="0 0 1000 1350" className={styles.floorPlanSvg}>
                {/* Background Rect */}
                <rect x="0" y="0" width="1000" height="1350" className={styles.venueBackground} />

                {/* Outer Border for main area */}
                <rect x="20" y="20" width="960" height="1290" className={styles.outerBorder} />

                {/* Wall Labels */}
                <text x="500" y="15" className={styles.wallLabel} textAnchor="middle">
                    East Wall Open
                </text>
                <text x="970" y="585" className={styles.wallLabel} textAnchor="middle" transform="rotate(90, 970, 600)">
                    South Wall Open
                </text>

                {/* Static Elements (DJ, Buffet, Drinks, etc.) */}
                <rect x="50" y="50" width="80" height="40" className={styles.djBooth} />
                <text x="90" y="75" className={styles.labelText} textAnchor="middle">DJ</text>
                <rect x="50" y="200" width="50" height="400" className={styles.buffetArea} />
                <text x="75" y="400" className={styles.labelText} textAnchor="middle" transform="rotate(-90, 75, 400)">Buffet</text>
                <rect x="50" y="750" width="50" height="80" className={styles.drinksArea} />
                <text x="75" y="790" className={styles.labelText} textAnchor="middle" transform="rotate(-90, 75, 790)">Drinks</text>
                <rect x="30" y="625" width="80" height="100" className={styles.catererEntranceArea} />
                <text x="70" y="670" className={styles.labelText} textAnchor="middle">Caterer's</text>
                <text x="70" y="685" className={styles.labelText} textAnchor="middle">Entrance</text>
                <rect x="450" y="1280" width="80" height="30" className={styles.guestBookArea} />
                <text x="490" y="1295" className={styles.labelText} textAnchor="middle">Guest Book</text>
                <rect x="550" y="1310" width="80" height="30" className={styles.entranceFrame} />
                <text x="590" y="1325" className={styles.labelText} textAnchor="middle">Entrance</text>
                <g className={styles.garbageArea}>
                    <circle cx="360" cy="1290" r="10" className={styles.garbageBin} />
                    <circle cx="400" cy="1290" r="10" className={styles.garbageBin} />
                    <text x="380" y="1265" className={styles.labelText} textAnchor="middle">Garbage & Recycling</text>
                </g>

                {/* Render Tables and Seats Dynamically */}
                {TABLE_LAYOUTS.map(layout => {
                    // Look up guests for this table using the layout's DB ID
                    const guestsAtTable = typeof layout.id === 'number' ? (assignedGuests[layout.id] || []) : [];
                    // Calculate seat positions based on capacity and dimensions
                    const seatPositions = calculateSeatPositions(layout);

                    return (
                        // Group for table + seats, positioned using layout coords
                        <g key={layout.id} transform={`translate(${layout.x}, ${layout.y})`} className={styles.tableGroup}>
                            {/* Table Rectangle */}
                            <rect x={0} y={0} width={layout.width} height={layout.height} className={styles.tableRect} />
                            {/* Table Label */}
                            <text x={layout.width / 2} y={layout.height / 2 + 5} className={styles.tableLabel} textAnchor="middle">
                                {layout.displayName}
                            </text>
                            {/* Seats */}
                            {seatPositions.map((pos, index) => {
                                const guest = guestsAtTable[index]; // Get guest for this seat index, if any
                                const initial = guest ? getInitials(guest.name) : ''; // Get initials or empty
                                const seatClass = guest ? styles.seatOccupied : styles.seatEmpty; // Choose style
                                const seatKey = `seat-${layout.id}-${index}`; // Unique key for React

                                return (
                                    // Group for each seat (circle + text)
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

                 {/* Dance Floor (Rendered AFTER Tables, so it appears on top if overlapping) */}
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

            {/* Only show link/button if NOT in full view mode */}
            {!fullView && (
                <div className={styles.fullViewLinkContainer}>
                    <Link
                        href="/floorplan" // Link to the dedicated viewer page
                        className={styles.fullViewLinkButton}
                        target="_blank" // Open in new tab
                        rel="noopener noreferrer"
                        aria-label="Open full-screen floor plan viewer"
                    >
                        View Full Floor Plan
                    </Link>
                    <p className={styles.fullViewLinkNote}>(Opens interactive floor plan in a new tab)</p>
                </div>
            )}
        </div>
    );
}
