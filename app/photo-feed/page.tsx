// app/photo-feed/page.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import Header from "../components/Header"; // Adjust path as needed
import styles from "./PhotoFeed.module.css";
import Image from "next/image";
import { FaTrash, FaLock, FaUnlock, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaHeart, FaComment } from "react-icons/fa"; // Added FaHeart, FaComment

// --- Updated MediaItem Interface ---
interface MediaItem {
  id: number; // Assuming each media item will have a unique ID from the database
  name: string;
  url: string;
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
  likesCount?: number;
  commentsCount?: number;
  currentUserHasLiked?: boolean; // To manage the like button state for the current user
  uploaderName?: string; // Optional: if you want to display who uploaded it
}

interface ApiResponse {
  success: boolean;
  media?: MediaItem[];
  message?: string;
  error?: string;
}

// (NotificationBar, ConfirmationModal, LightboxModal components remain the same)

// Notification Bar Component
const NotificationBar = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  if (!message) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [message, onClose]);

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
            unoptimized={true} // Preserving user's choice
            priority // Good for LCP element in a lightbox
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

// --- (Comment Modal - Placeholder) ---
const CommentModal = ({
  isOpen,
  mediaItem,
  onClose,
  onCommentSubmit,
}: {
  isOpen: boolean;
  mediaItem: MediaItem | null;
  onClose: () => void;
  onCommentSubmit: (mediaId: number, commentText: string) => void;
}) => {
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCommentText(""); // Reset comment text when modal opens
    }
  }, [isOpen]);

  if (!isOpen || !mediaItem) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onCommentSubmit(mediaItem.id, commentText.trim());
      onClose(); // Close modal after submission
    }
  };

  return (
    <div className={styles.authModalOverlay}> {/* Reusing authModalOverlay style for simplicity */}
      <div className={styles.authModalContent}> {/* Reusing authModalContent style */}
        <button className={styles.modalCloseButton} onClick={onClose} aria-label="Close comments">&times;</button>
        <h3>Comments for {mediaItem.name}</h3>
        {/* Placeholder for displaying existing comments */}
        <div className={styles.commentsListPlaceholder}>
          <p><em>Existing comments would appear here.</em></p>
        </div>
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className={styles.commentTextarea}
            rows={3}
          />
          <button type="submit" className={`${styles.button} ${styles.buttonPrimary} ${styles.commentSubmitButton}`}>
            Post Comment
          </button>
        </form>
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

  // --- State for social features ---
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [commentingOnItem, setCommentingOnItem] = useState<MediaItem | null>(null);
  // For guest identification - this is a placeholder.
  // In a real app, this would come from an auth context or similar.
  const [currentGuestId, setCurrentGuestId] = useState<number | null>(1); // Example: Guest ID 1


  const fetchMedia = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const response = await fetch("/api/get-guest-media"); // This API needs to be updated
      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to load media.");
      }
      // Ensure media items have default social counts if not provided by API yet
      const processedMedia = (data.media || []).map(item => ({
        ...item,
        likesCount: item.likesCount || 0,
        commentsCount: item.commentsCount || 0,
        currentUserHasLiked: item.currentUserHasLiked || false,
      }));
      setMediaItems(processedMedia);

      if (processedMedia.length === 0 && !pageError) {
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
  };

  useEffect(() => {
    fetchMedia();
    const authStatus = sessionStorage.getItem("photoFeedAdminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
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
    setIsLoading(true);
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
      if (mediaItems.length - 1 === 0) {
        setPageError("No photos or videos have been shared yet. Check back soon!");
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setNotification({ message: `Error: ${errorMessage}`, type: "error" });
    } finally {
      setItemToDelete(null);
      setIsLoading(false);
    }
  };

  // --- Placeholder Handlers for Like/Comment ---
  const handleLike = async (mediaId: number) => {
    if (!currentGuestId) {
        setNotification({ message: "Please log in to like photos.", type: "error"}); // Or some way to identify user
        return;
    }
    console.log(`Like action for media ID: ${mediaId} by guest ID: ${currentGuestId}`);
    // Optimistic UI update
    setMediaItems(prevItems =>
      prevItems.map(item => {
        if (item.id === mediaId) {
          const currentlyLiked = !item.currentUserHasLiked;
          return {
            ...item,
            likesCount: currentlyLiked
              ? (item.likesCount || 0) + 1
              : Math.max(0, (item.likesCount || 0) - 1),
            currentUserHasLiked: currentlyLiked,
          };
        }
        return item;
      })
    );

    try {
      // API call to POST /api/media/[mediaId]/like with { guestId: currentGuestId }
      // The backend should handle creating/deleting a MediaLike record
      const response = await fetch(`/api/media/${mediaId}/like`, { // TODO: Create this API endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: currentGuestId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update like status.");
      }
      // Optional: Refetch media or update based on API response if not purely optimistic
      // For now, the optimistic update handles the immediate UI change.
      // fetchMedia(); // Or smarter update
    } catch (error) {
      console.error("Error liking media:", error);
      setNotification({ message: (error as Error).message || "Failed to update like.", type: "error" });
      // Revert optimistic update on error
      fetchMedia(); // Simplest way to revert
    }
  };

  const handleOpenCommentModal = (item: MediaItem) => {
     if (!currentGuestId) {
        setNotification({ message: "Please log in to comment.", type: "error"});
        return;
    }
    setCommentingOnItem(item);
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async (mediaId: number, commentText: string) => {
    if (!currentGuestId) {
        setNotification({ message: "Cannot submit comment without user identification.", type: "error"});
        return;
    }
    console.log(`Comment on media ID: ${mediaId} by guest ID: ${currentGuestId}: "${commentText}"`);
    // API call to POST /api/media/[mediaId]/comment with { guestId: currentGuestId, text: commentText }
    // For now, just closes the modal and updates comment count optimistically
    try {
        const response = await fetch(`/api/media/${mediaId}/comment`, { // TODO: Create this API endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestId: currentGuestId, text: commentText }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to post comment.");
        }
        setMediaItems(prevItems =>
            prevItems.map(item =>
                item.id === mediaId ? { ...item, commentsCount: (item.commentsCount || 0) + 1 } : item
            )
        );
        setNotification({ message: "Comment posted!", type: "success"});
    } catch (error) {
        console.error("Error posting comment:", error);
        setNotification({ message: (error as Error).message || "Failed to post comment.", type: "error" });
    }
    setShowCommentModal(false);
  };


  return (
    <>
      <Header />
      {notification && (
        <NotificationBar
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
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
            {mediaItems.map((item) => (
              <div key={item.id || item.name} className={styles.feedItem}> {/* Use item.id if available */}
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
                      priority={mediaItems.indexOf(item) < 3}
                    />
                  ) : item.contentType?.startsWith("video/") ? (
                    <div className={styles.videoPlaceholder}>
                      <video
                        src={item.url + '#t=0.1'}
                        className={styles.mediaContent}
                        preload="metadata"
                        aria-label={`Shared by guest: ${item.name}`}
                        muted
                        playsInline
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
                  {/* Social Interaction Buttons */}
                  <div className={styles.socialActions}>
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`${styles.socialButton} ${item.currentUserHasLiked ? styles.liked : ''}`}
                      aria-pressed={item.currentUserHasLiked}
                      title={item.currentUserHasLiked ? "Unlike" : "Like"}
                    >
                      <FaHeart /> <span>{item.likesCount || 0}</span>
                    </button>
                    <button onClick={() => handleOpenCommentModal(item)} className={styles.socialButton} title="Comment">
                      <FaComment /> <span>{item.commentsCount || 0}</span>
                    </button>
                  </div>
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
      {showCommentModal && commentingOnItem && (
        <CommentModal
            isOpen={showCommentModal}
            mediaItem={commentingOnItem}
            onClose={() => setShowCommentModal(false)}
            onCommentSubmit={handleCommentSubmit}
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