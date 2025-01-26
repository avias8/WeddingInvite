//app/components/HotelInfo.tsx
"use client";

import { useState } from "react";
import styles from "./HotelInfo.module.css";

interface HotelInfoProps {
  name: string;
  address: string;
  description: string;
  image: string; // URL to the hotel image
  mapEmbedUrl: string; // Google Maps Embed URL
}

export default function HotelInfoPane({
  name,
  address,
  description,
  image,
  mapEmbedUrl,
}: HotelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePane = () => setIsExpanded(!isExpanded);

  return (
    <div className={styles["hotel-info-pane"]}>
      {/* Collapsed View */}
      {!isExpanded ? (
        <div
          className={styles["collapsed-pane"]}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={togglePane}
        >
          <div className={styles["collapsed-content"]}>
            <h2 className={styles["hotel-name"]}>{name}</h2>
            <button className={styles["expand-btn"]} aria-label="Expand">
              +
            </button>
          </div>
        </div>
      ) : (
        // Expanded View
        <div className={styles["expanded-pane"]}>
          <div className={styles.content}>
            <div className={styles["image-container"]}>
              <img src={image} alt={name} className={styles["hotel-image"]} />
            </div>
            <div className={styles.details}>
              <h2>{name}</h2>
              <p className={styles.address}>{address}</p>
              <p className={styles.description}>{description}</p>
            </div>
          </div>
          <div className={styles["map-container"]}>
            <iframe
              src={mapEmbedUrl}
              title={`${name} Location`}
              allowFullScreen
              loading="lazy"
            />
          </div>
          <button
            className={styles["collapse-btn"]}
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
