"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header"; // Adjust the path as needed
import Link from "next/link";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword =
      process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg==";
    if (password === correctPassword) {
      sessionStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  // If not authenticated, display the login form.
  if (!isAuthenticated) {
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
          {error && (
            <p className="text-red-600 text-sm mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  // Authenticated: render the protected layout.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <nav className="management-nav">
        <div className="container mx-auto flex gap-6 justify-center">
          <Link
            href="/management"
            className="text-white font-medium hover:underline"
          >
            Invitee List
          </Link>
          <Link
            href="/management/rsvp"
            className="text-white font-medium hover:underline"
          >
            RSVP Dashboard
          </Link>
        </div>
      </nav>
      <main className="management-container flex-grow p-4">{children}</main>
    </div>
  );
}
