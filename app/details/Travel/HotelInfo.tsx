"use client";

import { useState } from "react";
import { animated, useSpring, config, SpringValue } from "@react-spring/web";
import Image from "next/image";
import styles from "./HotelInfo.module.css";

type AnimatedDivProps = {
  style?: {
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundBlendMode?: string;
    height?: SpringValue<string> | string;
  };
  children?: React.ReactNode;
  className?: string;
};

const AnimatedDiv = animated.div as React.ComponentType<AnimatedDivProps>;

interface HotelInfoProps {
  name: string;
  address: string;
  description: string;
  mapEmbedUrl: string;
}

export default function HotelInfoPane({
  name,
  address,
  description,
  mapEmbedUrl,
}: HotelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hotelImages: Record<string, string> = {
    "Best Western Plus Chateau Inn": "https://cdn.avivarma.ca/Images/hotel1.jpg",
    "Prairie Moon Inn": "https://cdn.avivarma.ca/Images/hotel2.webp",
    "Sylvan Lake Lodge": "https://cdn.avivarma.ca/Images/hotel3.jpg",
  };

  const backgroundImage = hotelImages[name] || "https://cdn.avivarma.ca/Images/default-hotel.jpg";

  const togglePane = () => setIsExpanded(!isExpanded);

  const animatedHeight = useSpring({
    height: isExpanded ? "800px" : "200px",
    config: config.gentle,
  });

  return (
    <AnimatedDiv
      className={styles.hotelInfoPane}
      style={{
        height: animatedHeight.height,
        backgroundImage: isExpanded 
          ? `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${backgroundImage})`
          : `linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: isExpanded ? "overlay" : "multiply",
      }}
    >
      {!isExpanded ? (
        <div className={styles.collapsedContent} onClick={togglePane}>
          <h2 className={styles.hotelName}>{name}</h2>
          <button className={styles.toggleButton} aria-label="Expand">
            +
          </button>
        </div>
      ) : (
        <div className={styles.expandedContent}>
          <div className={styles.content}>
            <div className={styles.imageContainer}>
              <Image
                src={backgroundImage}
                alt={name}
                className={styles.hotelImage}
                width={400}
                height={300}
                priority
              />
            </div>
            <div className={styles.details}>
              <h2 className={styles.hotelName}>{name}</h2>
              <p className={styles.address}>{address}</p>
              <p className={styles.description}>{description}</p>
            </div>
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