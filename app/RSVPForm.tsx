"use client";

import React, { useState } from "react";

export default function RSVPForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // POST to /api/invitees
    const res = await fetch("/api/invitees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        guests,
        // If you want to store isAttending as well:
        isAttending: true, 
      }),
    });

    if (res.ok) {
      alert("RSVP Submitted!");
      // reset form or show success
      setName("");
      setEmail("");
      setGuests(1);
    } else {
      alert("Error submitting RSVP");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <div className="mb-2">
        <label className="block">Name</label>
        <input
          className="border px-2 py-1 w-full"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block">Email</label>
        <input
          className="border px-2 py-1 w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block">Number of Guests</label>
        <input
          className="border px-2 py-1 w-full"
          type="number"
          min="1"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-pink-600 text-white p-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}