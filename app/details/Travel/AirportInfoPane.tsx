//app/details/Travel/AirportInfoPane.tsx
"use client";

import React, { useState, useEffect } from "react"; // Add useEffect import
import { animated, useSpring, config, SpringValue } from "@react-spring/web";
import styles from "./AirportInfoPane.module.css";

type AnimatedDivProps = {
  style?: {
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundBlendMode?: string; // Added property
    height?: SpringValue<string> | string;
  };
  children?: React.ReactNode;
  className?: string;
};

const AnimatedDiv = animated.div as React.ComponentType<AnimatedDivProps>;

interface AirportInfoProps {
  name: string;
  description: string;
  link: string;
  mapEmbedUrl: string;
  image: string;
}

export default function AirportInfoPane({
  name,
  description,
  link,
  mapEmbedUrl,
  image,
}: AirportInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  const togglePane = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const animatedHeight = useSpring({
    height: isExpanded ?
      (windowWidth < 768 ? "700px" : "550px") :
      "200px",
    config: config.gentle,
  });

  return (
    <AnimatedDiv
      className={styles.airportInfoPane}
      // Update the style prop in your AnimatedDiv component
      style={{
        height: animatedHeight.height,
        backgroundImage: isExpanded 
        ? `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${image})`
        : `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: isExpanded ? "overlay" : "normal",
      }}
    >
      {/* Rest of your JSX remains the same */}
      {!isExpanded && (
        <div className={styles.collapsedContent} onClick={togglePane}>
          <h2 className={styles.airportName}>{name}</h2>
          <button className={styles.toggleButton} aria-label="Expand">
            +
          </button>
        </div>
      )}

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.details}>
            <h2 className={styles.airportName}>{name}</h2>
            <p className={styles.description}>{description}</p>
            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
              Visit {name}&apos;s Website
            </a>
          </div>
          <div className={styles.mapContainer}>
            <iframe
              src={mapEmbedUrl}
              title={`${name} Location`}
              allowFullScreen
              loading="eager"
            />
          </div>
          <div className={styles.centeredButtonWrapper}>
            <button
              className={styles.toggleButton}
              onClick={togglePane}
              aria-label="Collapse"
            >
              -
            </button>
          </div>
        </div>
      )}
    </AnimatedDiv>
  );
}