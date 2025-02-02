"use client";

import React, { useState, useEffect } from "react";

// Define the Invitee interface
interface Invitee {
  id: number;
  token: string;
  name: string;
  email: string;
  rsvp: boolean;
  dietaryRestrictions?: string;
}

// Props for the GuestInfoEditor component
interface GuestInfoEditorProps {
  token: string; // Unique token identifying the invitee
}

export default function GuestInfoEditor({ token }: GuestInfoEditorProps) {
  const [invitee, setInvitee] = useState<Invitee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing the invitee details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rsvp, setRsvp] = useState<boolean>(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  // Fetch the invitee details when the component mounts or the token changes
  useEffect(() => {
    async function fetchInvitee() {
      try {
        const res = await fetch(`/api/invitees/${token}`);
        if (!res.ok) {
          throw new Error("Failed to fetch invitee details");
        }
        const data = await res.json();
        setInvitee(data);
        setName(data.name);
        setEmail(data.email);
        setRsvp(data.rsvp);
        setDietaryRestrictions(data.dietaryRestrictions || "");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchInvitee();
  }, [token]);

  // Handle form submission and update the invitee details via a PUT request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/invitees/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          rsvp,
          dietaryRestrictions,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to update invitee details");
      }
      const updatedInvitee = await res.json();
      setInvitee(updatedInvitee);
      alert("Guest information updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating guest information");
    }
  };

  if (loading) return <p>Loading guest information...</p>;
  if (error || !invitee)
    return <p>Error: {error || "Invitee not found"}</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Edit Guest Information</h1>
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginLeft: "0.5rem", width: "100%" }}
            />
          </label>
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginLeft: "0.5rem", width: "100%" }}
            />
          </label>
        </div>

        {/* RSVP Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            RSVP:
            <select
              value={rsvp ? "yes" : "no"}
              onChange={(e) => setRsvp(e.target.value === "yes")}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="yes">Attending</option>
              <option value="no">Not Attending</option>
            </select>
          </label>
        </div>

        {/* Dietary Restrictions Field */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Dietary Restrictions:
            <textarea
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              style={{ marginLeft: "0.5rem", width: "100%" }}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit">Update Guest Info</button>
      </form>
    </div>
  );
}