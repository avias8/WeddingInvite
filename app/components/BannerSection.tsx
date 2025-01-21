"use client";

import React from "react";
import styles from "./BannerSection.module.css";

interface BannerSectionProps {
  /** URL or path to the left image */
  leftImageSrc: string;
  /** URL or path to the right image */
  rightImageSrc: string;
  /** Bride’s name (or left name) */
  brideName: string;
  /** Groom’s name (or right name) */
  groomName: string;
  /** The wedding date, e.g. "06 • 29 • 2024" */
  weddingDate: string;
}

export default function BannerSection({
  leftImageSrc,
  rightImageSrc,
  brideName,
  groomName,
  weddingDate,
}: BannerSectionProps) {
  return (
    <div className={styles.bannerContainer}>
      {/* Left image */}
      <div className={styles.imageWrapper}>
        <img
          src={leftImageSrc}
          alt={`${brideName} - left side`}
          className={styles.editImage}
        />
      </div>

      {/* Center text - e.g. date + names */}
      <div className={styles.centerSection}>
        <div className={styles.names}>
          {brideName}{" "}
          <span className={styles.ampersand}>&amp;</span>{" "}
          {groomName}
        </div>
        <div className={styles.dateText}>
          {weddingDate}
        </div>
      </div>

      {/* Right image */}
      <div className={styles.imageWrapper}>
        <img
          src={rightImageSrc}
          alt={`${groomName} - right side`}
          className={styles.editImage}
        />
      </div>
    </div>
  );
}
