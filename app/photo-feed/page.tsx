// app/photo-feed/page.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import Header from "../components/Header"; // Adjust path as needed
import styles from "./PhotoFeed.module.css"; // We'll create this CSS module
import Image from "next/image"; // For optimized images
import { FaTrash, FaLock, FaUnlock } from "react-icons/fa"; // Icons

interface MediaItem {
  name: string; // This is the GCS object name
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

// Lightbox Modal Component (remains the same as you provided)
const LightboxModal = ({ src, alt, type, onClose }: { src: string; alt: string; type: string | undefined; onClose: () => void }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

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
          <Image
            src={src}
            alt={alt}
            className={styles.lightboxMedia}
            width={800}
            height={600}
            unoptimized={true}
          />
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

  // --- Authentication State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  // --- End Authentication State ---

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
      if (data.media?.length === 0 && !error) { // Avoid overwriting existing errors
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

  useEffect(() => {
    fetchMedia();
    // Check session storage for authentication status
    const authStatus = sessionStorage.getItem("photoFeedAdminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []); // Removed 'error' from dependency array to prevent re-fetch on error state change

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

  // --- Authentication Handlers ---
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg==";
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("photoFeedAdminAuthenticated", "true");
      setShowAuthModal(false);
      setPassword("");
    } else {
      setAuthError("Incorrect password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("photoFeedAdminAuthenticated");
  };
  // --- End Authentication Handlers ---

  // --- Delete Media Handler ---
  const handleDeleteMedia = async (gcsObjectName: string) => {
    if (!isAuthenticated) {
      alert("You must be authenticated to delete media.");
      return;
    }
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Are you sure you want to delete this item: ${gcsObjectName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const adminPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg=="; // Use the same password for API auth
      const response = await fetch("/api/delete-guest-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gcsObjectName, password: adminPassword }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete media item.");
      }

      // Refresh media list after deletion
      setMediaItems(prevItems => prevItems.filter(item => item.name !== gcsObjectName));
      alert(result.message || "Media item deleted successfully."); // eslint-disable-line no-alert
      if (mediaItems.length -1 === 0) {
          setError("No photos or videos have been shared yet. Check back soon!");
      }


    } catch (err) {
      console.error("Error deleting media:", err);
      alert(`Error: ${err instanceof Error ? err.message : "An unknown error occurred."}`); // eslint-disable-line no-alert
    }
  };
  // --- End Delete Media Handler ---

  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <div className={styles.titleContainer}>
            <h1 className={styles.pageTitle}>Moments From The Wedding</h1>
            {isAuthenticated ? (
            <button onClick={handleLogout} className={styles.authToggleButton} title="Logout Admin">
                <FaUnlock /> Admin Mode
            </button>
            ) : (
            <button onClick={() => setShowAuthModal(true)} className={styles.authToggleButton} title="Admin Login">
                <FaLock /> Admin
            </button>
            )}
        </div>
        <p className={styles.pageSubtitle}>
          See the moments captured by you, our wonderful guests!
        </p>

        {/* Auth Modal */}
        {showAuthModal && !isAuthenticated && (
          <div className={styles.authModalOverlay}>
            <div className={styles.authModalContent}>
              <button className={styles.authModalClose} onClick={() => setShowAuthModal(false)}>&times;</button>
              <h2>Admin Login</h2>
              <form onSubmit={handleAuthSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={styles.authInput}
                />
                {authError && <p className={styles.authError}>{authError}</p>}
                <button type="submit" className={styles.authSubmitButton}>Login</button>
              </form>
            </div>
          </div>
        )}

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
              <div key={item.name} className={styles.feedItem}>
                <div className={styles.mediaWrapper} onClick={() => openLightbox(item)}>
                  {item.contentType?.startsWith("image/") ? (
                    <Image
                      src={item.url}
                      alt={`Shared by guest: ${item.name}`}
                      width={400}
                      height={300}
                      className={styles.mediaContent}
                      style={{ objectFit: "cover" }}
                      unoptimized={true}
                    />
                  ) : item.contentType?.startsWith("video/") ? (
                    <div className={styles.videoPlaceholder}>
                      <video
                        src={item.url}
                        className={styles.mediaContent}
                        preload="metadata"
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
                  <span className={styles.uploadDate}>
                    Shared on: {formatDate(item.timeCreated)}
                  </span>
                  {isAuthenticated && (
                    <button
                      onClick={() => handleDeleteMedia(item.name)}
                      className={styles.deleteButton}
                      title="Delete this item"
                    >
                      <FaTrash />
                    </button>
                  )}
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
