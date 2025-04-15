// app/management/rsvp/page.tsx
"use client";

import RsvpDashboard from "./RSVPDashboard"; // Original dashboard (invitee focus)
import GuestRsvpDashboard from "./GuestRsvpDashboard"; // New dashboard (guest focus) - Adjust path if needed
import ConfirmedInviteeGuests from "./ConfirmedInviteeGuests";
import ManageTables from "./ManageTables";
import SeatingAssignment from "./SeatingAssignment";
import "./rsvp.css";
import FloorPlanVisualization from "./FloorPlanVisualization";


export default function RsvpPage() {
  return (
    <div>
      <h1 className="text-5xl font-bold mb-6 text-center">RSVP Overview</h1>

      {/* Render the original dashboard focusing on invitee parties */}
      <RsvpDashboard />

      {/* Render the new dashboard focusing on guest counts */}
      <GuestRsvpDashboard />

      {/* Render the rest of the components */}
      <ConfirmedInviteeGuests />
      <ManageTables />
      <SeatingAssignment />
      <FloorPlanVisualization />
    </div>
  );
}
