"use client";

import React, { useEffect, useState } from "react";
// Correctly import the unified styles
import styles from "./DashboardStyles.module.css"; // Adjust path if needed
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { ChartOptions } from "chart.js";
// Import the FULL Invitee type
import type { Invitee } from "@/app/types";

export default function RsvpDashboard() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitees = async () => {
      try {
        const res = await fetch("/api/invitees");
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        // Cast to the full Invitee type
        const data: Invitee[] = await res.json();
        setInvitees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitees();
  }, []);

  if (loading) return <div className="text-center py-4">Loading RSVP dashboard...</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error loading RSVP data: {error}</div>;

  // Calculations remain the same (based on invitee counts)
  const totalInvitees = invitees.length;
  const attendingInvitees = invitees.filter((i) => i.isAttending === true).length;
  const notAttendingInvitees = invitees.filter((i) => i.isAttending === false).length;
  const pendingInvitees = invitees.filter((i) => i.isAttending === null).length;

  const chartData = {
    labels: ["Attending Parties", "Not Attending Parties", "Pending Parties"],
    datasets: [
      {
        label: "Invitee Party RSVP Status",
        data: [attendingInvitees, notAttendingInvitees, pendingInvitees],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"], // Green, Red, Yellow
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
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
    },
     scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Invitee Parties",
          },
        },
        x: {
          title: {
            display: true,
            text: "RSVP Status Category",
          },
        },
      },
  };

  return (
    // Removed the outer "flex flex-col" as the container handles margins
    // Apply styles.container to the outermost div of this component
    <div className={styles.container}>
      <h1 className={styles.title}>RSVP Dashboard (By Party)</h1>

      {/* Apply cardGrid directly here, replacing Tailwind grid classes */}
      <div className={styles.cardGrid}>
        {/* Apply specific color classes to differentiate */}
        <div className={`${styles.card} ${styles.inviteeCountColor}`}>
          <h2>Total Invitee Parties</h2>
          <p>{totalInvitees}</p>
        </div>
        <div className={`${styles.card} ${styles.inviteeCountColor}`}>
          <h2>Parties Attending</h2>
          <p>{attendingInvitees}</p>
        </div>
        <div className={`${styles.card} ${styles.pendingCountColor}`}>
          <h2>Parties Pending</h2>
          <p>{pendingInvitees}</p>
        </div>
      </div>

      {/* Chart container */}
      <div className={styles["chart-container"]}>
        <h2 className={styles["chart-title"]}>Invitee Party RSVP Status Breakdown</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
