"use client";

import React, { useState } from "react";

export default function AdminAdd() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [maxGuests, setMaxGuests] = useState(1); // Default to 0 max guests

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      email,
      maxInvites: maxGuests, // Assign maxGuests to maxInvites
      guests: 0, // Default guests attending is 0
      isAttending: false, // Default to not attending
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
        setMaxGuests(0); // Reset to 0 max guests
      } else {
        alert("Error adding invite. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting invite:", error);
      alert("An unexpected error occurred.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <div className="mb-2">
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter full name"
          required
        />
      </div>

      <div className="mb-2">
        <label className="block font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="mb-2">
        <label className="block font-medium mb-1">Max Guests</label>
        <input
          type="number"
          value={maxGuests}
          onChange={(e) => setMaxGuests(Number(e.target.value))}
          className="w-full p-2 border rounded"
          min="0"
          placeholder="Enter max number of guests"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-pink-600 text-white p-2 rounded mt-4 w-full"
      >
        Add Invite
      </button>
    </form>
  );
}
