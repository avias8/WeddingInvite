"use client";

import React, { useState } from "react";
import styles from "./AirportInfoPane.module.css";

interface AirportInfoProps {
  name: string;
  description: string;
  link: string; // Link to the airport website
  mapEmbedUrl: string; // Embedded Google Map URL
  image: string; // Background image URL for the collapsed view
}

export default function AirportInfoPane({
  name,
  description,
  link,
  mapEmbedUrl,
  image,
}: AirportInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePane = () => setIsExpanded(!isExpanded);

  return (
    <div className={styles.airportInfoPane}>
      {/* Collapsed View */}
      {!isExpanded ? (
        <div
          className={styles.collapsed}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={togglePane}
        >
          <div className={styles.collapsedContent}>
            <h2 className={styles.airportName}>{name}</h2>
            <button className={styles.toggleButton} aria-label="Expand">
              +
            </button>
          </div>
        </div>
      ) : (
        // Expanded View
        <div className={styles.expanded}>
          <div className={styles.details}>
            <h2 className={styles.airportName}>{name}</h2>
            <p className={styles.description}>{description}</p>
            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
              Visit {name}'s Website
            </a>
          </div>
          <div className={styles.mapContainer}>
            <iframe
              src={mapEmbedUrl}
              title={`${name} Location`}
              allowFullScreen
              loading="lazy"
            />
          </div>
          <button
            className={styles.toggleButton}
            onClick={togglePane}
            aria-label="Collapse"
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}