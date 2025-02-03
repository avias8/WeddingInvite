// app/management/rsvp/page.tsx
"use client";

import RsvpDashboard from "./RSVPDashboard";
import ConfirmedInviteeGuests from "./ConfirmedInviteeGuests";
import ManageTables from "./ManageTables";
import SeatingAssignment from "./SeatingAssignment";

export default function RsvpPage() {
  return (
    <div>
      <h1 className="text-5xl font-bold mb-6 text-center">RSVP Overview</h1>
      <RsvpDashboard />
      <ConfirmedInviteeGuests />
      <ManageTables />
      <SeatingAssignment />
    </div>
  );
}
