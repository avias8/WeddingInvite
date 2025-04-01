"use client";

import React, { useEffect, useState } from "react";
// Correctly import the unified styles
import styles from "./DashboardStyles.module.css"; // Adjust path if needed
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { ChartOptions } from "chart.js";
// Import the full Invitee type
import type { Invitee } from "@/app/types";

export default function GuestRsvpDashboard() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitees = async () => {
      try {
        const res = await fetch("/api/invitees");
        if (!res.ok) {
          throw new Error(`Error fetching invitee data: ${res.statusText}`);
        }
        const data: Invitee[] = await res.json();
        setInvitees(data);
      } catch (err) {
        console.error("Failed to fetch invitees for guest dashboard:", err);
        setError(err instanceof Error ? err.message : "Unknown error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitees();
  }, []);

  if (loading) return <div className="text-center py-4">Loading guest dashboard...</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error loading guest data: {error}</div>;

  // Guest-Based Calculations remain the same
  const confirmedGuestsAttending = invitees.reduce((sum, invitee) => {
    const guestsCount = typeof invitee.guests === 'number' ? invitee.guests : 0;
    return invitee.isAttending === true ? sum + guestsCount : sum;
  }, 0);

  const potentialGuestsPending = invitees.reduce((sum, invitee) => {
    const maxInvitesCount = typeof invitee.maxInvites === 'number' ? invitee.maxInvites : 0;
    return invitee.isAttending === null ? sum + maxInvitesCount : sum;
  }, 0);

  const absoluteMaxGuests = invitees.reduce((sum, invitee) => {
    const maxInvitesCount = typeof invitee.maxInvites === 'number' ? invitee.maxInvites : 0;
    return sum + maxInvitesCount;
  }, 0);

  // Chart Configuration remains the same
  const guestChartData = {
    labels: ["Confirmed Guests Attending", "Potential Guests (Pending RSVP)"],
    datasets: [
      {
        label: "Number of Guests",
        data: [confirmedGuestsAttending, potentialGuestsPending],
        backgroundColor: ["#4CAF50", "#FFC107"], // Green, Yellow
        borderColor: ['#388E3C', '#FFA000'],
        borderWidth: 1,
      },
    ],
  };

  const guestChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 30,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) { label += context.parsed.y; }
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
          text: "Number of Guests",
        },
      },
      x: {
        title: {
          display: true,
          text: "Guest Status Category",
        },
      },
    },
  };

  return (
    // Removed the outer "flex flex-col" as the container handles margins
    // Apply styles.container to the outermost div of this component
    <div className={styles.container}>
      <h1 className={styles.title}>Guest Count Overview</h1>

      {/* Apply cardGrid directly here, replacing Tailwind grid classes */}
      <div className={styles.cardGrid}>
         {/* Apply specific color classes to differentiate */}
        <div className={`${styles.card} ${styles.guestCountColor}`}>
          <h2>Confirmed Guests Attending</h2>
          <p>{confirmedGuestsAttending}</p>
        </div>
        <div className={`${styles.card} ${styles.pendingCountColor}`}>
          <h2>Potential Guests (Pending Parties)</h2>
          <p>{potentialGuestsPending}</p>
        </div>
        <div className={`${styles.card} ${styles.guestCountColor}`}>
          <h2>Max Potential Guests (All Parties)</h2>
          <p>{absoluteMaxGuests}</p>
        </div>
      </div>

      {/* Chart container */}
      <div className={styles["chart-container"]}>
        <h2 className={styles["chart-title"]}>Guest Attendance Status Breakdown</h2>
        <Bar data={guestChartData} options={guestChartOptions} />
      </div>
    </div>
  );
}

