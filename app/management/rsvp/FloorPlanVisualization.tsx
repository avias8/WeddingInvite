// app/management/rsvp/FloorPlanVisualization.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from './FloorPlanVisualization.module.css';
import type { Guest, Table, Invitee } from '@/app/types';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // For data table PDF
import html2canvas from 'html2canvas'; // For visual PDF

// Interface for Table data including assigned guests array
interface TableWithGuests extends Table {
    guests: Guest[];
}

// Define the structure for layout properties of each table in the SVG
interface TableLayout {
    id: number;         // Database Table ID
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: number;
    name: string;       // Database Table Name (e.g., "Head Table", "Table 1")
    displayName: string;// Label for SVG and export (e.g., "Head", "1")
    owner: "Shared" | "Avi" | "Shakthi"; // Table owner
}

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

function getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    const firstInitial = parts[0].substring(0, 1);
    const lastInitial = parts[parts.length - 1].substring(0, 1);
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

function truncateName(name: string, maxLength: number = 10): string {
    if (!name) return '';
    if (name.length > maxLength) {
        return name.substring(0, maxLength - 3) + "...";
    }
    return name;
}

function calculateSeatPositions(layout: TableLayout): { x: number, y: number }[] {
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
            const indexOnSide = i;
            if (isVertical) {
                sx = -seatRadius * 1.5;
                sy = spacing1 * (indexOnSide + 1);
            } else {
                sx = spacing1 * (indexOnSide + 1);
                sy = -seatRadius * 1.5;
            }
        } else {
            const indexOnSide = i - seatsOnLongSide1;
            if (isVertical) {
                sx = shortDim + seatRadius * 1.5;
                sy = spacing2 * (indexOnSide + 1);
            } else {
                sx = spacing2 * (indexOnSide + 1);
                sy = shortDim + seatRadius * 1.5;
            }
        }
        positions.push({ x: sx, y: sy });
    }
    return positions;
}


interface FloorPlanVisualizationProps {
    fullView?: boolean;
}

type ModalTarget =
    | { type: 'guest'; guest: Guest }
    | { type: 'seat'; tableId: number; seatIndex: number };

type ModalActionData =
    | { guestId: number; tableId: number }
    | { guestId: number }
    | { guestId: number; newTableId: number };

export default function FloorPlanVisualization({ fullView = false }: FloorPlanVisualizationProps) {
    const [tables, setTables] = useState<TableWithGuests[]>([]);
    const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
    const [invitees, setInvitees] = useState<Invitee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [assignError, setAssignError] = useState<string>("");
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [tooltipContent, setTooltipContent] = useState<Guest | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
    const svgRef = useRef<SVGSVGElement>(null); // Ref for the SVG element
    const visualExportWrapperRef = useRef<HTMLDivElement>(null); // Ref for the container holding the SVG

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [resTables, resGuests, resInvitees] = await Promise.all([
                fetch('/api/tables'),
                fetch('/api/guests'),
                fetch('/api/invitees')
            ]);

            if (!resTables.ok) throw new Error(`Failed to fetch tables: ${resTables.statusText}`);
            if (!resGuests.ok) throw new Error(`Failed to fetch guests: ${resGuests.statusText}`);
            if (!resInvitees.ok) throw new Error(`Failed to fetch invitees: ${resInvitees.statusText}`);

            const tablesData: TableWithGuests[] = await resTables.json();
            const allGuestsData: Guest[] = await resGuests.json();
            const inviteesData: Invitee[] = await resInvitees.json();

            const guestMap: Record<number, Guest[]> = {};
            tablesData.forEach(table => {
                if (table && typeof table.id === 'number') {
                    guestMap[table.id] = allGuestsData.filter(g => g.tableId === table.id) || [];
                }
            });

            setTables(tablesData.map(t => ({ ...t, guests: guestMap[t.id] || [] })));
            setUnassignedGuests(allGuestsData.filter(g => g.tableId === null));
            setInvitees(inviteesData);

        } catch (err) {
            console.error("Error fetching floor plan data:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const assignGuest = async (guestId: number, tableId: number) => {
        const targetTableLayout = TABLE_LAYOUTS.find(l => l.id === tableId);
        const targetTableData = tables.find(t => t.id === tableId);
        const guestToAssign = [...unassignedGuests, ...tables.flatMap(t => t.guests)].find(g => g.id === guestId);

        if (!targetTableLayout || !targetTableData || !guestToAssign) {
            setAssignError("Target table definition, data or guest not found.");
            setTimeout(() => setAssignError(""), 3000);
            return;
        }
        if (guestToAssign.tableId !== tableId && targetTableData.guests.length >= targetTableLayout.capacity) {
             setAssignError(`Table "${targetTableLayout.name}" is full (Capacity: ${targetTableLayout.capacity}).`);
            setTimeout(() => setAssignError(""), 3000);
            return;
        }
        setAssignError("");
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
            await fetchData();
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Error assigning guest";
            setAssignError(errMsg);
            setTimeout(() => setAssignError(""), 3000);
        }
    };

    const unassignGuest = async (guestId: number) => {
        setAssignError("");
        try {
            const res = await fetch("/api/tables/unassign", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ guestId }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to unassign guest");
            }
            await fetchData();
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Error unassigning guest";
            setAssignError(errMsg);
            setTimeout(() => setAssignError(""), 3000);
        }
    };
    
    const handleMouseEnter = (event: React.MouseEvent, guest: Guest) => {
        setTooltipContent(guest);
        setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
        setTooltipVisible(true);
    };

    const handleMouseLeave = () => {
        setTooltipVisible(false);
        setTooltipContent(null);
    };

    const handleSeatClick = (event: React.MouseEvent, tableId: number, seatIndex: number, guest: Guest | null) => {
        event.stopPropagation();
        if (guest) {
            setModalTarget({ type: 'guest', guest: guest });
        } else {
            setModalTarget({ type: 'seat', tableId: tableId, seatIndex: seatIndex });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalTarget(null);
    };

    const handleModalAction = async (action: 'assign' | 'unassign' | 'move', data: ModalActionData) => {
        closeModal();
        if (action === 'assign' && 'guestId' in data && 'tableId' in data) {
            await assignGuest(data.guestId, data.tableId);
        } else if (action === 'unassign' && 'guestId' in data && !('tableId' in data) && !('newTableId' in data)) {
            await unassignGuest(data.guestId);
        } else if (action === 'move' && 'guestId' in data && 'newTableId' in data) {
            await assignGuest(data.guestId, data.newTableId);
        } else {
            console.error("Invalid action/data combination in handleModalAction", action, data);
        }
    };

    const handleExportSeatingChart = () => { 
        let exportText = "";
        const sortedTables = [...tables].sort((a, b) => {
            const layoutA = TABLE_LAYOUTS.find(l => l.id === a.id);
            const layoutB = TABLE_LAYOUTS.find(l => l.id === b.id);
            const nameA = layoutA ? layoutA.displayName : a.name;
            const nameB = layoutB ? layoutB.displayName : b.name;
            const numA = parseInt(nameA.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(nameB.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB)) { return numA - numB; }
            return nameA.localeCompare(nameB);
        });
        for (const table of sortedTables) {
            if (table.guests && table.guests.length > 0) {
                const layout = TABLE_LAYOUTS.find(l => l.id === table.id);
                let tableExportName = layout ? layout.displayName.toUpperCase() : table.name.toUpperCase();
                if (layout && /^\d+$/.test(layout.displayName)) {
                    tableExportName = `TABLE ${layout.displayName.toUpperCase()}`;
                }
                exportText += `${tableExportName}:\n`;
                for (const guest of table.guests) { exportText += `${guest.name}\n`; }
                exportText += "\n";
            }
        }
        if (unassignedGuests.length > 0) {
            exportText += "UNASSIGNED GUESTS:\n";
            for (const guest of unassignedGuests) { exportText += `${guest.name}\n`; }
            exportText += "\n";
        }
        if (!exportText.trim()) { 
            // Use a custom alert or notification system if available, instead of window.alert
            console.warn("No guests assigned to tables to export."); 
            setAssignError("No guests assigned to tables to export."); // Example: use existing error display
            setTimeout(() => setAssignError(""), 3000);
            return; 
        }
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'seating_chart.txt');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else { 
            console.warn("Text export is not supported in your browser.");
            setAssignError("Text export is not supported in your browser.");
            setTimeout(() => setAssignError(""), 3000);
        }
    };

    const handleExportSeatingChartCSV = () => {
        const csvRows: string[] = [];
        const header = [
            "Table", "Seat #", "Guest Name", "Guest Dietary", "Guest Accessibility",
            "Invitee Name", "Invitee Email", "RSVP Status", "Party Size", "Party Max",
            "Party Dietary", "Party Accessibility", "Comments", "Song Requests"
        ];
        csvRows.push(header.map(h => `"${h.replace(/"/g, '""')}"`).join(",")); // Header row, quoted

        const sortedTables = [...tables].sort((a, b) => {
            const layoutA = TABLE_LAYOUTS.find(l => l.id === a.id);
            const layoutB = TABLE_LAYOUTS.find(l => l.id === b.id);
            const nameA = layoutA ? layoutA.displayName : a.name;
            const nameB = layoutB ? layoutB.displayName : b.name;
            const numA = parseInt(nameA.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(nameB.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB)) { return numA - numB; }
            return nameA.localeCompare(nameB);
        });

        for (const table of sortedTables) {
            const layout = TABLE_LAYOUTS.find(l => l.id === table.id);
            const tableExportName = layout ? layout.displayName : table.name;
            if (table.guests && table.guests.length > 0) {
                table.guests.forEach((guest, idx) => {
                    const invitee = invitees.find(inv => inv.id === guest.inviteeId);
                    const row = [
                        tableExportName,
                        idx + 1,
                        guest.name || "",
                        guest.dietaryRestrictions || "",
                        guest.accessibilityInfo || "",
                        invitee?.name || "",
                        invitee?.email || "",
                        invitee?.isAttending === true ? "Yes" : invitee?.isAttending === false ? "No" : "Pending",
                        invitee?.guests ?? "",
                        invitee?.maxInvites ?? "",
                        invitee?.dietaryRestrictions || "",
                        invitee?.accessibilityInfo || "",
                        invitee?.comments || "",
                        invitee?.songRequests || ""
                    ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Quote all fields
                    csvRows.push(row.join(","));
                });
            }
        }

        if (unassignedGuests.length > 0) {
            unassignedGuests.forEach(guest => {
                const invitee = invitees.find(inv => inv.id === guest.inviteeId);
                const row = [
                    "UNASSIGNED", "",
                    guest.name || "",
                    guest.dietaryRestrictions || "",
                    guest.accessibilityInfo || "",
                    invitee?.name || "",
                    invitee?.email || "",
                    invitee?.isAttending === true ? "Yes" : invitee?.isAttending === false ? "No" : "Pending",
                    invitee?.guests ?? "",
                    invitee?.maxInvites ?? "",
                    invitee?.dietaryRestrictions || "",
                    invitee?.accessibilityInfo || "",
                    invitee?.comments || "",
                    invitee?.songRequests || ""
                ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Quote all fields
                csvRows.push(row.join(","));
            });
        }

        if (csvRows.length <= 1) { // Only header
            console.warn("No guests assigned to tables or unassigned to export for CSV.");
            setAssignError("No guests assigned to tables or unassigned to export for CSV.");
            setTimeout(() => setAssignError(""), 3000);
            return;
        }
        const csvContent = csvRows.join("\r\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'seating_chart.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else { 
            console.warn("CSV export is not supported in your browser.");
            setAssignError("CSV export is not supported in your browser.");
            setTimeout(() => setAssignError(""), 3000);
        }
    };

    const handleExportSeatingChartExcel = () => {
        const rows: (string | number)[][] = [];
        const header = [
            "Table", "Seat #", "Guest Name", "Guest Dietary", "Guest Accessibility",
            "Invitee Name", "Invitee Email", "RSVP Status", "Party Size", "Party Max",
            "Party Dietary", "Party Accessibility", "Comments", "Song Requests"
        ];
        rows.push(header);

        const sortedTables = [...tables].sort((a, b) => {
            const layoutA = TABLE_LAYOUTS.find(l => l.id === a.id);
            const layoutB = TABLE_LAYOUTS.find(l => l.id === b.id);
            const nameA = layoutA ? layoutA.displayName : a.name;
            const nameB = layoutB ? layoutB.displayName : b.name;
            const numA = parseInt(nameA.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(nameB.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB)) { return numA - numB; }
            return nameA.localeCompare(nameB);
        });

        for (const table of sortedTables) {
            const layout = TABLE_LAYOUTS.find(l => l.id === table.id);
            const tableExportName = layout ? layout.displayName : table.name;
            if (table.guests && table.guests.length > 0) {
                table.guests.forEach((guest, idx) => {
                    const invitee = invitees.find(inv => inv.id === guest.inviteeId);
                    rows.push([
                        tableExportName, idx + 1, guest.name || "",
                        guest.dietaryRestrictions || "", guest.accessibilityInfo || "",
                        invitee?.name || "", invitee?.email || "",
                        invitee?.isAttending === true ? "Yes" : invitee?.isAttending === false ? "No" : "Pending",
                        invitee?.guests ?? "", invitee?.maxInvites ?? "",
                        invitee?.dietaryRestrictions || "", invitee?.accessibilityInfo || "",
                        invitee?.comments || "", invitee?.songRequests || ""
                    ]);
                });
            }
        }

        if (unassignedGuests.length > 0) {
            unassignedGuests.forEach(guest => {
                const invitee = invitees.find(inv => inv.id === guest.inviteeId);
                rows.push([
                    "UNASSIGNED", "", guest.name || "",
                    guest.dietaryRestrictions || "", guest.accessibilityInfo || "",
                    invitee?.name || "", invitee?.email || "",
                    invitee?.isAttending === true ? "Yes" : invitee?.isAttending === false ? "No" : "Pending",
                    invitee?.guests ?? "", invitee?.maxInvites ?? "",
                    invitee?.dietaryRestrictions || "", invitee?.accessibilityInfo || "",
                    invitee?.comments || "", invitee?.songRequests || ""
                ]);
            });
        }
        
        if (rows.length <= 1) { // Only header
            console.warn("No guests assigned to tables or unassigned to export for Excel.");
            setAssignError("No guests assigned to tables or unassigned to export for Excel.");
            setTimeout(() => setAssignError(""), 3000);
            return;
        }
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Seating Chart");
        XLSX.writeFile(workbook, "seating_chart.xlsx");
    };

    const handleExportSeatingChartPDF = () => { // Data PDF
        if (loading) { 
            setAssignError("Data is still loading. Please wait and try again."); 
            setTimeout(() => setAssignError(""), 3000);
            return; 
        }
        if (error) { 
            setAssignError("Cannot export PDF due to a data loading error."); 
            setTimeout(() => setAssignError(""), 3000);
            return; 
        }
        if (!TABLE_LAYOUTS || TABLE_LAYOUTS.length === 0) { 
            setAssignError("Table layout configuration is missing."); 
            setTimeout(() => setAssignError(""), 3000);
            return; 
        }

        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text("Wedding Seating Chart - Guest List", 14, 16);

        const tableRows: (string | number)[][] = [];
        const header = [
            "Table", "Seat #", "Guest Name", "Guest Dietary", "Guest Accessibility",
            "Invitee Name", "Invitee Email", "RSVP Status", "Party Size", "Party Max",
            "Party Dietary", "Party Accessibility", "Comments", "Song Requests"
        ];

        const sortedTables = [...tables].sort((a, b) => {
            const layoutA = TABLE_LAYOUTS.find(l => l.id === a.id);
            const layoutB = TABLE_LAYOUTS.find(l => l.id === b.id);
            const nameA = layoutA ? layoutA.displayName : a.name;
            const nameB = layoutB ? layoutB.displayName : b.name;
            const numA = parseInt(nameA.replace(/[^0-9]/g, ''), 10);
            const numB = parseInt(nameB.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB)) { return numA - numB; }
            return nameA.localeCompare(nameB);
        });

        for (const table of sortedTables) {
            const layout = TABLE_LAYOUTS.find(l => l.id === table.id);
            const tableExportName = layout ? layout.displayName : table.name;
            if (table.guests && table.guests.length > 0) {
                table.guests.forEach((guest, idx) => {
                    const invitee = invitees.find(inv => inv.id === guest.inviteeId);
                    tableRows.push([
                        tableExportName, idx + 1, guest.name || "",
                        guest.dietaryRestrictions || "", guest.accessibilityInfo || "",
                        invitee?.name || "", invitee?.email || "",
                        invitee?.isAttending === true ? "Yes" : invitee?.isAttending === false ? "No" : "Pending",
                        invitee?.guests ?? "", invitee?.maxInvites ?? "",
                        invitee?.dietaryRestrictions || "", invitee?.accessibilityInfo || "",
                        invitee?.comments || "", invitee?.songRequests || ""
                    ]);
                });
            }
        }

        if (unassignedGuests.length > 0) {
            unassignedGuests.forEach(guest => {
                const invitee = invitees.find(inv => inv.id === guest.inviteeId);
                tableRows.push([
                    "UNASSIGNED", "", guest.name || "",
                    guest.dietaryRestrictions || "", guest.accessibilityInfo || "",
                    invitee?.name || "", invitee?.email || "",
                    invitee?.isAttending === true ? "Yes" : invitee?.isAttending === false ? "No" : "Pending",
                    invitee?.guests ?? "", invitee?.maxInvites ?? "",
                    invitee?.dietaryRestrictions || "", invitee?.accessibilityInfo || "",
                    invitee?.comments || "", invitee?.songRequests || ""
                ]);
            });
        }
        
        if (tableRows.length === 0) { 
            setAssignError("No guest data available to export for PDF."); 
            setTimeout(() => setAssignError(""), 3000);
            return; 
        }

        try {
            autoTable(doc, {
                head: [header],
                body: tableRows,
                startY: 22,
                styles: { fontSize: 7, cellPadding: 1.5 },
                headStyles: { fillColor: [41, 128, 185], fontSize: 7, cellPadding: 1.5 },
                columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 10 }, 2: { cellWidth: 25 } },
                margin: { top: 15, right: 7, bottom: 10, left: 7 },
            });
            doc.save("seating_chart_data.pdf");
        } catch (e) {
            console.error("Error during PDF (data) generation:", e);
            setAssignError("An error occurred while generating the data PDF.");
            setTimeout(() => setAssignError(""), 3000);
        }
    };

    const handleExportVisualToPDF = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const currentButton = event.currentTarget;
        const originalButtonText = currentButton.innerText;

        const exportTargetElement = visualExportWrapperRef.current; // Use the wrapper div ref

        if (!exportTargetElement) {
            // Use a custom alert or notification system if available
            console.error("Visual export target element ref (visualExportWrapperRef) is null.");
            setAssignError("Floor plan visual export target element not found. Cannot export visual.");
            setTimeout(() => setAssignError(""), 3000);
            return;
        }
        
        currentButton.innerText = "Generating PDF...";
        currentButton.disabled = true;

        try {
            console.log("Attempting html2canvas with target:", exportTargetElement);
            const canvas = await html2canvas(exportTargetElement, { // Target the wrapper div
                scale: 2,
                logging: true, 
                useCORS: true, 
                allowTaint: false, 
                backgroundColor: '#ffffff',
            });
            console.log("html2canvas processing finished.");

            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: 'a4' 
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.width / canvas.height;
            let imgPdfWidth, imgPdfHeight;

            if ((pdfWidth / canvasAspectRatio) <= pdfHeight) { 
                imgPdfWidth = pdfWidth;
                imgPdfHeight = pdfWidth / canvasAspectRatio;
            } else { 
                imgPdfHeight = pdfHeight;
                imgPdfWidth = pdfHeight * canvasAspectRatio;
            }
            
            const xOffset = (pdfWidth - imgPdfWidth) / 2;
            const yOffset = (pdfHeight - imgPdfHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgPdfWidth, imgPdfHeight);
            pdf.save('floor_plan_visual.pdf');

        } catch (e: unknown) { // Type must be 'any' or 'unknown'
            console.error("Error exporting visual to PDF:", e);
            // Safely extract error message if possible
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setAssignError(`Could not export visual to PDF. ${errorMessage} Check the console for more details.`);
            setTimeout(() => setAssignError(""), 5000); // Longer timeout for error messages
        } finally {
            currentButton.innerText = originalButtonText;
            currentButton.disabled = false;
        }
    };


    if (loading) return <div className={styles.loading}>Loading Floor Plan...</div>;
    if (error) return <div className={styles.error}>Error loading data: {error}</div>;

    const containerClasses = [styles.visualizationContainer];
    if (!fullView) {
        containerClasses.push(styles.constrainedWidth);
    }
    const containerClassName = containerClasses.join(' ');

    const danceFloorX = 350;
    const danceFloorY = 130;
    const danceFloorWidth = 250;
    const danceFloorHeight = 250;

    return (
        <div className={containerClassName} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {!fullView && <h2 className={styles.mainTitle} style={{ margin: 0, flexGrow: 1 }}>Floor Plan Visualization</h2>}
                {fullView && <div style={{flexGrow: 1}}></div>} {/* Spacer */}
                
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: fullView ? 'flex-end' : 'flex-start' }}>
                    <button 
                        onClick={handleExportSeatingChart} 
                        className={styles.exportButton} 
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Export to Text
                    </button>
                    <button
                        onClick={handleExportSeatingChartCSV}
                        className={styles.exportButton}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Export to CSV
                    </button>
                    <button
                        onClick={handleExportSeatingChartExcel}
                        className={styles.exportButton}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={handleExportSeatingChartPDF} // This is the DATA PDF
                        className={styles.exportButton}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Export Data to PDF 
                    </button>
                     <button
                        onClick={handleExportVisualToPDF} // This is the NEW VISUAL PDF
                        className={styles.exportButton}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Export Visual to PDF
                    </button>
                </div>
            </div>
            
            <div style={{
                position: 'absolute', top: fullView ? 50 : 70 , right: 10, background: 'rgba(255,255,255,0.95)',
                border: '1px solid #ccc', borderRadius: 8, padding: '8px 16px', zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120
            }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: '#b3d4fc', border: '1px solid #7bb1e7'}} />
                    <span>Avi&apos;s Tables</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: '#ffd6b3', border: '1px solid #e7b97b'}} />
                    <span>Shakthi&apos;s Tables</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 4, background: '#e0e0e0', border: '1px solid #bdbdbd'}} />
                    <span>Shared Table</span>
                </div>
            </div>
            
            {assignError && (
                <div className={styles.assignErrorPopup}>
                    <span role="img" aria-label="error">😢</span> {assignError}
                </div>
            )}

            {/* Wrapper for visual export. The ref is attached here. */}
            <div ref={visualExportWrapperRef} style={{backgroundColor: '#ffffff'}}> {/* Added explicit white background for capture consistency */}
                <svg ref={svgRef} viewBox="0 0 1000 1350" className={styles.floorPlanSvg}>
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
                        <circle cx="280" cy="1290" r="10" className={styles.garbageBin} />
                        <circle cx="310" cy="1290" r="10" className={styles.garbageBin} />
                        <text x="300" y="1265" className={styles.labelText} textAnchor="middle">Garbage & Recycling</text>
                    </g>

                    {TABLE_LAYOUTS.map(layout => {
                        const currentTableData = tables.find(t => t.id === layout.id);
                        const guestsAtTable = currentTableData?.guests || [];
                        const seatPositions = calculateSeatPositions(layout);
                        const tableOwnerClass =
                            layout.owner === "Avi" ? styles.tableAvi :
                            layout.owner === "Shakthi" ? styles.tableShakthi :
                            styles.tableShared;

                        return (
                            <g key={layout.id} transform={`translate(${layout.x}, ${layout.y})`} className={styles.tableGroup}>
                                <rect x={0} y={0} width={layout.width} height={layout.height}
                                    className={`${styles.tableRect} ${tableOwnerClass}`} />
                                <text x={layout.width / 2} y={layout.height / 2 + 5} className={styles.tableLabel} textAnchor="middle">
                                    {layout.displayName}
                                </text>
                                {seatPositions.map((pos, index) => {
                                    const guest = guestsAtTable[index];
                                    let displayLabel;
                                    if (fullView && guest) {
                                        displayLabel = truncateName(guest.name, 7);
                                    } else {
                                        displayLabel = guest ? getInitials(guest.name) : '';
                                    }
                                    const seatClass = guest ? styles.seatOccupied : styles.seatEmpty;
                                    const seatKey = `seat-${layout.id}-${index}`;
                                    const textClass = fullView && guest ? styles.seatFullName : styles.seatInitial;

                                    return (
                                        <g
                                            key={seatKey}
                                            transform={`translate(${pos.x}, ${pos.y})`}
                                            className={styles.seatGroup}
                                            onMouseEnter={(e) => guest && handleMouseEnter(e, guest)}
                                            onMouseLeave={handleMouseLeave}
                                            onClick={(e) => handleSeatClick(e, layout.id, index, guest || null)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {guest && <title>{guest.name}</title>}
                                            <circle cx="0" cy="0" r="10" className={seatClass} />
                                            <text x="0" y="0" dy="0.3em" className={textClass} textAnchor="middle">
                                                {displayLabel}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}
                    
                    <rect x={danceFloorX} y={danceFloorY} width={danceFloorWidth} height={danceFloorHeight} className={styles.danceFloor} />
                    <text x={danceFloorX + danceFloorWidth / 2} y={danceFloorY + danceFloorHeight / 2 + 5} className={styles.labelText} textAnchor="middle">
                        Dance
                    </text>
                </svg>
            </div>


            {!fullView && (
                <div className={styles.fullViewLinkContainer}>
                    <Link href="/floorplan" className={styles.fullViewLinkButton} target="_blank" rel="noopener noreferrer" aria-label="Open full-screen floor plan viewer">
                        View Full Floor Plan
                    </Link>
                    <p className={styles.fullViewLinkNote}>(Opens interactive floor plan in a new tab)</p>
                </div>
            )}

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

            {isModalOpen && modalTarget && (
                <AssignmentActionModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    target={modalTarget}
                    unassignedGuests={unassignedGuests}
                    tables={tables}
                    invitees={invitees}
                    onAssign={handleModalAction}
                    onUnassign={handleModalAction}
                    onMove={handleModalAction}
                />
            )}
        </div>
    );
}

// --- Assignment Action Modal Component (Copied from your provided code) ---
interface AssignmentActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: ModalTarget;
    unassignedGuests: Guest[];
    tables: TableWithGuests[];
    invitees: Invitee[];
    onAssign: (action: 'assign', data: { guestId: number; tableId: number }) => void;
    onUnassign: (action: 'unassign', data: { guestId: number }) => void;
    onMove: (action: 'move', data: { guestId: number; newTableId: number }) => void;
}

function AssignmentActionModal({ isOpen, onClose, target, unassignedGuests, tables, invitees, onAssign, onUnassign, onMove }: AssignmentActionModalProps) {
    const [selectedGuestId, setSelectedGuestId] = useState<string>('');
    const [selectedMoveTableId, setSelectedMoveTableId] = useState<string>('');

    useEffect(() => {
        if (isOpen && target?.type === 'seat') {
            setSelectedGuestId(unassignedGuests.length > 0 ? unassignedGuests[0].id.toString() : '');
        }
        if (isOpen && target?.type === 'guest' && target.guest.tableId !== null) {
             const currentGuestTableId = target.guest.tableId;
             const firstAvailableTable = tables.find(t => {
                const layout = TABLE_LAYOUTS.find(l => l.id === t.id);
                return layout && t.id !== currentGuestTableId && t.guests.length < layout.capacity;
             });
             setSelectedMoveTableId(firstAvailableTable ? firstAvailableTable.id.toString() : '');
        } else if (isOpen && target?.type === 'guest' && target.guest.tableId === null) { // Guest is unassigned
            const firstAvailableTable = tables.find(t => {
                const layout = TABLE_LAYOUTS.find(l => l.id === t.id);
                return layout && t.guests.length < layout.capacity;
            });
            setSelectedMoveTableId(firstAvailableTable ? firstAvailableTable.id.toString() : '');
        }

        if (!isOpen || !target) {
            setSelectedGuestId('');
            setSelectedMoveTableId('');
        }
    }, [isOpen, target, unassignedGuests, tables]);

    if (!isOpen || !target) return null; // Ensure target is also checked

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        } catch { return 'Invalid Date'; }
    };
    const formatRsvpStatus = (status: boolean | null | undefined) => {
        if (status === true) return 'Yes';
        if (status === false) return 'No';
        return 'Pending';
    };

    if (target.type === 'guest') {
        const currentGuest = target.guest;
        const currentTable = tables.find(t => t.id === currentGuest.tableId);
        const currentTableLayout = TABLE_LAYOUTS.find(l => l.id === currentGuest.tableId);
        const invitee = invitees.find(inv => inv.id === currentGuest.inviteeId);
        
        const availableMoveTables = tables.filter(t => {
            const layout = TABLE_LAYOUTS.find(l => l.id === t.id);
            return layout && t.id !== currentGuest.tableId && t.guests.length < layout.capacity;
        });

        return (
            <div className={styles.modalBackground} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h3 className={styles.modalTitle}>{currentGuest.name}</h3>
                    <div className={styles.modalGuestDetails}>
                        <p>Assigned Table: {currentTableLayout?.displayName || (currentTable?.name || 'Unassigned')}</p>
                        {currentGuest.dietaryRestrictions && <p>Guest Diet: {currentGuest.dietaryRestrictions}</p>}
                        {currentGuest.accessibilityInfo && <p>Guest Access: {currentGuest.accessibilityInfo}</p>}
                    </div>
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
                    <div className={styles.modalSection}>
                        <h4>Move Guest</h4>
                        {availableMoveTables.length > 0 ? (
                            <>
                                <select value={selectedMoveTableId} onChange={(e) => setSelectedMoveTableId(e.target.value)} className={styles.modalSelect}>
                                    <option value="" disabled>Select new table...</option>
                                    {availableMoveTables.map(table => {
                                        const layout = TABLE_LAYOUTS.find(l => l.id === table.id);
                                        return (
                                            <option key={table.id} value={table.id.toString()}> {/* Ensure value is string */}
                                                {layout?.displayName || table.name} ({table.guests.length}/{layout?.capacity})
                                            </option>
                                        );
                                    })}
                                </select>
                                <button
                                    onClick={() => onMove('move', { guestId: currentGuest.id, newTableId: parseInt(selectedMoveTableId) })}
                                    disabled={!selectedMoveTableId}
                                    className={styles.modalButton}
                                >
                                    Move Guest
                                </button>
                            </>
                        ) : (<p className={styles.modalInfo}>No other tables with available space.</p>)}
                    </div>
                    <div className={styles.modalSection}>
                        <h4>Unassign Guest</h4>
                        <button
                            onClick={() => onUnassign('unassign', { guestId: currentGuest.id })}
                            className={`${styles.modalButton} ${styles.unassignButton}`}
                        >
                            Unassign (Send to List)
                        </button>
                    </div>
                    <button onClick={onClose} className={`${styles.modalButton} ${styles.cancelButton}`}>Cancel</button>
                </div>
            </div>
        );
    }

    if (target.type === 'seat') {
        const targetTableLayout = TABLE_LAYOUTS.find(l => l.id === target.tableId);
        const targetTableData = tables.find(t => t.id === target.tableId);
        const isTableFull = !targetTableLayout || !targetTableData || targetTableData.guests.length >= targetTableLayout.capacity;

        return (
            <div className={styles.modalBackground} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h3 className={styles.modalTitle}>Assign Guest to {targetTableLayout?.displayName || targetTableData?.name || `Table ID ${target.tableId}`}</h3>
                    {isTableFull ? (<p className={styles.modalWarning}>This table is full!</p>)
                        : unassignedGuests.length === 0 ? (<p className={styles.modalInfo}>No unassigned guests available.</p>)
                            : (
                                <>
                                    <select value={selectedGuestId} onChange={(e) => setSelectedGuestId(e.target.value)} className={styles.modalSelect}>
                                        {unassignedGuests.map(guest => (
                                            <option key={guest.id} value={guest.id.toString()}> {/* Ensure value is string */}
                                                {guest.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => onAssign('assign', { guestId: parseInt(selectedGuestId), tableId: target.tableId })}
                                        disabled={!selectedGuestId}
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
    return null;
}