"use client";

import React, { useState } from "react";
import styles from "./AdminInvite.module.css"; // Import CSS module

export default function AdminInvite() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [maxGuests, setMaxGuests] = useState(1); // Default to 1 max guest
  const [error, setError] = useState<string | null>(null); // For custom validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state

  // Function to validate email with stricter rules
  const isValidEmail = (email: string) => {
    const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return strictEmailRegex.test(email);
  };

  // Function to handle form validation
  const handleValidation = (): boolean => {
    if (!name.trim()) {
      setError("Name is required.");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address (e.g., user@example.com).");
      return false;
    }
    if (maxGuests < 0) {
      setError("Max guests cannot be negative.");
      return false;
    }
    setError(null);
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    if (!handleValidation()) return;
  
    setIsSubmitting(true);
    const payload = {
      name,
      email,
      maxInvites: maxGuests,
      guests: 0,
      isAttending: null,
    };
  
    try {
      const res = await fetch("/api/invitees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errorData: { message?: string } = await res.json();
        throw new Error(errorData.message || "Error adding invite.");
      }
  
      alert("Invite added successfully!");
      setName("");
      setEmail("");
      setMaxGuests(1);
    } catch (error) {
      // Use `instanceof` to infer error type
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }  

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.formContainer} ${styles.shadowEffect}`}
    >
      <h2 className={styles.title}>Add New Invitee</h2>

      {error && <p className={`${styles.errorText} mb-4`}>{error}</p>}

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

      {/* Submit Button */}
      <button
        type="submit"
        className={`sectionButton w-full ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Add Invite"}
      </button>
    </form>
  );
}
