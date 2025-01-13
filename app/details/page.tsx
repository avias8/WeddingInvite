"use client"; // optional if you need client features here; if not, omit

import Header from "../components/Header"; // <--- Adjust path if needed
import styles from "./details.module.css";

export default function DetailsPage() {
  return (
    <div>
      {/* Reusable Header at the top */}
      <Header />
      
      <div className={styles.pageContainer}>


      <div className={styles.heroContainer}>
        <div className={styles.hero}>
          <div className={styles.videoContainer}>
            <video autoPlay muted loop playsInline className={styles.heroVideo}>
              <source src="/Caramellover.webm" type="video/webm" />
              <source src="/Caramellover.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className={styles.heroOverlay}>
              <h1 className={styles.heroTitle}>Wedding Details</h1>
            </div>
          </div>
        </div>
      </div>


      {/* Main content container */}
      <div className={styles.detailsContainer}>
        {/* Section: About the Hindu Wedding */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About the Hindu Wedding</h2>
          <p className={styles.sectionText}>
            A Hindu wedding is a beautiful blend of ancient traditions and sacred rituals.
            It typically involves the seven steps around the sacred fire (Saptapadi),
            symbolizing the vows taken by the couple. The ceremony is rich in symbolism,
            celebrating the union of two souls.
          </p>
        </section>

        {/* Section: Schedule */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Schedule</h2>
          <ul className={styles.scheduleList}>
            <li>
              <strong>10:00 AM</strong> - Guests Arrival
            </li>
            <li>
              <strong>11:00 AM</strong> - Ceremony Begins (Saptapadi)
            </li>
            <li>
              <strong>12:30 PM</strong> - Vows & Blessings
            </li>
            <li>
              <strong>1:00 PM</strong> - Lunch Reception
            </li>
          </ul>
        </section>

        {/* Section: Food */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Food</h2>
          <p className={styles.sectionText}>
            A variety of vegetarian & non-vegetarian delicacies will be served, including traditional
            South Indian dishes like dosa, sambar, and idli, along with sweet treats
            like gulab jamun and payasam. Please let us know of any dietary restrictions in your RSVP.
          </p>
        </section>

        {/* Section: Parking Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Parking Details</h2>
          <p className={styles.sectionText}>
            Free parking is available at the venue. Look for signs directing you to the
            designated wedding parking area. Valet service will also be available for convenience.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
