import React, { useState } from "react";
import Image from "next/image";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import styles from "../photo-feed/PhotoFeed.module.css"; // Import styles from PhotoFeed.module.css

interface MediaItem {
  id: string;
  name: string;
  url: string;
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated?: string | undefined;
  uploaderId?: number | null;
  uploaderName?: string | null;
  caption?: string | null;
}

interface MediaDisplayProps {
  item: MediaItem;
  uploaderDisplayName: string;
  onMediaClick: (item: MediaItem) => void;
  loadingStrategy?: "lazy" | "eager";
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ item, uploaderDisplayName, onMediaClick, loadingStrategy = "lazy" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={styles.mediaDisplayContainer} onClick={(e) => { e.stopPropagation(); onMediaClick(item); }}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <FaSpinner className={styles.loadingSpinner} />
        </div>
      )}
      {hasError ? (
        <div className={styles.unsupportedMedia}>
          <FaExclamationTriangle className={styles.unsupportedIcon} />
          <p>Error loading media</p>
        </div>
      ) : item.contentType?.startsWith("image/") ? (
        <Image
          src={item.url}
          alt={`Shared by ${uploaderDisplayName}: ${item.name}`}
          width={350}
          height={262}
          className={`${styles.mediaContent} ${isLoading ? styles.hidden : ""}`}
          style={{ objectFit: "cover" }}
          loading={loadingStrategy}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : item.contentType?.startsWith("video/") ? (
        <div className={styles.videoPlaceholder}>
          <video
            src={item.url + '#t=0.1'}
            className={`${styles.mediaContent} ${isLoading ? styles.hidden : ""}`}
            preload={loadingStrategy === "eager" ? "auto" : "metadata"}
            aria-label={`Shared by ${uploaderDisplayName}: ${item.name}`}
            muted
            playsInline
            onLoadedData={handleLoad}
            onError={handleError}
          >
            Your browser does not support the video tag.
          </video>
          <div className={`${styles.playIconOverlay} ${isLoading ? styles.hidden : ""}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      ) : (
        <div className={styles.unsupportedMedia}>
          <FaExclamationTriangle className={styles.unsupportedIcon} />
          <p>Unsupported file</p>
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;
