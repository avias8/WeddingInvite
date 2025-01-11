"use client"; // Mark this file as a Client Component

import React from "react";

export default function RSVPButton() {
  const handleClick = () => {
    alert("RSVP form goes here!");
  };

  return (
    <button 
      onClick={handleClick} 
      className="bg-pink-600 text-white p-2 rounded"
    >
      RSVP
    </button>
  );
}