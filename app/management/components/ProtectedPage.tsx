"use client";

import React, { useState, useEffect } from "react";
import AdminAdd from "./AdminInvite";
import AdminPage from "./AdminTiles";
import "./ManagementPage.css";

const ProtectedPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is already authenticated (using session storage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "";
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("isAuthenticated", "true"); // Save authentication status
      setError(null);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="management-container">
        <h1 className="management-title">Manage Invitees</h1>
        <div className="management-section">
          <h2 className="section-title">Send Invite</h2>
          <AdminAdd />
        </div>
        <div className="management-section">
          <AdminPage />
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
      </form>
    </div>
  );
};

export default ProtectedPage;
