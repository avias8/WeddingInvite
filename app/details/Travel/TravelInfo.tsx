"use client";

import React from "react";
import styles from "./TravelInfo.module.css";
import HotelInfoPane from "./HotelInfo";
import AirportInfoPane from "./AirportInfoPane";
import Directions from "./Directions";
import Restaurants from "./Restaurants";


const airportInfo = [
  {
    name: "Calgary International Airport (YYC)",
    description: "The airport we reccomend, in the city of Calgary, approximately 90 minutes from the venue.",
    link: "https://www.yyc.com/",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10015.11691416996!2d-114.01669712729024!3d51.130980147679374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5371640f7bf63b77%3A0xdbe9871f5cbc7457!2sCalgary%20International%20Airport!5e0!3m2!1sen!2sca!4v1737888071801!5m2!1sen!2sca",
    image: "https://cdn.avivarma.ca/Images/YYC.png",
  },
  {
    name: "Edmonton International Airport (YEG)",
    description: "Another option, located in Edmonton, approximately 2 hours from the venue.",
    link: "https://flyeia.com/",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2384.267271658254!2d-113.5814959148082!3d53.30265951100569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x539ff7617591b075%3A0xf9847601ed3d84b7!2sEdmonton%20International%20Airport!5e0!3m2!1sen!2sca!4v1737888117395!5m2!1sen!2sca",
    image: "https://cdn.avivarma.ca/Images/YEG.webp",
  },
];

export default function TravelInfo() {
  return (
    <div className={styles.travelInfoWrapper}>
      {/* Airport Info Section */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>
          <span role="img" aria-label="airplane">✈️</span> Airports
        </h2>
        {airportInfo.map((airport, index) => (
          <AirportInfoPane
            key={index}
            name={airport.name}
            description={airport.description}
            link={airport.link}
            mapEmbedUrl={airport.mapEmbedUrl}
            image={airport.image}
          />
        ))}
      </section>

      {/* Lodging Options */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>
          <span role="img" aria-label="hotel">🏨</span> Lodging
        </h2>
        <div>
          {/* Best Western Plus */}
          <HotelInfoPane
            name="Best Western Plus Chateau Inn"
            address="5027 Lakeshore Drive, Sylvan Lake, Alberta, Canada, T4S 1R3"
            description="Be sure to mention the booking under 'Shakthi Ganesh Sankar' for special rates."
            mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2439.3424461506456!2d-114.10210558666401!3d52.30978827189029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5375b2c21fe7a5f1%3A0xa0c38af8504ca11e!2sBest%20Western%20Plus%20Chateau%20Inn%20Sylvan%20Lake!5e0!3m2!1sen!2sca!4v1737875948428!5m2!1sen!2sca"
          />

          {/* Prairie Moon Inn */}
          <HotelInfoPane
            name="Prairie Moon Inn"
            address="13 Beju Ind. Drive, Sylvan Lake, Alberta, Canada, T4S 2J4"
            description="Be sure to mention the booking under 'Shakthi & Avi&apos;s wedding' for special rates"
            mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2439.3492405226584!2d-114.0743869233765!3d52.30966497200679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5375b2bb309a2a0d%3A0xdc2991c288cca035!2sPrairie%20Moon%20Inn%20Sylvan%20Lake!5e0!3m2!1sen!2sca!4v1737887504117!5m2!1sen!2sca"
          />
        </div>
      </section>

      {/* Directions */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>
            <span role="img" aria-label="Directions">🗺️</span> Directions
        </h2>
        <Directions />
      </section>

      {/* Restauraunts */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>
            <span role="img" aria-label="Restaurants">🍽️</span> Restauraunts
        </h2>
        <Restaurants />
      </section>
    </div>
  );
}