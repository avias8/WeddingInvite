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
    // Check session storage for authentication status when the component mounts
    const authStatus = sessionStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Retrieve the password from environment variables, with a fallback
    // The fallback "eW9zZGZlZGJhcg==" is "yosdfedbar" base64 encoded.
    const correctPassword =
      process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg==";
    if (password === correctPassword) {
      // If the password is correct, set authentication status in session storage
      sessionStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      setError(""); // Clear any previous errors
    } else {
      // If the password is incorrect, set an error message
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
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  // Authenticated: render the protected layout with Header and navigation.
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global site header component */}
      <Header />
      {/* Navigation bar specific to the management section */}
      <nav className="management-nav">
        <div className="container mx-auto flex flex-wrap gap-4 sm:gap-6 justify-center py-2 sm:py-0">
          {/* Link to the main Invitee List page */}
          <Link
            href="/management"
            className="text-white font-medium hover:underline px-2 py-1 sm:px-0 sm:py-0"
          >
            Invitee List
          </Link>
          {/* Link to the RSVP Dashboard page */}
          <Link
            href="/management/rsvp"
            className="text-white font-medium hover:underline px-2 py-1 sm:px-0 sm:py-0"
          >
            RSVP Dashboard
          </Link>
          {/* Link to the new Custom Email page */}
          <Link
            href="/management/custom-email"
            className="text-white font-medium hover:underline px-2 py-1 sm:px-0 sm:py-0"
          >
            Custom Email
          </Link>
        </div>
      </nav>
      {/* Main content area for the management pages */}
      <main className="management-container flex-grow p-4">{children}</main>
    </div>
  );
}
