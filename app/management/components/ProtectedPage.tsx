//app/management/components/ProtectedPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import AdminInvite from "./AdminInvite";
import "./ManagementPage.css";
import Header from "../../components/Header";
import AdminTiles from "./AdminTiles";
import RsvpDashboard from "./RSVPDashboard" // ✅ Import the new dashboard
import SeatingAssignment from "./SeatingAssignment";



const ProtectedPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg==";
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", "true");
      setError(null);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="management-container flex-grow">
          <h1 className="text-5xl font-bold mb-6">Manage Invitees</h1>
          {/* ✅ Add the RSVP Dashboard */}
          <div className="management-section">
            <h2 className="text-3xl font-bold mb-6">RSVP Overview</h2>
            <RsvpDashboard />
          </div>
          {/* ✅ Add the Seating Assignment */}
          <div className="management-section">
            <h2 className="text-3xl font-bold mb-6">Seating Overview</h2>
            <SeatingAssignment />
          </div>
          <div className="management-section">
            <h2 className="text-3xl font-bold mb-6">Send Invite</h2>
            <AdminInvite />
          </div>
          <div className="management-section">
            <AdminTiles />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          Enter Password
        </h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter password"
        />
        
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600"
        >
          Go Back
        </button>
      </form>
    </div>
  );
};


export default ProtectedPage;
