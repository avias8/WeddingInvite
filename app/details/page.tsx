import styles from "./details.module.css";

export default function DetailsPage() {
  return (
    <div className={styles.detailsContainer}>
      <h1 className={styles.title}>Wedding Details</h1>

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
          A variety of vegetarian delicacies will be served, including traditional
          South Indian dishes like dosa, sambar, and idli, along with sweet treats
          like gulab jamun and payasam. Please let us know of any dietary restrictions.
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
  );
}
