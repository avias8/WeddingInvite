// app/management/rsvp/FloorPlanVisualization.tsx (React-based SVG)
// Added custom tooltip on hover for guest details
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './FloorPlanVisualization.module.css';
// Make sure Guest type includes all fields needed for tooltip
import type { Guest, Table } from '@/app/types';

// Interface for joined Table data including assigned guests
interface TableWithGuests extends Table {
    guests: Guest[];
}

/**
 * Generates 1 or 2 initials from a given name string.
 */
function getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    const firstInitial = parts[0].substring(0, 1);
    const lastInitial = parts[parts.length - 1].substring(0, 1);
    return `${firstInitial}${lastInitial}`.toUpperCase();
}


// Define the structure for layout properties of each table in the SVG
interface TableLayout {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: number;
    name: string;
    displayName: string;
}

// Layout Coordinates & Data Mapping (Using the final corrected array)
const TABLE_LAYOUTS: TableLayout[] = [
    // ... (TABLE_LAYOUTS array remains the same) ...
    { id: 1, name: "Head Table", displayName: "Head", x: 300, y: 50, width: 400, height: 40, capacity: 16 },
    { id: 2, name: "Table 1", displayName: "1", x: 820, y: 100, width: 50, height: 150, capacity: 8 },
    { id: 3, name: "Table 2", displayName: "2", x: 820, y: 250, width: 50, height: 150, capacity: 8 },
    { id: 4, name: "Table 3", displayName: "3", x: 820, y: 450, width: 50, height: 150, capacity: 8 },
    { id: 5, name: "Table 4", displayName: "4", x: 820, y: 600, width: 50, height: 150, capacity: 8 },
    { id: 6, name: "Table 5", displayName: "5", x: 820, y: 750, width: 50, height: 150, capacity: 8 },
    { id: 7, name: "Table 6", displayName: "6", x: 820, y: 950, width: 50, height: 150, capacity: 8 },
    { id: 8, name: "Table 7", displayName: "7", x: 820, y: 1100, width: 50, height: 150, capacity: 8 },
    { id: 14, name: "Table 13", displayName: "13", x: 680, y: 150, width: 50, height: 150, capacity: 9 },
    { id: 13, name: "Table 12", displayName: "12", x: 680, y: 300, width: 50, height: 150, capacity: 8 },
    { id: 12, name: "Table 11", displayName: "11", x: 680, y: 450, width: 50, height: 150, capacity: 8 },
    { id: 11, name: "Table 10", displayName: "10", x: 680, y: 650, width: 50, height: 150, capacity: 8 },
    { id: 10, name: "Table 9", displayName: "9", x: 680, y: 800, width: 50, height: 150, capacity: 8 },
    { id: 9, name: "Table 8", displayName: "8", x: 680, y: 1000, width: 50, height: 150, capacity: 8 },
    { id: 15, name: "Table 14", displayName: "14", x: 510, y: 400, width: 50, height: 150, capacity: 8 },
    { id: 16, name: "Table 15", displayName: "15", x: 510, y: 550, width: 50, height: 150, capacity: 8 },
    { id: 17, name: "Table 16", displayName: "16", x: 510, y: 700, width: 50, height: 150, capacity: 8 },
    { id: 18, name: "Table 17", displayName: "17", x: 510, y: 850, width: 50, height: 150, capacity: 8 },
    { id: 22, name: "Table 21", displayName: "21", x: 400, y: 400, width: 50, height: 150, capacity: 8 },
    { id: 21, name: "Table 20", displayName: "20", x: 400, y: 550, width: 50, height: 150, capacity: 8 },
    { id: 20, name: "Table 19", displayName: "19", x: 400, y: 700, width: 50, height: 150, capacity: 8 },
    { id: 19, name: "Table 18", displayName: "18", x: 400, y: 850, width: 50, height: 150, capacity: 9 },
    { id: 27, name: "Table 26", displayName: "26", x: 220, y: 150, width: 50, height: 150, capacity: 9 },
    { id: 26, name: "Table 25", displayName: "25", x: 220, y: 300, width: 50, height: 150, capacity: 9 },
    { id: 25, name: "Table 24", displayName: "24", x: 220, y: 450, width: 50, height: 150, capacity: 8 },
    { id: 24, name: "Table 23", displayName: "23", x: 220, y: 650, width: 50, height: 150, capacity: 9 },
    { id: 23, name: "Table 22", displayName: "22", x: 220, y: 800, width: 50, height: 150, capacity: 9 },
];

/**
 * Calculates seat positions. Uses seatRadius=10 for offset.
 */
function calculateSeatPositions(layout: TableLayout): { x: number, y: number }[] {
    // ... (calculateSeatPositions function remains the same) ...
    const positions: { x: number, y: number }[] = [];
    const seatRadius = 10;
    const numSeats = layout.capacity;
    const tableWidth = layout.width;
    const tableHeight = layout.height;
    const isVertical = tableHeight > tableWidth;
    const longDim = isVertical ? tableHeight : tableWidth;
    const shortDim = isVertical ? tableWidth : tableHeight;
    const seatsOnLongSide1 = Math.ceil(numSeats / 2);
    const seatsOnLongSide2 = Math.floor(numSeats / 2);
    const spacing1 = seatsOnLongSide1 > 0 ? longDim / (seatsOnLongSide1 + 1) : longDim;
    const spacing2 = seatsOnLongSide2 > 0 ? longDim / (seatsOnLongSide2 + 1) : longDim;

    for (let i = 0; i < numSeats; i++) {
        let sx = 0;
        let sy = 0;
        if (i < seatsOnLongSide1) {
            if (isVertical) { sx = -seatRadius * 1.5; sy = spacing1 * (i + 1); }
            else { sx = spacing1 * (i + 1); sy = -seatRadius * 1.5; }
        } else {
            const indexOnSide = i - seatsOnLongSide1;
            if (isVertical) { sx = shortDim + seatRadius * 1.5; sy = spacing2 * (indexOnSide + 1); }
            else { sx = spacing2 * (indexOnSide + 1); sy = shortDim + seatRadius * 1.5; }
        }
        positions.push({ x: sx, y: sy });
    }
    return positions;
}

// Define Props Interface for the component
interface FloorPlanVisualizationProps {
    fullView?: boolean;
}

/**
 * Renders an SVG floor plan visualization with assigned guest initials
 * and a custom tooltip on hover showing guest details.
 */
export default function FloorPlanVisualization({ fullView = false }: FloorPlanVisualizationProps) {
    const [assignedGuests, setAssignedGuests] = useState<Record<number, Guest[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // *** State for Tooltip ***
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    // Ensure Guest type includes needed fields (name, dietaryRestrictions, etc.)
    const [tooltipContent, setTooltipContent] = useState<Guest | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        // ... (fetchData logic remains the same) ...
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/tables');
                if (!res.ok) {
                    throw new Error(`Failed to fetch tables: ${res.statusText}`);
                }
                // Ensure the API returns guests with all necessary fields
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

    // *** Tooltip Event Handlers ***
    const handleMouseEnter = (event: React.MouseEvent, guest: Guest) => {
        setTooltipContent(guest);
        // Position tooltip slightly offset from cursor
        setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
        setTooltipVisible(true);
    };

    const handleMouseLeave = () => {
        setTooltipVisible(false);
        setTooltipContent(null);
    };

    if (loading) return <div className={styles.loading}>Loading Floor Plan...</div>;
    if (error) return <div className={styles.error}>Error loading data: {error}</div>;

    // Define Dance Floor coordinates
    const danceFloorX = 350;
    const danceFloorY = 130;
    const danceFloorWidth = 250;
    const danceFloorHeight = 250;

    // Determine container class based on the fullView prop
    const containerClasses = [styles.visualizationContainer];
    if (!fullView) {
        containerClasses.push(styles.constrainedWidth);
    }
    const containerClassName = containerClasses.join(' ');

    return (
        // Use a relative container to potentially position tooltip absolutely if needed
        // but fixed positioning based on mouse is generally easier
        <div className={containerClassName} style={{ position: 'relative' }}>
            {!fullView && <h2 className={styles.mainTitle}>Floor Plan Visualization</h2>}

            <svg viewBox="0 0 1000 1350" className={styles.floorPlanSvg}>
                {/* ... (Background, Border, Wall Labels, Static Elements remain the same) ... */}
                 <rect x="0" y="0" width="1000" height="1350" className={styles.venueBackground} />
                 <rect x="20" y="20" width="960" height="1290" className={styles.outerBorder} />
                 <text x="500" y="15" className={styles.wallLabel} textAnchor="middle">East Wall Open</text>
                 <text x="970" y="585" className={styles.wallLabel} textAnchor="middle" transform="rotate(90, 970, 600)">South Wall Open</text>
                 <rect x="50" y="50" width="80" height="40" className={styles.djBooth} />
                 <text x="90" y="75" className={styles.labelText} textAnchor="middle">DJ</text>
                 <rect x="50" y="200" width="50" height="400" className={styles.buffetArea} />
                 <text x="75" y="400" className={styles.labelText} textAnchor="middle" transform="rotate(-90, 75, 400)">Buffet</text>
                 <rect x="50" y="750" width="50" height="80" className={styles.drinksArea} />
                 <text x="75" y="790" className={styles.labelText} textAnchor="middle" transform="rotate(-90, 75, 790)">Drinks</text>
                 <rect x="30" y="625" width="80" height="100" className={styles.catererEntranceArea} />
                 <text x="70" y="670" className={styles.labelText} textAnchor="middle">Caterer&apos;s</text>
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
                    const guestsAtTable = typeof layout.id === 'number' ? (assignedGuests[layout.id] || []) : [];
                    const seatPositions = calculateSeatPositions(layout);
                    return (
                        <g key={layout.id} transform={`translate(${layout.x}, ${layout.y})`} className={styles.tableGroup}>
                            {/* ... Table rect and label ... */}
                             <rect x={0} y={0} width={layout.width} height={layout.height} className={styles.tableRect} />
                             <text x={layout.width / 2} y={layout.height / 2 + 5} className={styles.tableLabel} textAnchor="middle">
                                 {layout.displayName}
                             </text>
                            {/* Seats */}
                            {seatPositions.map((pos, index) => {
                                const guest = guestsAtTable[index];
                                const displayLabel = guest ? getInitials(guest.name) : '';
                                const seatClass = guest ? styles.seatOccupied : styles.seatEmpty;
                                const seatKey = `seat-${layout.id}-${index}`;
                                return (
                                    // *** Add mouse event handlers to the seat group ***
                                    <g
                                        key={seatKey}
                                        transform={`translate(${pos.x}, ${pos.y})`}
                                        className={styles.seatGroup}
                                        onMouseEnter={(e) => guest && handleMouseEnter(e, guest)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {/* Remove the <title> element */}
                                        {/* {guest && <title>{guest.name}</title>} */}

                                        {/* Seat circle indicator */}
                                        <circle cx="0" cy="0" r="10" className={seatClass} />
                                        {/* Initials label inside circle */}
                                        <text x="0" y="4" className={styles.seatInitial} textAnchor="middle">
                                            {displayLabel}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}

                 {/* Dance Floor */}
                 <rect x={danceFloorX} y={danceFloorY} width={danceFloorWidth} height={danceFloorHeight} className={styles.danceFloor} />
                 <text x={danceFloorX + danceFloorWidth / 2} y={danceFloorY + danceFloorHeight / 2 + 5} className={styles.labelText} textAnchor="middle">
                     Dance
                 </text>
            </svg>

            {/* Link to Full Viewer Page */}
            {!fullView && (
                <div className={styles.fullViewLinkContainer}>
                    <Link href="/floorplan" className={styles.fullViewLinkButton} target="_blank" rel="noopener noreferrer" aria-label="Open full-screen floor plan viewer">
                        View Full Floor Plan
                    </Link>
                    <p className={styles.fullViewLinkNote}>(Opens interactive floor plan in a new tab)</p>
                </div>
            )}

            {/* *** Conditionally Render Tooltip *** */}
            {tooltipVisible && tooltipContent && (
                <div
                    className={styles.tooltip}
                    style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                    }}
                >
                    <div className={styles.tooltipName}>{tooltipContent.name}</div>
                    {/* Add other details - check if they exist */}
                    {tooltipContent.dietaryRestrictions && (
                         <div className={styles.tooltipDetail}>Diet: {tooltipContent.dietaryRestrictions}</div>
                    )}
                     {tooltipContent.accessibilityInfo && (
                         <div className={styles.tooltipDetail}>Access: {tooltipContent.accessibilityInfo}</div>
                    )}
                    {/* Add more fields as needed */}
                    {/* <div className={styles.tooltipDetail}>Guest ID: {tooltipContent.id}</div> */}
                    {/* <div className={styles.tooltipDetail}>Invitee ID: {tooltipContent.inviteeId}</div> */}
                </div>
            )}
        </div>
    );
}
