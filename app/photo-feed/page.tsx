// app/photo-feed/page.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, useCallback } from "react";
import Header from "../components/Header"; // Adjust path as needed
import styles from "./PhotoFeed.module.css";
import Image from "next/image";
import { FaTrash, FaLock, FaUnlock, FaSpinner, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

// --- Updated MediaItem Interface ---
interface MediaItem {
  id: number;
  name: string;
  url: string;
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
  uploaderName?: string;
}

interface ApiResponse {
  success: boolean;
  media?: MediaItem[];
  message?: string;
  error?: string;
}

// Notification Bar Component
const NotificationBar = ({ message, type, onClose }: { message: string | null; type: "success" | "error"; onClose: () => void }) => {
  // useEffect is now at the top level
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (message) { // Logic depending on message is inside the hook
      timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, onClose]); // Dependencies remain the same

  if (!message) return null; // Conditional return remains

  return (
    <div className={`${styles.notificationBar} ${type === "success" ? styles.success : styles.error}`}>
      {type === "success" ? <FaCheckCircle className={styles.notificationIcon} /> : <FaExclamationTriangle className={styles.notificationIcon} />}
      <span>{message}</span>
      <button onClick={onClose} className={styles.notificationClose}>&times;</button>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.confirmationModalOverlay}>
      <div className={styles.confirmationModalContent}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={styles.confirmationModalActions}>
          <button onClick={onCancel} className={`${styles.button} ${styles.buttonSecondary}`}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`${styles.button} ${styles.buttonDanger}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// LightboxModal Component
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
            style={{ objectFit: "contain" }} // Ensure image is contained
            unoptimized={true}
            priority
          />
        ) : type?.startsWith("video/") ? (
          <video src={src} controls autoPlay className={styles.lightboxMedia} aria-label={alt}>
            Your browser does not support the video tag.
          </video>
        ) : (
          <p id="lightboxTitle" className={styles.unsupportedText}>Unsupported media type: {alt}</p>
        )}
      </div>
    </div>
  );
};

export default function PhotoFeedPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentGuestId, setCurrentGuestId] = useState<number | null>(1); // Example: Guest ID 1

  // Wrapped fetchMedia in useCallback
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const response = await fetch("/api/get-guest-media");
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to load media.");
      }
      setMediaItems(data.media || []);

      if ((data.media || []).length === 0 && !pageError) { // Check !pageError to avoid overwriting an existing fetch error
        setPageError("No photos or videos have been shared yet. Check back soon!");
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setPageError(errorMessage);
      setNotification({ message: `Error fetching media: ${errorMessage}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [pageError]); // Added pageError to dependency array

  useEffect(() => {
    fetchMedia(); // fetchMedia is now stable due to useCallback
    const authStatus = sessionStorage.getItem("photoFeedAdminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    // Example of how you might use setCurrentGuestId if needed.
    // If setCurrentGuestId remains unused, the ESLint disable comment above handles it.
    // setCurrentGuestId(prevId => prevId); 
  }, [fetchMedia]); // Added fetchMedia to dependency array

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
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg==";
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("photoFeedAdminAuthenticated", "true");
      setShowAuthModal(false);
      setPassword("");
      setNotification({ message: "Admin login successful.", type: "success" });
    } else {
      setAuthError("Incorrect password.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("photoFeedAdminAuthenticated");
    setNotification({ message: "Logged out successfully.", type: "success" });
  };

  const requestDeleteMedia = (item: MediaItem) => {
    if (!isAuthenticated) {
      setNotification({ message: "You must be authenticated to delete media.", type: "error" });
      return;
    }
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteMedia = async () => {
    if (!itemToDelete || !isAuthenticated) return;
    setShowDeleteConfirmModal(false);
    setIsLoading(true); // Indicate loading state during deletion
    try {
      const adminPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg==";
      const response = await fetch("/api/delete-guest-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gcsObjectName: itemToDelete.name, password: adminPassword }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete media item.");
      }
      setMediaItems(prevItems => prevItems.filter(item => item.name !== itemToDelete.name));
      setNotification({ message: result.message || "Media item deleted successfully.", type: "success" });
      if (mediaItems.filter(item => item.name !== itemToDelete.name).length === 0) {
        setPageError("No photos or videos have been shared yet. Check back soon!");
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setNotification({ message: `Error: ${errorMessage}`, type: "error" });
    } finally {
      setItemToDelete(null);
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <Header />
      {/* Pass notification.message or null to NotificationBar */}
      <NotificationBar
        message={notification ? notification.message : null}
        type={notification ? notification.type : "success"}
        onClose={() => setNotification(null)}
      />
      <div className={styles.pageContainer}>
        <div className={styles.titleContainer}>
            <h1 className={styles.pageTitle}>Moments From The Wedding</h1>
            {isAuthenticated ? (
            <button onClick={handleLogout} className={`${styles.button} ${styles.authToggleButton}`} title="Logout Admin">
                <FaUnlock aria-hidden="true" /> Admin Mode
            </button>
            ) : (
            <button onClick={() => setShowAuthModal(true)} className={`${styles.button} ${styles.authToggleButton}`} title="Admin Login">
                <FaLock aria-hidden="true" /> Admin
            </button>
            )}
        </div>
        <p className={styles.pageSubtitle}>
          See the moments captured by you, our wonderful guests!
        </p>

        {showAuthModal && !isAuthenticated && (
          <div className={styles.authModalOverlay}>
            <div className={styles.authModalContent}>
              <button className={styles.modalCloseButton} onClick={() => { setShowAuthModal(false); setAuthError(null); setPassword("");}} aria-label="Close admin login">&times;</button>
              <h2>Admin Login</h2>
              <form onSubmit={handleAuthSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={styles.authInput}
                  aria-label="Admin password"
                />
                {authError && <p className={styles.authError} role="alert">{authError}</p>}
                <button type="submit" className={`${styles.button} ${styles.authSubmitButton}`}>Login</button>
              </form>
            </div>
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingIndicator}>
            <FaSpinner className={styles.spinnerIcon} aria-label="Loading" />
            <p>Loading memories...</p>
          </div>
        )}
        {pageError && !isLoading && mediaItems.length === 0 && (
            <div className={styles.emptyStateContainer}>
                <FaExclamationTriangle className={styles.emptyStateIcon} />
                <p className={styles.errorMessage}>{pageError}</p>
            </div>
        )}

        {!isLoading && mediaItems.length > 0 && (
          <div className={styles.feedGrid}>
            {mediaItems.map((item, index) => (
              <div key={item.id || item.name} className={styles.feedItem}>
                <div className={styles.mediaWrapper} onClick={() => openLightbox(item)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}>
                  {item.contentType?.startsWith("image/") ? (
                    <Image
                      src={item.url}
                      alt={`Shared by guest: ${item.name}`}
                      width={400}
                      height={300}
                      className={styles.mediaContent}
                      style={{ objectFit: "cover" }}
                      unoptimized={true}
                      priority={index < 3} // Prioritize loading for the first few images
                    />
                  ) : item.contentType?.startsWith("video/") ? (
                    <div className={styles.videoPlaceholder}>
                      <video
                        src={item.url + '#t=0.1'} // For thumbnail
                        className={styles.mediaContent}
                        preload="metadata"
                        aria-label={`Shared by guest: ${item.name}`}
                        muted
                        playsInline
                        poster="" // Consider adding a poster image if available
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className={styles.playIconOverlay}>
                        <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.unsupportedMedia}>
                      <FaExclamationTriangle className={styles.unsupportedIcon} />
                      <p>Unsupported file</p>
                      <span className={styles.fileNameText}>{item.name}</span>
                    </div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.uploadDate}>
                    {formatDate(item.timeCreated)}
                  </span>
                  {isAuthenticated && (
                    <button
                      onClick={() => requestDeleteMedia(item)}
                      className={styles.deleteButton}
                      title="Delete this item"
                      aria-label={`Delete media item ${item.name}`}
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
      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteMedia}
        onCancel={() => setShowDeleteConfirmModal(false)}
        confirmText="Delete"
      />
    </>
  );
}
