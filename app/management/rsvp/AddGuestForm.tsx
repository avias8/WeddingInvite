"use client";

import React, { useState } from "react";
import styles from "./AddGuestForm.module.css";
// Import the Guest type from your shared types file (adjust the path as needed)
import type { Guest } from "@/app/types";

interface AddGuestFormProps {
  inviteeId: number;
  inviteeName: string;
  onClose: () => void;
  onGuestAdded: (newGuest: Guest) => void; // Use the specific Guest type instead of any
}

export default function AddGuestForm({
  inviteeId,
  inviteeName,
  onClose,
  onGuestAdded,
}: AddGuestFormProps) {
  const [name, setName] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [accessibilityInfo, setAccessibilityInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          inviteeId,
          dietaryRestrictions: dietaryRestrictions || null,
          accessibilityInfo: accessibilityInfo || null,
          // Assuming guests added through this form are attending.
          isAttending: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add guest.");
      }

      const newGuest = await res.json();
      onGuestAdded(newGuest);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add Guest for {inviteeName}</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="guestName">Guest Name:</label>
            <input
              id="guestName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dietaryRestrictions">Dietary Restrictions:</label>
            <input
              id="dietaryRestrictions"
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="accessibilityInfo">Accessibility Info:</label>
            <input
              id="accessibilityInfo"
              type="text"
              value={accessibilityInfo}
              onChange={(e) => setAccessibilityInfo(e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Guest"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
