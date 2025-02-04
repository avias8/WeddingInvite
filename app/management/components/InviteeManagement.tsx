"use client";

import React from "react";
import AdminInvite from "./AdminInvite";
import "./InviteeManagement.css";
import AdminTiles from "./AdminTiles";
import Link from "next/link";

export default function InviteeManagement() {
  return (
    <div className="flex flex-col">
      <div className="management-container">
        <h1 className="text-5xl font-bold mb-6">Manage Invitees</h1>
        <div className="management-section">
          <h2 className="text-3xl font-bold mb-6">Send Invite</h2>
          <AdminInvite />
        </div>
        <div className="management-section">
          <AdminTiles />
        </div>
        {/* Link to the separate RSVP Dashboard page */}
        <div className="management-section">
          <h2 className="text-3xl font-bold mb-6">RSVP Overview</h2>
          <Link
            href="/management/rsvp"
            className="text-blue-500 underline text-xl"
          >
            View RSVP Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
