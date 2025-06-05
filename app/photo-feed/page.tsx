// app/photo-feed/page.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, useCallback } from "react";
import Header from "../components/Header";
import styles from "./PhotoFeed.module.css";
import Image from "next/image";
import { FaTrash, FaLock, FaUnlock, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// --- Interfaces ---
// Updated to match the API response from get_guest_media_route_updated
interface MediaItem {
  id: string; // GCS object name, used as the primary unique key for frontend items
  name: string; // GCS object name (can be same as id for clarity)
  url: string; // Signed URL for viewing
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
  uploaderId?: number | null;
  uploaderName?: string | null;
  guestMediaDbId?: number; // The actual ID from the GuestMedia table in your database
}

interface ApiResponse {
  success: boolean;
  media?: MediaItem[]; // Expecting the updated MediaItem structure
  message?: string;
  error?: string;
}

// --- Notification Bar Component (remains the same) ---
const NotificationBar = ({ message, type, onClose }: { message: string | null; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (message) {
      timer = setTimeout(() => {
        onClose();
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.notificationBar} ${type === "success" ? styles.success : styles.error}`}>
      {type === "success" ? <FaCheckCircle className={styles.notificationIcon} /> : <FaExclamationTriangle className={styles.notificationIcon} />}
      <span>{message}</span>
      <button onClick={onClose} className={styles.notificationClose}>&times;</button>
    </div>
  );
};

// --- Confirmation Modal Component (remains the same) ---
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

// --- LightboxModal Component (remains the same) ---
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
            style={{ objectFit: "contain" }}
            unoptimized={true} // Good for GCS signed URLs which might not be optimizable by Next/Image
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

// --- Book Page Component ---
const BookPage = ({
  items,
  pageNumber,
  isFlipped,
  onFlip,
  isAuthenticated,
  onDeleteRequest,
  onMediaClick,
  zIndexValue,
  isTurning,
}: {
  items: MediaItem[]; // Expecting updated MediaItem with uploaderName
  pageNumber: number;
  isFlipped: boolean;
  onFlip: () => void;
  isAuthenticated: boolean;
  onDeleteRequest: (item: MediaItem) => void;
  onMediaClick: (item: MediaItem) => void;
  zIndexValue: number;
  isTurning: boolean;
}) => {
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

  const renderMediaItem = (item: MediaItem) => (
    <div key={item.id} className={styles.pageContentItem}>
      <div className={styles.pageMediaWrapper} onClick={() => onMediaClick(item)}>
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(item);
            }}
            className={styles.deleteButton}
            title="Delete this item"
            aria-label={`Delete media item ${item.name}`}
          >
            <FaTrash />
          </button>
        )}
        {item.contentType?.startsWith("image/") ? (
          <Image
            src={item.url}
            alt={`Shared by ${item.uploaderName || 'a guest'}: ${item.name}`}
            width={350}
            height={262}
            className={styles.mediaContent}
            style={{ objectFit: "cover" }}
            unoptimized={true}
          />
        ) : item.contentType?.startsWith("video/") ? (
          <div className={styles.videoPlaceholder}>
            <video
              src={item.url + '#t=0.1'}
              className={styles.mediaContent}
              preload="metadata"
              aria-label={`Shared by ${item.uploaderName || 'a guest'}: ${item.name}`}
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
          </div>
        )}
      </div>
      <div className={styles.pageMediaInfo}>
        {/* MODIFICATION: Display uploader name */}
        Uploaded by {item.uploaderName || "a Guest"} on {formatDate(item.timeCreated)}
      </div>
    </div>
  );

  if (pageNumber === 0) { // Cover page
    return (
      <div
        className={`${styles.bookPage} ${isFlipped ? styles.flipped : ''} ${isTurning ? styles.turningPage : ''} ${styles.coverPage}`}
        onClick={onFlip}
        style={{ zIndex: zIndexValue }}
        role="region"
        aria-label="Book Cover"
      >
        <div className={`${styles.pageFront} ${styles.bookCover}`}>
          <h2 className={styles.bookCoverTitle}>Our Wedding Memories</h2>
          <p className={styles.bookCoverSubtitle}>A collection of moments from our special day</p>
          <div className={styles.bookCoverDate}>Click to open</div>
        </div>
        <div className={`${styles.pageBack} ${styles.bookCoverBack}`}>
          {items[0] ? renderMediaItem(items[0]) : (
            <div className={styles.pageContent}>
                 <div className={styles.bookCoverBackContent}>
                    <p className={styles.dedicationText}>Dedicated to our friends and family</p>
                    <p className={styles.dedicationText}>who made this day special.</p>
                    <div className={styles.decorativeDivider}>❦</div>
                 </div>
            </div>
          )}
          {items[0] && <div className={styles.pageNumber}>1</div>}
        </div>
      </div>
    );
  }

  // Regular content pages
  const userPageFront = (pageNumber * 2);
  const userPageBack = (pageNumber * 2) + 1;

  return (
    <div
      className={`${styles.bookPage} ${isFlipped ? styles.flipped : ""} ${isTurning ? styles.turningPage : ''}`}
      onClick={onFlip}
      style={{ zIndex: zIndexValue }}
      role="region"
      aria-label={`Page spread ${userPageFront}-${userPageBack}`}
    >
      <div className={styles.pageFront}>
        {items[0] && renderMediaItem(items[0])}
        {items[0] && <div className={styles.pageNumber}>{userPageFront}</div>}
      </div>
      <div className={styles.pageBack}>
        {items[1] && renderMediaItem(items[1])}
        {items[1] && <div className={styles.pageNumber}>{userPageBack}</div>}
      </div>
    </div>
  );
};


// --- Main PhotoFeedPage Component ---
export default function PhotoFeedPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]); // Expecting updated MediaItem
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

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [flippedPages, setFlippedPages] = useState<Set<number>>(new Set());
  const [pageToAnimate, setPageToAnimate] = useState<number | null>(null);

  const itemsPerSpread = 2;
  const totalBookPages = mediaItems.length > 0 ? (Math.ceil((mediaItems.length -1) / itemsPerSpread) + 1) : 1;


  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const response = await fetch("/api/get-guest-media");
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `Failed to load media. Status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to load media (API error).");
      }
      // API now sorts, but ensuring client-side sort if needed or for robustness
      const sortedMedia = (data.media || []).sort((a, b) => {
        const dateA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
        const dateB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
        return dateA - dateB; // Oldest first for book layout
      });
      setMediaItems(sortedMedia);

      if (sortedMedia.length === 0) {
        setPageError("No photos or videos have been shared yet. Check back soon!");
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching media.";
      setPageError(errorMessage);
      setNotification({ message: `Error: ${errorMessage}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    const authStatus = sessionStorage.getItem("photoFeedAdminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, [fetchMedia]);

  const openLightbox = (item: MediaItem) => setLightboxItem(item);
  const closeLightbox = () => setLightboxItem(null);

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "defaultFallbackPassword";
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
      const adminPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "defaultFallbackPassword";
      const response = await fetch("/api/delete-guest-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The delete API expects gcsObjectName, which is itemToDelete.name (or itemToDelete.id as they are the same)
        body: JSON.stringify({ gcsObjectName: itemToDelete.name, password: adminPassword }),
      });
       const result: ApiResponse = await response.json(); // Use ApiResponse for consistency
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to delete media item.");
      }

      // itemToDelete.id is the GCS object name
      const updatedMediaItems = mediaItems.filter(item => item.id !== itemToDelete.id);
      setMediaItems(updatedMediaItems);
      setNotification({ message: result.message || "Media item deleted successfully.", type: "success" });

      const newTotalBookPages = updatedMediaItems.length > 0 ? (Math.ceil((updatedMediaItems.length -1) / itemsPerSpread) + 1) : 1;
      if (currentPage >= newTotalBookPages && newTotalBookPages > 0) {
          setCurrentPage(newTotalBookPages - 1);
          if (newTotalBookPages === 1 && currentPage > 0) {
            setFlippedPages(new Set());
            setCurrentPage(0);
          }
      } else if (newTotalBookPages === 0 || (newTotalBookPages === 1 && updatedMediaItems.length === 0) ){
         setCurrentPage(0);
         setFlippedPages(new Set());
         if (updatedMediaItems.length === 0) {
            setPageError("No photos or videos have been shared yet. Check back soon!");
         }
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during deletion.";
      setNotification({ message: `Error: ${errorMessage}`, type: "error" });
    } finally {
      setItemToDelete(null);
      setIsLoading(false);
    }
  };

  const handlePageFlip = (pageIndexToFlip: number) => {
    setPageToAnimate(pageIndexToFlip);
    setFlippedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndexToFlip)) {
        newSet.delete(pageIndexToFlip);
      } else {
        newSet.add(pageIndexToFlip);
      }
      return newSet;
    });
    setTimeout(() => setPageToAnimate(null), 800);
  };

  const handleNextPage = () => {
    if (currentPage < totalBookPages -1) {
      handlePageFlip(currentPage);
      setCurrentPage(currentPage + 1);
    } else if (currentPage === 0 && totalBookPages === 1 && mediaItems.length > 0) {
      handlePageFlip(0);
      setCurrentPage(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const pageToUnflip = currentPage - 1;
      setCurrentPage(pageToUnflip);
      handlePageFlip(pageToUnflip);
    }
  };

  const getPageItemsForBookPage = (pageIdx: number): MediaItem[] => {
    if (pageIdx === 0) {
      return mediaItems.length > 0 ? [mediaItems[0]] : [];
    }
    const startIndex = (pageIdx - 1) * itemsPerSpread + 1;
    if (startIndex < 0 || startIndex >= mediaItems.length) return [];
    return mediaItems.slice(startIndex, startIndex + itemsPerSpread);
  };

  const MAX_Z_INDEX_BASE = totalBookPages + 10;

  return (
    <>
      <Header />
      <NotificationBar
        message={notification ? notification.message : null}
        type={notification ? notification.type : "success"}
        onClose={() => setNotification(null)}
      />
      <div className={styles.pageContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Moments From The Wedding</h1>
          <p className={styles.pageSubtitle}>
            See the moments captured by you, our wonderful guests!
          </p>
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

        {!isLoading && (mediaItems.length > 0 || pageError) && (
          <>
            <div className={styles.flipBookContainer} aria-label="Photo Album">
              <div className={styles.book}>
                <div className={styles.bookSpine} />
                <div className={styles.bookPages}>
                  {Array.from({ length: totalBookPages }, (_, i) => {
                    const pageComponentIndex = i;
                    const isFlipped = flippedPages.has(pageComponentIndex);
                    
                    let zIndexValue;
                    if (pageToAnimate === pageComponentIndex) {
                        zIndexValue = MAX_Z_INDEX_BASE + 1; 
                    } else if (pageComponentIndex === 0 && currentPage === 0 && !isFlipped) {
                        zIndexValue = MAX_Z_INDEX_BASE; 
                    } else if (pageComponentIndex === currentPage && !isFlipped) {
                        zIndexValue = MAX_Z_INDEX_BASE -1; 
                    } else if (isFlipped) {
                        zIndexValue = MAX_Z_INDEX_BASE - totalBookPages + pageComponentIndex;
                    } else {
                        zIndexValue = MAX_Z_INDEX_BASE - pageComponentIndex -5; 
                    }
                    if (pageComponentIndex === 0 && currentPage === 0 && !isFlipped && pageToAnimate !== 0) {
                        zIndexValue = MAX_Z_INDEX_BASE;
                    }
                    if (pageComponentIndex === currentPage && pageComponentIndex !== 0 && !isFlipped && pageToAnimate !== pageComponentIndex) {
                        zIndexValue = MAX_Z_INDEX_BASE -1;
                    }

                    return (
                      <BookPage
                        key={pageComponentIndex} // Using index for key here is acceptable as page order won't change
                        items={getPageItemsForBookPage(pageComponentIndex)}
                        pageNumber={pageComponentIndex}
                        isFlipped={isFlipped}
                        onFlip={() => {
                           if (pageComponentIndex === currentPage) {
                               handleNextPage();
                           } else if (isFlipped && pageComponentIndex < currentPage) {
                               handlePrevPage(); 
                           }
                        }}
                        isAuthenticated={isAuthenticated}
                        onDeleteRequest={requestDeleteMedia}
                        onMediaClick={openLightbox}
                        zIndexValue={zIndexValue}
                        isTurning={pageToAnimate === pageComponentIndex}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            
            {totalBookPages > 0 && (
                 <div className={styles.bookControls}>
                 <button 
                   onClick={handlePrevPage} 
                   disabled={currentPage === 0}
                   className={styles.pageButton}
                   aria-label="Previous page"
                 >
                   <FaChevronLeft /> Previous
                 </button>
                 <span className={styles.pageIndicator} aria-live="polite">
                   {`Viewing ${currentPage === 0 && !flippedPages.has(0) ? "Cover" : 
                       `Page ${Math.max(1, currentPage * 2 - (flippedPages.has(0) ? 0:1) )}` 
                     } / ${Math.max(1, mediaItems.length > 0 ? (totalBookPages-1)*2 : 1)}`}
                 </span>
                 <button 
                   onClick={handleNextPage}
                   disabled={currentPage >= totalBookPages - (mediaItems.length === 0 ? 1 : (mediaItems.length === 1 && currentPage === 0 ? 0 : 1))}
                   className={styles.pageButton}
                   aria-label="Next page"
                 >
                   Next <FaChevronRight />
                 </button>
               </div>
            )}
          </>
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
