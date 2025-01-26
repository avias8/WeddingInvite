"use client";

import React from "react";
import styles from "./Directions.module.css";

const directions = [
  {
    mode: "By Car from Calgary",
    details: [
      "Start by taking the QE2 Highway (Highway 2) northbound from Calgary.",
      "Continue for approximately 150 kilometers until you reach Exit 401 for Highway 11A towards Sylvan Lake.",
      "Take this exit and proceed west on Highway 11A for about 10 kilometers.",
      "Turn right onto Highway 20 North and continue for approximately 2 kilometers.",
      "Look for Blue Sign 39145; the Hilltop Wedding Center will be on your left.",
    ],
  },
  {
    mode: "By Car from Edmonton",
    details: [
      "Begin by taking the QE2 Highway (Highway 2) southbound from Edmonton.",
      "Continue for approximately 150 kilometers until you reach Exit 401 for Highway 11A towards Sylvan Lake.",
      "Take this exit and proceed west on Highway 11A for about 10 kilometers.",
      "Turn right onto Highway 20 North and continue for approximately 2 kilometers.",
      "Look for Blue Sign 39145; the Hilltop Wedding Center will be on your left.",
    ],
  },
];

export default function Directions() {
  return (
    <div className={styles.directionsWrapper}>
      <h2 className={styles.title}>Directions</h2>
      <ul className={styles.directionsList}>
        {directions.map((direction, index) => (
          <li key={index} className={styles.directionItem}>
            <h3 className={styles.mode}>{direction.mode}</h3>
            <ul className={styles.bullets}>
              {direction.details.map((detail, detailIndex) => (
                <li key={detailIndex} className={styles.detail}>
                  {detail}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {/* Get Directions Button */}
      <div className={styles.buttonWrapper}>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Hilltop+Wedding+Center,+Sylvan+Lake,+AB"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.getDirectionsButton}
        >
          Get Directions
        </a>
      </div>
    </div>
  );
}