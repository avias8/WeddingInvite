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
        <p className="heroSubtext">A Love Story Written in the Stars</p>
      </header>

      {/* Our Story Section */}
      <section className="section">
        <h2 className="sectionTitle">Our Story</h2>
        <p className="sectionText">
          Once upon a time in the vibrant city of Calgary, two paths crossed
          that were destined to intertwine. Avi, a dreamer with a passion for
          technology, and Shakthi, a creative spirit with a love for life,
          found each other in the most serendipitous way. Together, they
          embarked on a journey filled with love, laughter, and adventure.
        </p>
        <p className="sectionText">
          From their first coffee date to late-night stargazing, every moment
          brought them closer. Now, as they take the next step in their
          beautiful journey, they invite you to join them in celebrating their
          love story.
        </p>
      </section>

      {/* Event Details Section */}
      <section className="eventDetails">
        {/* Hosted By Section */}
        <div className="hostedBy">
          <p className="sectionTitle">Hosted By</p>
          <p className="familyName">The Varma and Ganesh Families 💍</p>
        </div>
        {/* Dates Section */}
        <div className="datesSection">
          <p className="dates">June 28, 2025 | 2 PM</p>
          <p className="dates">June 29, 2025 | 11 AM</p>
          <br />
          <p className="location">Calgary, Alberta</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footerText">We can't wait to celebrate with you!</p>
      </footer>
    </div>
  );
}
