import Header from "../components/Header"; // <--- Adjust path if needed
import HeroSection from "../components/HeroSection";
import styles from "./details.module.css";
import DressCode from "./DressCode/DressCode";
import TravelInfo from "./Travel/TravelInfo";

export default function DetailsPage() {
  return (
    <div>
      <Header />

      {/* The outer container with consistent padding */}
      <div className={styles.pageContainer}>
        <HeroSection
          mp4Src="https://storage.googleapis.com/my-wedding-assets/CaramelloverCrop.mp4"
          webmSrc="https://storage.googleapis.com/my-wedding-assets/Caramellovercrop.webm"
          heroText="Wedding Details"
        />

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
            <br></br>
            <p className={styles.sectionText}>
              We invite you to join us in celebrating our love and the beginning of our journey together.
            </p>
          </section>

          {/* Section: Dress Code */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Dressing for a Hindu Wedding</h2>
            <DressCode />
          </section>

          {/* Section: Travel Information */}
          <section className={styles.section}>
            <TravelInfo />
          </section>

          {/* Section: Schedule */}
          {/* <section className={styles.section}>
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
          </section> */}

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
              Hilltop Wedding Center, located in Sylvan Lake, Alberta, offers on-site parking for guests attending events at their expansive 20-acre property. The venue is equipped to accommodate up to 200 guests, with parking facilities designed to support this capacity. Signs will direct you to the designated wedding parking area upon arrival.
            </p>
            <p className={styles.sectionText}>
              Additionally, if you require transportation, Hilltop Wedding Center can provide golf carts for guests with mobility challenges. Please let us know in advance if you require this service so we can make the necessary arrangements.
            </p>
            <p className={styles.sectionText}>
              Please note that overnight parking is not permitted at the venue due to ongoing maintenance and preparation for subsequent events. However, nearby options like Jarvis Bay Campground and several top-notch hotels in Sylvan Lake are available for extended stays. Jarvis Bay Campground is just down the road and offers a range of amenities for a comfortable overnight experience.
            </p>
          </section>
        </div>
      </div>
    </div >
  );
}
