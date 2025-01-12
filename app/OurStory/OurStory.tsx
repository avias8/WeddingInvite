"use client";

import React from "react";
// Import the CSS file
import "./OurStory.css";
// Import the VIPList component
import VIPList from "./VIPlist";

export default function OurStory() {
  const vipData = [
    {
      title: "Parents of the Bride",
      names: ["Karthika Devi & Ganesh Sankar Govindarajan"],
    },
    {
      title: "Parents of the Groom",
      names: ["Vaishali and Anil Varma"],
    },
    {
      title: "Brother of the Bride",
      names: ["Prathyunkar Ganesh Sankar"],
    },
    {
      title: "Sisters of the Groom",
      names: ["Tanya & Vani Chowdhary"],
    },
    {
      title: "Maid of Honour",
      names: ["Areeba Nadeem"],
    },
    {
      title: "Best Man",
      names: ["Zain Chandani"],
    },
    {
      title: "Bridal Party",
      names: [
        "Kavya Bhagawatula",
        "Harshad Karishnaraj"
      ],
    },
    {
      title: "Groomsmen",
      names: [
        "Sunith Arlic",
        "Sim Khinda",
        "Saffy Swaleh"
      ],
    },
  ];

  return (
    <div className="pageContainer">
      {/* Hero Section */}
      <header className="hero">
        <h1>
          <span>Avi & Shakthi</span>
        </h1>
      </header>

      {/* Our Story Section */}
      <section className="section">
        <h2 className="sectionTitle">Our Story</h2>
        <p className="sectionText">
          It all began in Calgary, where Avi and Shakthi first met. From that
          moment, a connection formed, and what started as a simple
          conversation soon grew into something special.
        </p>
        <p className="sectionText">
          Over time, they discovered shared values, laughter, and experiences
          that brought them closer together. Now, they are excited to take the
          next step in their journey and look forward to celebrating this
          special occasion with all of you.
        </p>
      </section>

      {/* Event Details Section */}
      <section className="eventDetails">
        {/* Hosted By Section */}
        <div className="hostedBy">
          <p className="sectionTitle">Hosted By</p>
          <p className="familyName">The Varma and Ganesh Families</p>
        </div>
        {/* Dates Section */}
        <div className="datesSection">
          <p className="dates">June 29, 2025 | 11 AM</p>
          <br />
          <p className="location">Calgary, Alberta</p>
        </div>
      </section>

      {/* VIP List Section */}
      <section className="section">
        <VIPList sectionTitle="Our Guests of Honor" guests={vipData} />
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footerText">We can&apos;t wait to celebrate with you.</p>
      </footer>
    </div>
  );
}
