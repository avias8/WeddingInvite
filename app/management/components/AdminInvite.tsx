"use client";

import React, { useState } from "react";
import styles from "./AdminInvite.module.css"; // Import CSS module

export default function AdminInvite() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [maxGuests, setMaxGuests] = useState(1); // Default to 1 max guest
  const [error, setError] = useState<string | null>(null); // For custom validation errors

  // Function to validate email with stricter rules
  const isValidEmail = (email: string) => {
    const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return strictEmailRegex.test(email);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address (e.g., user@example.com).");
      return;
    }

    setError(null); // Clear any previous error

    const payload = {
      name,
      email,
      maxInvites: maxGuests, // Assign maxGuests to maxInvites
      guests: 0, // Default guests attending is 0
      isAttending: null, // Default to null
    };

    try {
      const res = await fetch("/api/invitees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Invite added successfully!");
        setName("");
        setEmail("");
        setMaxGuests(1); // Reset to 1 max guest
      } else {
        alert("Error adding invite. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting invite:", error);
      alert("An unexpected error occurred.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.formContainer} ${styles.shadowEffect}`}
    >
      <div className={styles.formField}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
          required
        />
      </div>

      <div className={styles.formField}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          required
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      <div className={styles.formField}>
        <label>Max Guests</label>
        <input
          type="number"
          value={maxGuests}
          onChange={(e) => setMaxGuests(Number(e.target.value))}
          min="0"
          placeholder="Enter max number of guests"
          required
        />
      </div>

      {/* Global button style with full width */}
      <button type="submit" className="primary w-full">
        Add Invite
      </button>
    </form>
  );
}
