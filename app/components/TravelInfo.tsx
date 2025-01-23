"use client";

import React from "react";
import styles from "./TravelInfo.module.css";

const airportInfo = [
  {
    name: "Calgary International Airport (YYC)",
    description: "The nearest major airport, approximately 20 minutes from the venue.",
    link: "https://www.yyc.com/",
  },
];

const lodgingOptions = [
  {
    name: "Marriott Calgary Downtown",
    description: "Luxury hotel in the heart of the city, near major attractions.",
    link: "https://www.marriott.com/en-us/hotels/yyccr-calgary-marriott-downtown-hotel/overview/",
  },
  {
    name: "Hilton Garden Inn Calgary Airport",
    description: "Comfortable lodging close to the airport and venue.",
    link: "https://www.hilton.com/en/hotels/yyccaht-hilton-garden-inn-calgary-airport/",
  },
];

const directions = [
  {
    mode: "By Car",
    details: "Parking is available at the venue. Use GPS to navigate to: 123 Wedding Way, Calgary, AB.",
  },
  {
    mode: "Public Transit",
    details: "Take the C-Train to Downtown and transfer to Bus #14 to Wedding Way.",
  },
];

export default function TravelInfo() {
    return (
      <div className={styles.travelInfoWrapper}>
        <h1 className={styles.title}>Travel Information</h1>
  
        {/* Airport Info Section */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <span role="img" aria-label="airplane">✈️</span> Airport Information
          </h2>
          <ul className={styles.list}>
            {airportInfo.map((airport, index) => (
              <li key={index} className={styles.listItem}>
                <a href={airport.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {airport.name}
                </a>{" "}
                - {airport.description}
              </li>
            ))}
          </ul>
        </section>
  
        {/* Lodging Options */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <span role="img" aria-label="hotel">🏨</span> Lodging
          </h2>
          <ul className={styles.list}>
            {lodgingOptions.map((lodging, index) => (
              <li key={index} className={styles.listItem}>
                <a href={lodging.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {lodging.name}
                </a>{" "}
                - {lodging.description}
              </li>
            ))}
          </ul>
        </section>
  
        {/* Directions */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            <span role="img" aria-label="car">🚗</span> Directions
          </h2>
          <ul className={styles.list}>
            {directions.map((direction, index) => (
              <li key={index} className={styles.listItem}>
                <strong>{direction.mode}:</strong> {direction.details}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }
  
