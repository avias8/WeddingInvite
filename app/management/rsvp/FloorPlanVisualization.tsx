// app/management/rsvp/FloorPlanVisualization.tsx (React-based SVG)
// Added Click-to-Assign/Unassign/Move functionality via Modal
// Updated to truncate full names in fullView for better fit
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './FloorPlanVisualization.module.css';
// Ensure Guest type includes all needed fields from DB (id, name, tableId, dietary, access, inviteeId)
import type { Guest, Table, Invitee } from '@/app/types';

// Interface for Table data including assigned guests array
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

/**
 * Truncates a name if it exceeds a maxLength, appending '...'.
 */
function truncateName(name: string, maxLength: number = 10): string {
    if (!name) return '';
    if (name.length > maxLength) {
        return name.substring(0, maxLength - 3) + "...";
    }
    return name;
}


// Define the structure for layout properties of each table in the SVG
interface TableLayout {
    id: number;         // Database Table ID
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: number;
    name: string;       // Database Table Name
    displayName: string;// Label for SVG
    owner: "Shared" | "Avi" | "Shakthi"; // Table owner
}

// Layout Coordinates & Data Mapping (Final version based on user DB IDs)
const TABLE_LAYOUTS: TableLayout[] = [
    { id: 1, name: "Head Table", displayName: "Head", x: 300, y: 50, width: 400, height: 40, capacity: 17, owner: "Shared" },
    { id: 2, name: "Table 1", displayName: "1", x: 820, y: 100, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 3, name: "Table 2", displayName: "2", x: 820, y: 250, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 4, name: "Table 3", displayName: "3", x: 820, y: 450, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 5, name: "Table 4", displayName: "4", x: 820, y: 600, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 6, name: "Table 5", displayName: "5", x: 820, y: 750, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 7, name: "Table 6", displayName: "6", x: 820, y: 950, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 8, name: "Table 7", displayName: "7", x: 820, y: 1100, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 14, name: "Table 13", displayName: "13", x: 680, y: 150, width: 50, height: 150, capacity: 9, owner: "Shakthi" },
    { id: 13, name: "Table 12", displayName: "12", x: 680, y: 300, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 12, name: "Table 11", displayName: "11", x: 680, y: 450, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 11, name: "Table 10", displayName: "10", x: 680, y: 650, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 10, name: "Table 9", displayName: "9", x: 680, y: 800, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 9, name: "Table 8", displayName: "8", x: 680, y: 1000, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 15, name: "Table 14", displayName: "14", x: 510, y: 400, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 16, name: "Table 15", displayName: "15", x: 510, y: 550, width: 50, height: 150, capacity: 8, owner: "Shakthi" },
    { id: 17, name: "Table 16", displayName: "16", x: 510, y: 700, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 18, name: "Table 17", displayName: "17", x: 510, y: 850, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 22, name: "Table 21", displayName: "21", x: 400, y: 400, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 21, name: "Table 20", displayName: "20", x: 400, y: 550, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 20, name: "Table 19", displayName: "19", x: 400, y: 700, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 19, name: "Table 18", displayName: "18", x: 400, y: 850, width: 50, height: 150, capacity: 9, owner: "Avi" },
    { id: 27, name: "Table 26", displayName: "26", x: 220, y: 150, width: 50, height: 150, capacity: 9, owner: "Avi" },
    { id: 26, name: "Table 25", displayName: "25", x: 220, y: 300, width: 50, height: 150, capacity: 9, owner: "Avi" },
    { id: 25, name: "Table 24", displayName: "24", x: 220, y: 450, width: 50, height: 150, capacity: 8, owner: "Avi" },
    { id: 24, name: "Table 23", displayName: "23", x: 220, y: 650, width: 50, height: 150, capacity: 9, owner: "Avi" },
    { id: 23, name: "Table 22", displayName: "22", x: 220, y: 800, width: 50, height: 150, capacity: 9, owner: "Avi" },
];

/**
 * Calculates seat positions.
 */
function calculateSeatPositions(layout: TableLayout): { x: number, y: number }[] {
    const positions: { x: number, y: number }[] = [];
    const seatRadius = 10; // Radius of the seat circle
    const numSeats = layout.capacity;
    const tableWidth = layout.width;
    const tableHeight = layout.height;

    // Determine if the table is oriented vertically or horizontally
    const isVertical = tableHeight > tableWidth;
    const longDim = isVertical ? tableHeight : tableWidth; // Longer dimension of the table
    const shortDim = isVertical ? tableWidth : tableHeight; // Shorter dimension of the table

    // Calculate number of seats on each of the two longer sides
    const seatsOnLongSide1 = Math.ceil(numSeats / 2);
    const seatsOnLongSide2 = Math.floor(numSeats / 2);

    // Calculate spacing between seats on each long side
    // Add 1 to the number of seats for spacing calculation to include space at ends
    const spacing1 = seatsOnLongSide1 > 0 ? longDim / (seatsOnLongSide1 + 1) : longDim;
    const spacing2 = seatsOnLongSide2 > 0 ? longDim / (seatsOnLongSide2 + 1) : longDim;

    for (let i = 0; i < numSeats; i++) {
        let sx = 0; // Seat x-coordinate relative to table's top-left
        let sy = 0; // Seat y-coordinate relative to table's top-left

        if (i < seatsOnLongSide1) { // Seats on the first long side
            const indexOnSide = i;
            if (isVertical) { // Vertical table
                sx = -seatRadius * 1.5; // Position to the left of the table
                sy = spacing1 * (indexOnSide + 1); // Distribute along the height
            } else { // Horizontal table
                sx = spacing1 * (indexOnSide + 1); // Distribute along the width
                sy = -seatRadius * 1.5; // Position above the table
            }
        } else { // Seats on the second long side
            const indexOnSide = i - seatsOnLongSide1;
            if (isVertical) { // Vertical table
                sx = shortDim + seatRadius * 1.5; // Position to the right of the table
                sy = spacing2 * (indexOnSide + 1); // Distribute along the height
            } else { // Horizontal table
                sx = spacing2 * (indexOnSide + 1); // Distribute along the width
                sy = shortDim + seatRadius * 1.5; // Position below the table
            }
        }
        positions.push({ x: sx, y: sy });
    }
    return positions;
}

// Define Props Interface for the component
interface FloorPlanVisualizationProps {
    fullView?: boolean;
}

// Define types for the modal target state
type ModalTarget =
    | { type: 'guest'; guest: Guest } // Clicked an occupied seat
    | { type: 'seat'; tableId: number; seatIndex: number }; // Clicked an empty seat

type ModalActionData =
    | { guestId: number; tableId: number } // For assign
    | { guestId: number } // For unassign
    | { guestId: number; newTableId: number }; // For move

/**
 * Renders an SVG floor plan visualization with assigned guest initials or truncated names,
 * hover tooltips, and click-to-assign/unassign functionality via a modal.
 */
export default function FloorPlanVisualization({ fullView = false }: FloorPlanVisualizationProps) {
    // State for all tables, including their assigned guests
    const [tables, setTables] = useState<TableWithGuests[]>([]);
    // State for guests not assigned to any table
    const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
    const [invitees, setInvitees] = useState<Invitee[]>([]); // State for invitee list
    // Loading and error states for data fetching
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // State for assignment/API errors
    const [assignError, setAssignError] = useState<string>("");

    // State for Tooltip
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [tooltipContent, setTooltipContent] = useState<Guest | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    // State for Assignment Action Modal
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch tables, guests, AND invitees
            const [resTables, resGuests, resInvitees] = await Promise.all([
                fetch('/api/tables'),
                fetch('/api/guests'),
                fetch('/api/invitees') // Fetch invitee data
            ]);

            // Check if all responses are ok
            if (!resTables.ok) throw new Error(`Failed to fetch tables: ${resTables.statusText}`);
            if (!resGuests.ok) throw new Error(`Failed to fetch guests: ${resGuests.statusText}`);
            if (!resInvitees.ok) throw new Error(`Failed to fetch invitees: ${resInvitees.statusText}`);

            const tablesData: TableWithGuests[] = await resTables.json();
            const allGuestsData: Guest[] = await resGuests.json();
            const inviteesData: Invitee[] = await resInvitees.json(); // Store invitee data

            // Map guests to their respective tables
            const guestMap: Record<number, Guest[]> = {};
            tablesData.forEach(table => {
                if (table && typeof table.id === 'number') {
                    // Ensure guests are correctly filtered and assigned
                    guestMap[table.id] = allGuestsData.filter(g => g.tableId === table.id) || [];
                }
            });

            // Set tables state with mapped guests
            setTables(tablesData.map(t => ({ ...t, guests: guestMap[t.id] || [] })));
            // Set unassigned guests state
            setUnassignedGuests(allGuestsData.filter(g => g.tableId === null));
            // Set invitees state
            setInvitees(inviteesData);

        } catch (err) {
            console.error("Error fetching floor plan data:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this useCallback will not change

    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData is stable due to its own empty dependency array

    // --- API Call Functions ---
    const assignGuest = async (guestId: number, tableId: number) => {
        // Find the target table to check capacity
        const targetTable = tables.find(t => t.id === tableId);
        // Find the guest being assigned (could be from unassigned or another table)
        const guestToAssign = [...unassignedGuests, ...tables.flatMap(t => t.guests)].find(g => g.id === guestId);

        if (!targetTable || !guestToAssign) {
            console.error("Target table or guest not found for assignment");
            setAssignError("Could not find table or guest.");
            setTimeout(() => setAssignError(""), 3000); // Clear error after 3 seconds
            return;
        }

        // Check capacity only if the guest is moving to a different table or from unassigned list
        if (guestToAssign.tableId !== tableId && targetTable.guests.length >= targetTable.capacity) {
            setAssignError(`Table "${targetTable.name}" is full (Capacity: ${targetTable.capacity}).`);
            setTimeout(() => setAssignError(""), 3000);
            return; // Stop assignment if table is full
        }

        setAssignError(""); // Clear previous errors
        try {
            const res = await fetch("/api/tables/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guestId, tableId }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to assign guest");
            }
            // Refetch data to ensure consistency after successful assignment
            await fetchData();
        } catch (error) {
            console.error("Error assigning guest:", error);
            const errMsg = error instanceof Error ? error.message : "Error assigning guest";
            setAssignError(errMsg);
            setTimeout(() => setAssignError(""), 3000); // Clear error after 3s
        }
    };

    const unassignGuest = async (guestId: number) => {
        setAssignError(""); // Clear previous errors
        try {
            const res = await fetch("/api/tables/unassign", {
                method: "DELETE", // Use DELETE for unassigning as per API design
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guestId }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to unassign guest");
            }
            // Refetch data to ensure consistency after successful unassignment
            await fetchData();
        } catch (error) {
            console.error("Error unassigning guest:", error);
            const errMsg = error instanceof Error ? error.message : "Error unassigning guest";
            setAssignError(errMsg);
            setTimeout(() => setAssignError(""), 3000); // Clear error after 3s
        }
    };

    // --- Event Handlers ---
    const handleMouseEnter = (event: React.MouseEvent, guest: Guest) => {
        setTooltipContent(guest);
        setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 }); // Position tooltip relative to cursor
        setTooltipVisible(true);
    };

    const handleMouseLeave = () => {
        setTooltipVisible(false);
        setTooltipContent(null);
    };

    const handleSeatClick = (event: React.MouseEvent, tableId: number, seatIndex: number, guest: Guest | null) => {
        event.stopPropagation(); // Prevent triggering clicks on elements behind the seat
        if (guest) {
            // Clicked an occupied seat
            setModalTarget({ type: 'guest', guest: guest });
        } else {
            // Clicked an empty seat
            setModalTarget({ type: 'seat', tableId: tableId, seatIndex: seatIndex });
        }
        setIsModalOpen(true); // Open the assignment/action modal
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalTarget(null);
    };

    // Handler for actions (assign, unassign, move) within the modal
    const handleModalAction = async (action: 'assign' | 'unassign' | 'move', data: ModalActionData) => {
        closeModal(); // Close modal first
        // Type guards to ensure data matches the action and call appropriate API function
        if (action === 'assign' && 'guestId' in data && 'tableId' in data) {
            await assignGuest(data.guestId, data.tableId);
        } else if (action === 'unassign' && 'guestId' in data && !('tableId' in data) && !('newTableId' in data)) {
            await unassignGuest(data.guestId);
        } else if (action === 'move' && 'guestId' in data && 'newTableId' in data) {
            await assignGuest(data.guestId, data.newTableId); // Re-use assignGuest for moving
        } else {
            console.error("Invalid action/data combination in handleModalAction", action, data);
        }
    };


    // --- Render Logic ---
    if (loading) return <div className={styles.loading}>Loading Floor Plan...</div>;
    if (error) return <div className={styles.error}>Error loading data: {error}</div>;

    // Define Dance Floor coordinates for SVG
    const danceFloorX = 350;
    const danceFloorY = 130;
    const danceFloorWidth = 250;
    const danceFloorHeight = 250;

    // Determine container class based on the fullView prop for styling
    const containerClasses = [styles.visualizationContainer];
    if (!fullView) {
        containerClasses.push(styles.constrainedWidth); // Apply constrained width if not in full view
    }
    const containerClassName = containerClasses.join(' ');

    return (
        <div className={containerClassName} style={{ position: 'relative' }}> {/* Ensure parent is relative for absolute positioned children */}
            {!fullView && <h2 className={styles.mainTitle}>Floor Plan Visualization</h2>}

            {/* Legend for table ownership, positioned absolutely in the top right */}
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(255,255,255,0.95)', // Semi-transparent white background
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: '8px 16px',
                zIndex: 10, // Ensure legend is above SVG
                display: 'flex',
                flexDirection: 'column',
                gap: 4, // Space between legend items
                minWidth: 120 // Minimum width for the legend box
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: '#b3d4fc', // Avi's table color
                        border: '1px solid #7bb1e7'
                    }} />
                    <span>Avi&apos;s Tables</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: '#ffd6b3', // Shakthi's table color
                        border: '1px solid #e7b97b'
                    }} />
                    <span>Shakthi&apos;s Tables</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: '#e0e0e0', // Shared table color
                        border: '1px solid #bdbdbd'
                    }} />
                    <span>Shared Table</span>
                </div>
            </div>

            {/* Display assignment errors as a popup */}
            {assignError && (
                <div className={styles.assignErrorPopup}>
                    <span role="img" aria-label="error">😢</span> {assignError}
                </div>
            )}

            <svg viewBox="0 0 1000 1350" className={styles.floorPlanSvg}>
                {/* Static SVG elements for the venue layout */}
                <rect x="0" y="0" width="1000" height="1350" className={styles.venueBackground} />
                <rect x="20" y="20" width="960" height="1290" className={styles.outerBorder} />
                {/* Wall labels */}
                <text x="500" y="15" className={styles.wallLabel} textAnchor="middle">East Wall Open</text>
                <text x="970" y="585" className={styles.wallLabel} textAnchor="middle" transform="rotate(90, 970, 600)">South Wall Open</text>
                {/* Venue features like DJ booth, Buffet, etc. */}
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
                    <circle cx="280" cy="1290" r="10" className={styles.garbageBin} />
                    <circle cx="310" cy="1290" r="10" className={styles.garbageBin} />
                    <text x="300" y="1265" className={styles.labelText} textAnchor="middle">Garbage & Recycling</text>
                </g>

                {/* Render Tables and Seats Dynamically */}
                {TABLE_LAYOUTS.map(layout => {
                    // Find the corresponding table data from state, including guests
                    const currentTableData = tables.find(t => t.id === layout.id);
                    const guestsAtTable = currentTableData?.guests || []; // Guests assigned to this table
                    const seatPositions = calculateSeatPositions(layout); // Calculate positions for seats

                    // Determine table color class based on owner
                    const tableOwnerClass =
                        layout.owner === "Avi"
                            ? styles.tableAvi
                            : layout.owner === "Shakthi"
                                ? styles.tableShakthi
                                : styles.tableShared;

                    return (
                        <g key={layout.id} transform={`translate(${layout.x}, ${layout.y})`} className={styles.tableGroup}>
                            {/* Table Rectangle with owner-specific styling */}
                            <rect x={0} y={0} width={layout.width} height={layout.height}
                                className={`${styles.tableRect} ${tableOwnerClass}`} />
                            {/* Table Display Name/Number */}
                            <text x={layout.width / 2} y={layout.height / 2 + 5} className={styles.tableLabel} textAnchor="middle">
                                {layout.displayName}
                            </text>
                            {/* Render Seats for the table */}
                            {seatPositions.map((pos, index) => {
                                const guest = guestsAtTable[index]; // Guest at this seat, if any
                                // MODIFICATION: Display full name (truncated) in fullView, otherwise initials
                                let displayLabel;
                                if (fullView && guest) {
                                    displayLabel = truncateName(guest.name, 7); // Max 7 chars for full name view
                                } else {
                                    displayLabel = guest ? getInitials(guest.name) : '';
                                }
                                const seatClass = guest ? styles.seatOccupied : styles.seatEmpty;
                                const seatKey = `seat-${layout.id}-${index}`;
                                // MODIFICATION: Apply conditional text class for styling
                                const textClass = fullView && guest ? styles.seatFullName : styles.seatInitial;


                                return (
                                    <g
                                        key={seatKey}
                                        transform={`translate(${pos.x}, ${pos.y})`}
                                        className={styles.seatGroup}
                                        onMouseEnter={(e) => guest && handleMouseEnter(e, guest)}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={(e) => handleSeatClick(e, layout.id, index, guest || null)}
                                        style={{ cursor: 'pointer' }} // Indicate clickable seats
                                    >
                                        {guest && <title>{guest.name}</title>} {/* Tooltip with full name */}
                                        <circle cx="0" cy="0" r="10" className={seatClass} />
                                        {/* Display guest name/initials */}
                                        <text x="0" y="0" className={textClass} textAnchor="middle">
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

            {/* Link to Full Viewer Page (only if not already in fullView) */}
            {!fullView && (
                <div className={styles.fullViewLinkContainer}>
                    <Link href="/floorplan" className={styles.fullViewLinkButton} target="_blank" rel="noopener noreferrer" aria-label="Open full-screen floor plan viewer">
                        View Full Floor Plan
                    </Link>
                    <p className={styles.fullViewLinkNote}>(Opens interactive floor plan in a new tab)</p>
                </div>
            )}

            {/* Conditionally Render Tooltip for guest details on hover */}
            {tooltipVisible && tooltipContent && (
                <div
                    className={styles.tooltip}
                    style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
                >
                    <div className={styles.tooltipName}>{tooltipContent.name}</div>
                    {tooltipContent.dietaryRestrictions && (
                        <div className={styles.tooltipDetail}>Diet: {tooltipContent.dietaryRestrictions}</div>
                    )}
                    {tooltipContent.accessibilityInfo && (
                        <div className={styles.tooltipDetail}>Access: {tooltipContent.accessibilityInfo}</div>
                    )}
                </div>
            )}

            {/* Assignment Modal for assigning/unassigning/moving guests */}
            {isModalOpen && modalTarget && (
                <AssignmentActionModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    target={modalTarget}
                    unassignedGuests={unassignedGuests}
                    tables={tables}
                    invitees={invitees} // Pass invitee data to the modal
                    onAssign={handleModalAction}
                    onUnassign={handleModalAction}
                    onMove={handleModalAction}
                />
            )}
        </div>
    );
}

// --- Assignment Action Modal Component (Updated to show COMPREHENSIVE Invitee details) ---
interface AssignmentActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: ModalTarget;
    unassignedGuests: Guest[];
    tables: TableWithGuests[];
    invitees: Invitee[]; // Added invitees prop type
    onAssign: (action: 'assign', data: { guestId: number; tableId: number }) => void;
    onUnassign: (action: 'unassign', data: { guestId: number }) => void;
    onMove: (action: 'move', data: { guestId: number; newTableId: number }) => void;
}

function AssignmentActionModal({
    isOpen,
    onClose,
    target,
    unassignedGuests,
    tables,
    invitees, // Destructure invitees
    onAssign,
    onUnassign,
    onMove
}: AssignmentActionModalProps) {

    const [selectedGuestId, setSelectedGuestId] = useState<string>('');
    const [selectedMoveTableId, setSelectedMoveTableId] = useState<string>('');

    // Reset local state when modal opens or target changes to ensure fresh selections
    useEffect(() => {
        if (isOpen && target?.type === 'seat') { // If opening for an empty seat
            // Pre-select the first unassigned guest if available
            setSelectedGuestId(unassignedGuests.length > 0 ? unassignedGuests[0].id.toString() : '');
        }
        if (isOpen && target?.type === 'guest') { // If opening for an occupied seat (to move guest)
            // Find the first available table to move to (not the current one and has capacity)
            const firstAvailableTable = tables.find(t => t.id !== target.guest.tableId && t.guests.length < t.capacity);
            setSelectedMoveTableId(firstAvailableTable ? firstAvailableTable.id.toString() : '');
        }
        if (!isOpen || !target) { // If modal is closed or no target, reset selections
            setSelectedGuestId('');
            setSelectedMoveTableId('');
        }
    }, [isOpen, target, unassignedGuests, tables]); // Dependencies for this effect


    if (!isOpen) return null; // Don't render modal if not open

    // --- Helper Function to Format Dates for display ---
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            // Format date to a readable local string (e.g., "May 29, 2024, 10:00 AM")
            return new Date(dateString).toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        } catch {
            return 'Invalid Date'; // Handle potential errors in date parsing
        }
    };

    // --- Helper Function to Format RSVP Status for display ---
    const formatRsvpStatus = (status: boolean | null | undefined) => {
        if (status === true) return 'Yes';
        if (status === false) return 'No';
        return 'Pending'; // Default if null or undefined
    };


    // Case 1: Clicked an OCCUPIED seat (target is a guest)
    if (target.type === 'guest') {
        const currentGuest = target.guest;
        const currentTable = tables.find(t => t.id === currentGuest.tableId);
        const invitee = invitees.find(inv => inv.id === currentGuest.inviteeId); // Find parent Invitee for party details
        // Filter tables available for moving: not the current table and has capacity
        const availableMoveTables = tables.filter(t =>
            t.id !== currentGuest.tableId && t.guests.length < t.capacity
        );

        return (
            <div className={styles.modalBackground} onClick={onClose}> {/* Click outside modal to close */}
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside modal */}
                    <h3 className={styles.modalTitle}>{currentGuest.name}</h3>

                    {/* Guest Specific Details Section */}
                    <div className={styles.modalGuestDetails}>
                        <p>Assigned Table: {currentTable?.name || 'Unassigned?'}</p>
                        {currentGuest.dietaryRestrictions && <p>Guest Diet: {currentGuest.dietaryRestrictions}</p>}
                        {currentGuest.accessibilityInfo && <p>Guest Access: {currentGuest.accessibilityInfo}</p>}
                    </div>

                    {/* Invitee (Party) Details Section - EXPANDED */}
                    {invitee && (
                        <div className={styles.modalInviteeSection}>
                            <h4>Party Details (Invitee: {invitee.name})</h4>
                            <p>Email: {invitee.email || 'N/A'}</p>
                            <p>RSVP Status: {formatRsvpStatus(invitee.isAttending)}</p>
                            <p>Party Size: {invitee.guests} / {invitee.maxInvites}</p>
                            <p>Responded At: {formatDate(invitee.respondedAt)}</p>
                            {invitee.dietaryRestrictions && <p>Party Diet Notes: {invitee.dietaryRestrictions}</p>}
                            {invitee.accessibilityInfo && <p>Party Access Notes: {invitee.accessibilityInfo}</p>}
                            {invitee.comments && <p>Comments: {invitee.comments}</p>}
                            {invitee.songRequests && <p>Song Requests: {invitee.songRequests}</p>}
                            <p>Email Sent: {formatDate(invitee.emailSentAt)}</p>
                            <p>Email Opened: {formatDate(invitee.emailOpenedAt)}</p>
                        </div>
                    )}
                    {/* ************************************** */}


                    {/* Move Guest Section */}
                    <div className={styles.modalSection}>
                        <h4>Move Guest</h4>
                        {availableMoveTables.length > 0 ? (
                            <>
                                <select value={selectedMoveTableId} onChange={(e) => setSelectedMoveTableId(e.target.value)} className={styles.modalSelect}>
                                    <option value="" disabled>Select new table...</option>
                                    {/* Populate dropdown with available tables */}
                                    {availableMoveTables.map(table => (
                                        <option key={table.id} value={table.id}>
                                            {table.name} ({table.guests.length}/{table.capacity})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => onMove('move', { guestId: currentGuest.id, newTableId: parseInt(selectedMoveTableId) })}
                                    disabled={!selectedMoveTableId} // Disable if no table is selected
                                    className={styles.modalButton}
                                >
                                    Move Guest
                                </button>
                            </>
                        ) : (<p className={styles.modalInfo}>No other tables with available space.</p>)}
                    </div>

                    {/* Unassign Guest Section */}
                    <div className={styles.modalSection}>
                        <h4>Unassign Guest</h4>
                        <button
                            onClick={() => onUnassign('unassign', { guestId: currentGuest.id })}
                            className={`${styles.modalButton} ${styles.unassignButton}`} // Specific styling for unassign button
                        >
                            Unassign (Send to List)
                        </button>
                    </div>

                    {/* Cancel Button */}
                    <button onClick={onClose} className={`${styles.modalButton} ${styles.cancelButton}`}>Cancel</button>
                </div>
            </div>
        );
    }

    // Case 2: Clicked an EMPTY seat (target is a seat)
    if (target.type === 'seat') {
        const targetTable = tables.find(t => t.id === target.tableId);
        const isTableFull = targetTable ? targetTable.guests.length >= targetTable.capacity : true;
        return (
            <div className={styles.modalBackground} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h3 className={styles.modalTitle}>Assign Guest to {targetTable?.name || `Table ID ${target.tableId}`}</h3>
                    {isTableFull ? (<p className={styles.modalWarning}>This table is full!</p>)
                        : unassignedGuests.length === 0 ? (<p className={styles.modalInfo}>No unassigned guests available.</p>)
                            : ( // If table has space and there are unassigned guests
                                <>
                                    <select value={selectedGuestId} onChange={(e) => setSelectedGuestId(e.target.value)} className={styles.modalSelect}>
                                        {/* Populate dropdown with unassigned guests */}
                                        {unassignedGuests.map(guest => (
                                            <option key={guest.id} value={guest.id}>
                                                {guest.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => onAssign('assign', { guestId: parseInt(selectedGuestId), tableId: target.tableId })}
                                        disabled={!selectedGuestId} // Disable if no guest is selected
                                        className={styles.modalButton}
                                    >
                                        Assign Guest
                                    </button>
                                </>
                            )}
                    <button onClick={onClose} className={`${styles.modalButton} ${styles.cancelButton}`}>Cancel</button>
                </div>
            </div>
        );
    }

    return null; // Should not happen if target is always set when modal is open
}