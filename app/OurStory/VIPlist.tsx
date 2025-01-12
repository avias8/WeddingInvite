"use client";

import React from "react";
import "./VIPList.css";

type Guest = {
  title: string; // e.g., "Parents of the Bride"
  names: string[]; // e.g., ["Shiroya and Robert Changirwa"]
};

type VIPListProps = {
  sectionTitle: string; // e.g., "OUR VIPS"
  guests: Guest[];
};

const VIPList: React.FC<VIPListProps> = ({ sectionTitle, guests }) => {
  return (
    <div className="vip-container">
      <h1 className="vip-section-title">{sectionTitle}</h1>
      <div className="vip-guest-list">
        {guests.map((guest, index) => (
          <div key={index} className="vip-guest-section">
            <h2 className="vip-guest-title">{guest.title}</h2>
            {guest.names.map((name, i) => (
              <p key={i} className="vip-guest-name">
                {name}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VIPList;
