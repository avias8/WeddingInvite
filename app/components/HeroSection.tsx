"use client";
import React from "react";
import styles from "./HeroSection.module.css"; // New CSS module

interface HeroSectionProps {
  mp4Src: string;
  webmSrc: string;
  heroText: string;
  /** Optional text displayed if the video doesn’t load */
  altText?: string;
}

export default function HeroSection({
  mp4Src,
  webmSrc,
  heroText,
  altText = "Your browser does not support the video tag.",
}: HeroSectionProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.videoContainer}>
        <video autoPlay muted loop playsInline className={styles.heroVideo}>
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
          {altText}
        </video>
        <div className={styles.heroOverlay}>
          <h1>
            <span>{heroText}</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
