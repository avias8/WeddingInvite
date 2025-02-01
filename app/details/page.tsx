"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header"; // <--- Adjust path if needed
import HeroSection from "../components/HeroSection";
import styles from "./details.module.css";
import DressCode from "./DressCode/DressCode";
import TravelInfo from "./Travel/TravelInfo";

export default function DetailsPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Create a media query list that matches if the viewport is 768px or less
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // Define a handler that will update the state based on the media query's match
    interface MediaQueryListEvent {
      matches: boolean;
    }

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set the initial value
    setIsMobile(mediaQuery.matches);

    // Listen for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Cleanup listener on component unmount
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  // Choose video sources based on the viewport width
  const mp4Src = isMobile
    ? "https://storage.googleapis.com/my-wedding-assets/Caramellover.mp4"
    : "https://storage.googleapis.com/my-wedding-assets/CaramelloverCrop.mp4";
  const webmSrc = isMobile
    ? "https://storage.googleapis.com/my-wedding-assets/Caramellover.webm"
    : "https://storage.googleapis.com/my-wedding-assets/Caramellovercrop.webm";

  return (
    <div>
      <Header />

      {/* The outer container with consistent padding */}
      <div className={styles.pageContainer}>
        <HeroSection
          mp4Src={mp4Src}
          webmSrc={webmSrc}
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
            <br />
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
    </div>
  );
}
