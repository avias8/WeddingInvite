// app/photo-feed/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header"; // Adjust path as needed
import styles from "./PhotoFeed.module.css"; // We'll create this CSS module
import Image from "next/image"; // For optimized images

interface MediaItem {
  name: string;
  url: string;
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
}

interface ApiResponse {
  success: boolean;
  media?: MediaItem[];
  message?: string;
  error?: string;
}

// Lightbox Modal Component
const LightboxModal = ({ src, alt, type, onClose }: { src: string; alt: string; type: string | undefined; onClose: () => void }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Close modal on click outside content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);


  return (
    <div className={styles.lightboxOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="lightboxTitle">
      <div className={styles.lightboxContent} ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose} aria-label="Close media view">&times;</button>
        {type?.startsWith("image/") ? (
          <img src={src} alt={alt} className={styles.lightboxMedia} />
        ) : type?.startsWith("video/") ? (
          <video src={src} controls autoPlay className={styles.lightboxMedia} aria-label={alt}>
            Your browser does not support the video tag.
          </video>
        ) : (
          <p id="lightboxTitle">Unsupported media type: {alt}</p>
        )}
      </div>
    </div>
  );
};


export default function PhotoFeedPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/get-guest-media");
        const data: ApiResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || data.message || "Failed to load media.");
        }
        setMediaItems(data.media || []);
        if (data.media?.length === 0) {
          setError("No photos or videos have been shared yet. Check back soon!");
        }
      } catch (err) {
        console.error("Error fetching media:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const openLightbox = (item: MediaItem) => {
    setLightboxItem(item);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };


  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Moments From The Wedding</h1>
        <p className={styles.pageSubtitle}>
          See the moments captured by you, our wonderful guests!
        </p>

        {isLoading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
            <p>Loading memories...</p>
          </div>
        )}
        {error && !isLoading && <p className={styles.errorMessage}>{error}</p>}

        {!isLoading && !error && mediaItems.length > 0 && (
          <div className={styles.feedContainer}>
            {mediaItems.map((item) => (
              <div key={item.name} className={styles.feedItem} onClick={() => openLightbox(item)}>
                <div className={styles.mediaWrapper}>
                  {item.contentType?.startsWith("image/") ? (
                    <Image
                      src={item.url}
                      alt={`Shared by guest: ${item.name}`}
                      width={400} // Provide appropriate intrinsic or layout sizes
                      height={300}
                      className={styles.mediaContent}
                      style={{ objectFit: "cover" }}
                      unoptimized={true} // Important for GCS Signed URLs if domain isn't configured
                    />
                  ) : item.contentType?.startsWith("video/") ? (
                    <div className={styles.videoPlaceholder}>
                      <video
                        src={item.url}
                        className={styles.mediaContent}
                        preload="metadata" // Only load metadata initially
                        width="100%"
                        height="auto"
                        aria-label={`Shared by guest: ${item.name}`}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className={styles.playIconOverlay}>▶</div>
                    </div>
                  ) : (
                    <div className={styles.unsupportedMedia}>
                      <p>Unsupported file type</p>
                      <span>{item.name}</span>
                    </div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                   {/* You could add uploader name here if you store it */}
                  <span className={styles.uploadDate}>
                    Shared on: {formatDate(item.timeCreated)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {lightboxItem && (
        <LightboxModal
          src={lightboxItem.url}
          alt={`Media: ${lightboxItem.name}`}
          type={lightboxItem.contentType}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
