"use client";

import React, { useState } from "react";

export default function AdminAdd() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [accessibilityInfo, setAccessibilityInfo] = useState("");
  const [comments, setComments] = useState("");
  const [songRequests, setSongRequests] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      email,
      guests,
      maxInvites: guests,
      dietaryRestrictions: dietaryRestrictions || null,
      accessibilityInfo: accessibilityInfo || null,
      comments: comments || null,
      songRequests: songRequests || null,
      isAttending: true,
    };

    const res = await fetch("/api/invitees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("RSVP Submitted!");
      setName("");
      setEmail("");
      setGuests(1);
      setDietaryRestrictions("");
      setAccessibilityInfo("");
      setComments("");
      setSongRequests("");
    } else {
      alert("Error submitting RSVP");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <div className="mb-2">
        <label className="block">Name</label>
        <input
          className="border px-2 py-1 w-full text-black"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block">Email</label>
        <input
          className="border px-2 py-1 w-full text-black"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block">Number of Guests</label>
        <input
          className="border px-2 py-1 w-full text-black"
          type="number"
          min="1"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block">Dietary Restrictions / Allergies</label>
        <textarea
          className="border px-2 py-1 w-full text-black"
          value={dietaryRestrictions}
          onChange={(e) => setDietaryRestrictions(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label className="block">Accessibility Information</label>
        <textarea
          className="border px-2 py-1 w-full text-black"
          value={accessibilityInfo}
          onChange={(e) => setAccessibilityInfo(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label className="block">Additional Comments</label>
        <textarea
          className="border px-2 py-1 w-full text-black"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label className="block">Song Requests</label>
        <textarea
          className="border px-2 py-1 w-full text-black"
          value={songRequests}
          onChange={(e) => setSongRequests(e.target.value)}
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
