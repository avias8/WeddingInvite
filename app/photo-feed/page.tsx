// app/photo-feed/page.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, useCallback } from "react";
import Header from "../components/Header"; // Assuming Header component exists
import styles from "./PhotoFeed.module.css";
import Image from "next/image";
import { FaTrash, FaLock, FaUnlock, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// --- Interfaces ---
interface MediaItem {
  id: number; // Or string, depending on your backend
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

// --- Notification Bar Component ---
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

// --- Confirmation Modal Component ---
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

// --- LightboxModal Component ---
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

// --- Book Page Component ---
const BookPage = ({
  items,
  pageNumber, // This is the unique ID/index of this BookPage instance (0 for cover, 1 for first content page, etc.)
  isFlipped,
  onFlip,
  isAuthenticated,
  onDeleteRequest,
  onMediaClick,
  zIndexValue,
  isTurning,
}: {
  items: MediaItem[];
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
    <div key={item.id} className={styles.pageContentItem}> {/* Changed class for clarity */}
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
            alt={`Shared by ${item.uploaderName || 'guest'}: ${item.name}`}
            width={350}
            height={262}
            className={styles.mediaContent}
            style={{ objectFit: "cover" }}
            unoptimized={true}
          />
        ) : item.contentType?.startsWith("video/") ? (
          <div className={styles.videoPlaceholder}>
            <video
              src={item.url + '#t=0.1'} // For thumbnail
              className={styles.mediaContent}
              preload="metadata"
              aria-label={`Shared by ${item.uploaderName || 'guest'}: ${item.name}`}
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
        {formatDate(item.timeCreated)}
      </div>
    </div>
  );

  // Cover page
  if (pageNumber === 0) {
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
          {/* Content for the back of the cover (which is effectively the first page if items exist) */}
          {items[0] ? renderMediaItem(items[0]) : (
            <div className={styles.pageContent}>
                 <div className={styles.bookCoverBackContent}>
                    <p className={styles.dedicationText}>Dedicated to our friends and family</p>
                    <p className={styles.dedicationText}>who made this day special.</p>
                    <div className={styles.decorativeDivider}>❦</div>
                 </div>
            </div>
          )}
          {/* Page number for the back of the cover */}
          {items[0] && <div className={styles.pageNumber}>1</div>}
        </div>
      </div>
    );
  }

  // Regular content pages
  // pageNumber 1 means items[0] on front, items[1] on back
  // User-facing page numbers are (pageNumber * 2) for front, (pageNumber * 2 + 1) for back (if cover is page 0)
  // OR, if cover's back is page 1: Front of pageNumber 1 is page 2, back of pageNumber 1 is page 3.
  // Let's use: Cover is pageNumber 0. Its back is user page 1.
  // PageNumber 1 (a BookPage component) has user page 2 (front) and user page 3 (back).
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

  // --- Flip book state ---
  // `currentPage` refers to the index of the BookPage component that is currently
  // the "right-hand page" of the open book, or 0 if the cover is closed.
  // Example: Cover closed: currentPage = 0.
  // Cover open (flipped): currentPage = 1 (BookPage index 1 is on the right).
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [flippedPages, setFlippedPages] = useState<Set<number>>(new Set()); // Set of pageNumbers (BookPage indices) that are flipped
  const [pageToAnimate, setPageToAnimate] = useState<number | null>(null); // pageNumber of the page currently animating

  const itemsPerSpread = 2; // For content pages. Cover's back can show 1.

  // Calculate total BookPage components needed.
  // Cover (pageNumber 0) + content pages.
  // If mediaItems = 0, cover's back is empty. totalBookPages = 1 (just the cover component).
  // If mediaItems = 1, item goes on cover's back. totalBookPages = 1.
  // If mediaItems = 2, item 1 on cover's back, item 2 on front of pageNumber 1. totalBookPages = 2.
  // If mediaItems = 3, item 1 on cover's back, item 2 on front of pageNumber 1, item 3 on back of pageNumber 1. totalBookPages = 2.
  const totalBookPages = mediaItems.length > 0 ? (Math.ceil((mediaItems.length -1) / itemsPerSpread) + 1) : 1;


  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const response = await fetch("/api/get-guest-media"); // Replace with your actual API endpoint
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
          throw new Error(errorData.message || errorData.error || `Failed to load media. Status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to load media (API error).");
      }
      // Sort by timeCreated in ascending order (oldest first)
      const sortedMedia = (data.media || []).sort((a, b) => {
        const dateA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
        const dateB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
        return dateA - dateB;
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
  }, []); // No dependencies that would cause re-fetch loops

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
    // IMPORTANT: Password should ideally be checked server-side or via a more secure method.
    // Using environment variables for client-side passwords is not truly secure.
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
    setIsLoading(true); // Or a specific deleting loading state
    try {
      const adminPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "defaultFallbackPassword"; // Same as auth
      const response = await fetch("/api/delete-guest-media", { // Replace with your actual API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gcsObjectName: itemToDelete.name, password: adminPassword }), // Adjust payload as needed
      });
       const result: ApiResponse = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to delete media item.");
      }

      const updatedMediaItems = mediaItems.filter(item => item.id !== itemToDelete.id); // Assuming item.id is unique
      setMediaItems(updatedMediaItems);
      setNotification({ message: result.message || "Media item deleted successfully.", type: "success" });

      const newTotalBookPages = updatedMediaItems.length > 0 ? (Math.ceil((updatedMediaItems.length -1) / itemsPerSpread) + 1) : 1;
      if (currentPage >= newTotalBookPages && newTotalBookPages > 0) {
          setCurrentPage(newTotalBookPages - 1);
          // If the page that was deleted made the current page invalid, adjust flippedPages
          // This is complex as it depends on which items were on the flipped pages.
          // A simpler approach might be to reset flippedPages or adjust based on the new total pages.
          // For now, just adjusting currentPage.
          if (newTotalBookPages === 1 && currentPage > 0) { // only cover left
            setFlippedPages(new Set()); // close the book
            setCurrentPage(0);
          }
      } else if (newTotalBookPages === 0 || (newTotalBookPages === 1 && updatedMediaItems.length === 0) ){ // No items left, or just an empty cover
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


  // --- Flip book logic ---
  const handlePageFlip = (pageIndexToFlip: number) => {
    setPageToAnimate(pageIndexToFlip);
    setFlippedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndexToFlip)) {
        newSet.delete(pageIndexToFlip); // Unflipping
      } else {
        newSet.add(pageIndexToFlip);   // Flipping
      }
      return newSet;
    });
    setTimeout(() => setPageToAnimate(null), 800); // Corresponds to CSS transition duration
  };

  const handleNextPage = () => {
    // Can we turn the current right-hand page?
    // currentPage is the index of the BookPage component forming the right side of the spread
    // or 0 if cover is closed.
    if (currentPage < totalBookPages -1) { // Ensure there's a page to the right to become the new currentPage
      handlePageFlip(currentPage); // Flip the current right-hand page (BookPage index `currentPage`)
      setCurrentPage(currentPage + 1);
    } else if (currentPage === 0 && totalBookPages === 1 && mediaItems.length > 0) { // Only cover exists but has content on back
      handlePageFlip(0); // Flip the cover
      setCurrentPage(1); // Conceptually viewing "after cover", though no new BookPage component
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const pageToUnflip = currentPage - 1;
      setCurrentPage(pageToUnflip); // The page we are un-flipping becomes the new right-hand page
      handlePageFlip(pageToUnflip); // Unflip it
    }
  };

  // Get items for a given BookPage component index (pageNumber)
  const getPageItemsForBookPage = (pageIdx: number): MediaItem[] => {
    if (pageIdx === 0) { // Cover page component
      return mediaItems.length > 0 ? [mediaItems[0]] : []; // Back of cover gets the first media item
    }
    // For content BookPage components (pageIdx = 1, 2, ...)
    // Item for cover's back: mediaItems[0]
    // Items for BookPage 1: mediaItems[1] (front), mediaItems[2] (back)
    // Items for BookPage 2: mediaItems[3] (front), mediaItems[4] (back)
    const startIndex = (pageIdx - 1) * itemsPerSpread + 1; // +1 because mediaItems[0] is on cover back
    if (startIndex < 0 || startIndex >= mediaItems.length) return [];
    return mediaItems.slice(startIndex, startIndex + itemsPerSpread);
  };

  const MAX_Z_INDEX_BASE = totalBookPages + 10; // Base for z-index calculations

  // --- Render ---
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

        {!isLoading && (mediaItems.length > 0 || pageError) && ( // Show book container even if empty to show cover if error is just "no items"
          <>
            <div className={styles.flipBookContainer} aria-label="Photo Album">
              <div className={styles.book}>
                <div className={styles.bookSpine} />
                <div className={styles.bookPages}>
                  {Array.from({ length: totalBookPages }, (_, i) => {
                    const pageComponentIndex = i; // This is the index for the BookPage component (0 is cover)
                    const isFlipped = flippedPages.has(pageComponentIndex);
                    
                    let zIndexValue;
                    if (pageToAnimate === pageComponentIndex) {
                        zIndexValue = MAX_Z_INDEX_BASE + 1; // Page being turned is highest
                    } else if (pageComponentIndex === 0 && currentPage === 0 && !isFlipped) {
                        zIndexValue = MAX_Z_INDEX_BASE; // Closed cover is high
                    } else if (pageComponentIndex === currentPage && !isFlipped) {
                        zIndexValue = MAX_Z_INDEX_BASE -1; // Current right-hand page (not cover)
                    } else if (isFlipped) {
                        // Flipped pages: higher z-index for those "closer" to the current view (larger pageComponentIndex)
                        zIndexValue = MAX_Z_INDEX_BASE - totalBookPages + pageComponentIndex;
                    } else {
                        // Unflipped pages to the right: lower z-index for those further away
                        zIndexValue = MAX_Z_INDEX_BASE - pageComponentIndex -5; // -5 to ensure they are below current spread
                    }

                    // Ensure cover is above all other non-turning pages if it's the current view
                    if (pageComponentIndex === 0 && currentPage === 0 && !isFlipped && pageToAnimate !== 0) {
                        zIndexValue = MAX_Z_INDEX_BASE;
                    }
                    // Ensure the currently visible right-hand page (not cover) is high
                    if (pageComponentIndex === currentPage && pageComponentIndex !== 0 && !isFlipped && pageToAnimate !== pageComponentIndex) {
                        zIndexValue = MAX_Z_INDEX_BASE -1;
                    }


                    return (
                      <BookPage
                        key={pageComponentIndex}
                        items={getPageItemsForBookPage(pageComponentIndex)}
                        pageNumber={pageComponentIndex}
                        isFlipped={isFlipped}
                        onFlip={() => {
                           // Clicking a page.
                           // If it's the current right-hand page (or cover), flip it forward.
                           // If it's a flipped page on the left, it implies going back.
                           if (pageComponentIndex === currentPage) {
                               handleNextPage();
                           } else if (isFlipped && pageComponentIndex < currentPage) {
                               // This logic might need refinement: clicking a page on the left.
                               // Simplest is to go to the state where this page is the right-hand one.
                               handlePrevPage(); // This will unflip pageComponentIndex if logic is correct
                           }
                           // Potentially add logic for clicking unflipped pages far to the right (fast forward)
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
            
            {totalBookPages > 0 && ( // Only show controls if there's at least a cover
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
                   {/* User-facing page numbering. totalBookPages includes cover.
                       If mediaItems = 0, totalBookPages = 1. currentPage = 0. "Cover"
                       If mediaItems = 1, totalBookPages = 1. After flip, currentPage = 1. "Page 1 of 1" (content)
                       If mediaItems = 3, totalBookPages = 2.
                         currentPage = 0 -> Cover
                         currentPage = 1 -> Page 1 (cover back) & 2 (page 1 front)
                         currentPage = 2 -> Page 3 (page 1 back) & 4 (page 2 front, if exists)
                    */}
                   {`Viewing ${currentPage === 0 && !flippedPages.has(0) ? "Cover" : 
                       `Page ${Math.max(1, currentPage * 2 - (flippedPages.has(0) ? 0:1) )}` 
                     } / ${Math.max(1, mediaItems.length > 0 ? (totalBookPages-1)*2 : 1)}`}
                 </span>
                 <button 
                   onClick={handleNextPage}
                   // Disable if on the last conceptual page/spread
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
          alt={`Media: ${lightboxItem.name}`} // Consider adding uploader name if available
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
