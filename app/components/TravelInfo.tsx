"use client";

import React from "react";
import styles from "./TravelInfo.module.css";
import HotelInfoPane from "./HotelInfo";

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
        <HotelInfoPane
          name="Best Western Plus Chateau Inn"
          address="5027 Lakeshore DriveSylvan LakeAlbertaCanadaT4S1R3"
          description="Hotel Description
Be sure to enjoy recreational amenities, including an indoor pool, a spa tub, and a fitness center. This hotel also features complimentary wireless internet access, a television in a common area, and a banquet hall.

A complimentary full breakfast is served daily.

Featured amenities include a business center, express check-out, and complimentary newspapers in the lobby. Event facilities at this hotel consist of conference space and meeting rooms. Free self parking is available onsite.

Make yourself at home in one of the 72 air-conditioned rooms featuring refrigerators and microwaves. 37-inch flat-screen televisions with cable programming provide entertainment, while complimentary wireless internet access keeps you connected. Private bathrooms with bathtubs or showers feature complimentary toiletries and hair dryers. Conveniences include desks and coffee/tea makers, as well as phones with free local calls.

With a stay at Best Western Plus Chateau Inn Sylvan Lake in Sylvan Lake, you'll be within a 10-minute walk of Sylvan Lake and Sylvan Lake Provincial Park. This hotel is 0.5 mi (0.7 km) from Lakeside Go Karts and Mini-Golf and 0.5 mi (0.8 km) from Sylvan Lake Marina Bay."
          image="Images\hotel1.jpg"
          mapEmbedUrl="https://www.google.com/maps/embed?pb=..."
        />
        <HotelInfoPane
          name="Best Western Plus Chateau Inn"
          address="5027 Lakeshore DriveSylvan LakeAlbertaCanadaT4S1R3"
          description="Hotel Description
Be sure to enjoy recreational amenities, including an indoor pool, a spa tub, and a fitness center. This hotel also features complimentary wireless internet access, a television in a common area, and a banquet hall.

A complimentary full breakfast is served daily.

Featured amenities include a business center, express check-out, and complimentary newspapers in the lobby. Event facilities at this hotel consist of conference space and meeting rooms. Free self parking is available onsite.

Make yourself at home in one of the 72 air-conditioned rooms featuring refrigerators and microwaves. 37-inch flat-screen televisions with cable programming provide entertainment, while complimentary wireless internet access keeps you connected. Private bathrooms with bathtubs or showers feature complimentary toiletries and hair dryers. Conveniences include desks and coffee/tea makers, as well as phones with free local calls.

With a stay at Best Western Plus Chateau Inn Sylvan Lake in Sylvan Lake, you'll be within a 10-minute walk of Sylvan Lake and Sylvan Lake Provincial Park. This hotel is 0.5 mi (0.7 km) from Lakeside Go Karts and Mini-Golf and 0.5 mi (0.8 km) from Sylvan Lake Marina Bay."
          image="Images\hotel1.jpg"
          mapEmbedUrl="https://www.google.com/maps/embed?pb=..."
        />
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

