"use client";

import React from "react";
// Import the CSS file
import "./OurStory.css";

export default function OurStory() {
  return (
    <div className="pageContainer">
      {/* Hero Section */}
      <header className="hero">
        <h1>
          <span>Avi & Shakthi</span>
        </h1>
        <p className="heroSubtext">A Story of Us</p>
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

      {/* Footer */}
      <footer className="footer">
        <p className="footerText">We can&apos;t wait to celebrate with you.</p>
      </footer>
    </div>
  );
}
