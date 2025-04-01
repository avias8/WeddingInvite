"use client";

import React, { useEffect, useState } from "react";
// Assuming you'll create a similar CSS module or reuse/adapt styles
import styles from "./GuestRsvpDashboard.module.css";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { ChartOptions } from "chart.js";
// Import the full Invitee type to access guest counts
import type { Invitee } from "@/app/types";

export default function GuestRsvpDashboard() {
  // State for invitees, loading status, and errors
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitee data on component mount
  useEffect(() => {
    const fetchInvitees = async () => {
      try {
        const res = await fetch("/api/invitees"); // Fetch from the API route
        if (!res.ok) {
          // Handle HTTP errors
          throw new Error(`Error fetching invitee data: ${res.statusText}`);
        }
        const data: Invitee[] = await res.json(); // Parse JSON response
        setInvitees(data); // Update state with fetched data
      } catch (err) {
        // Handle fetch or parsing errors
        console.error("Failed to fetch invitees for guest dashboard:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching data");
      } finally {
        // Set loading to false once fetching is complete (success or error)
        setLoading(false);
      }
    };

    fetchInvitees();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Display loading state
  if (loading) return <div className="text-center py-4">Loading guest dashboard...</div>;
  // Display error state
  if (error) return <div className="text-center text-red-500 py-4">Error loading guest data: {error}</div>;

  // --- Guest-Based Calculations ---
  // Calculate total confirmed guests attending by summing 'guests' for attending invitees
  const confirmedGuestsAttending = invitees.reduce((sum, invitee) => {
    // Ensure 'guests' is a number; default to 0 if not or if invitee isn't attending
    const guestsCount = typeof invitee.guests === 'number' ? invitee.guests : 0;
    return invitee.isAttending === true ? sum + guestsCount : sum;
  }, 0);

  // Calculate total potential guests from pending RSVPs by summing 'maxInvites'
  const potentialGuestsPending = invitees.reduce((sum, invitee) => {
    // Ensure 'maxInvites' is a number; default to 0 if not or if invitee isn't pending
    const maxInvitesCount = typeof invitee.maxInvites === 'number' ? invitee.maxInvites : 0;
    return invitee.isAttending === null ? sum + maxInvitesCount : sum;
  }, 0);

  // Calculate the absolute maximum potential guests if everyone attended with max invites
   const absoluteMaxGuests = invitees.reduce((sum, invitee) => {
    const maxInvitesCount = typeof invitee.maxInvites === 'number' ? invitee.maxInvites : 0;
    return sum + maxInvitesCount;
   }, 0);

  // --- Chart Configuration (Based on Guests) ---
  const guestChartData = {
    labels: ["Confirmed Guests Attending", "Potential Guests (Pending RSVP)"],
    datasets: [
      {
        label: "Number of Guests",
        data: [confirmedGuestsAttending, potentialGuestsPending],
        backgroundColor: [
          "#4CAF50", // Green for confirmed guests
          "#FFC107", // Yellow for potential guests from pending parties
        ],
        borderColor: [ // Optional: Add borders
            '#388E3C',
            '#FFA000',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options for the guest-based bar chart
  const guestChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 30, // Padding for legend
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
       tooltip: { // Optional: Customize tooltips
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Guests", // Y-axis title
        },
      },
      x: {
        title: {
          display: true,
          text: "Guest Status Category", // X-axis title
        },
      },
    },
  };

  // --- Render JSX ---
  return (
    <div className="flex flex-col mt-8"> {/* Added margin-top */}
      {/* Main container for the guest dashboard */}
      <div className={styles.container}>
        <h1 className={styles.title}>Guest Count Overview</h1>

        {/* Grid for guest summary statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card for Confirmed Guests Attending */}
          <div className={styles.card}>
            <h2>Confirmed Guests Attending</h2>
            <p>{confirmedGuestsAttending}</p>
          </div>
          {/* Card for Potential Guests Pending */}
          <div className={styles.card}>
            <h2>Potential Guests (Pending Parties)</h2>
            <p>{potentialGuestsPending}</p>
          </div>
           {/* Card for Absolute Max Potential Guests */}
           <div className={styles.card}>
            <h2>Max Potential Guests (All Parties)</h2>
            <p>{absoluteMaxGuests}</p>
          </div>
        </div>

        {/* Container for the guest-based chart */}
        <div className={styles["chart-container"]}>
          <h2 className={styles["chart-title"]}>
            Guest Attendance Status Breakdown
          </h2>
          {/* Render the Bar chart with guest data */}
          <Bar data={guestChartData} options={guestChartOptions} />
        </div>
      </div>
    </div>
  );
}

