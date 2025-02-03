"use client";

import React, { useEffect, useState } from "react";
import styles from "./RSVPDashboard.module.css";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { ChartOptions } from "chart.js";

interface Invitee {
  id: number;
  name: string;
  email: string;
  isAttending: boolean | null;
  createdAt: string;
}

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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const totalInvitees = invitees.length;
  const attending = invitees.filter((i) => i.isAttending === true).length;
  const notAttending = invitees.filter((i) => i.isAttending === false).length;
  const pending = invitees.filter((i) => i.isAttending === null).length;

  const chartData = {
    labels: ["Attending", "Not Attending", "Pending"],
    datasets: [
      {
        label: "RSVP Status",
        data: [attending, notAttending, pending],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
      },
    ],
  };

  // Updated chart options with layout padding to avoid cutting off the legend.
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
  };

  return (
    <div className="flex flex-col">
      <div className={styles.container}>
        <h1 className={styles.title}>RSVP Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={styles.card}>
            <h2>Total Invitees</h2>
            <p>{totalInvitees}</p>
          </div>
          <div className={styles.card}>
            <h2>Confirmed Attending</h2>
            <p>{attending}</p>
          </div>
          <div className={styles.card}>
            <h2>Still Pending</h2>
            <p>{pending}</p>
          </div>
        </div>
        <div className={styles["chart-container"]}>
          <h2 className={styles["chart-title"]}>RSVP Status Breakdown</h2>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}