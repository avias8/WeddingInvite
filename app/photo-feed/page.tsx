"use client";

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, useCallback, useMemo } from "react";
import Header from "../components/Header";
import styles from "./PhotoFeed.module.css";
import Image from "next/image";
import { FaTrash, FaLock, FaUnlock, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MediaDisplay from "../components/MediaDisplay";

// --- Interfaces ---
interface MediaItem {
  id: string; 
  name: string; 
  url: string; 
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated?: string | undefined;
  uploaderId?: number | null;
  uploaderName?: string | null;
  guestMediaDbId?: number; 
  caption?: string | null;
}

interface ApiResponse {
  success: boolean;
  media?: MediaItem[]; 
  message?: string;
  error?: string;
}

// --- Define Anonymous Guest ID ---
const ANONYMOUS_GUEST_ID = 251;


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
      <button onClick={onClose} className={styles.notificationClose}>×</button>
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
        <button className={styles.lightboxClose} onClick={onClose} aria-label="Close media view">×</button>
        {type?.startsWith("image/") ? (
          <Image
            src={src}
            alt={alt}
            className={styles.lightboxMedia}
            width={800}
            height={600}
            style={{ objectFit: "contain" }}
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
  isMobileLayout,
  loadingStrategy,
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
  isMobileLayout: boolean;
  loadingStrategy: "lazy" | "eager";
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

  const renderMediaItem = (item: MediaItem, currentLoadingStrategy: "lazy" | "eager") => {
    // Determine the display name for the uploader
    // If the uploaderId matches the anonymous ID, display "a guest"
    // Otherwise, use the uploaderName or "a guest" as a fallback
    const uploaderDisplayName = item.uploaderId === ANONYMOUS_GUEST_ID 
                               ? "a guest" 
                               : item.uploaderName || "a guest";
    return (
      <div key={item.id} className={styles.pageContentItem}>
        <div className={styles.pageMediaWrapper}>
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(item);
              }}
              className={styles.deleteButton}
              title="Delete this item"
              aria-label={`Delete media item ${item.name}`}
              style={{ zIndex: 1000 }} // Ensure button is above other elements
            >
              <FaTrash />
            </button>
          )}
          <MediaDisplay item={item} uploaderDisplayName={uploaderDisplayName} onMediaClick={onMediaClick} loadingStrategy={currentLoadingStrategy} />
        </div>
        <div className={styles.pageMediaInfo}>
          <span className={styles.uploadInfo}>
            Uploaded by {uploaderDisplayName} on {formatDate(item.timeCreated)}
          </span>
          {item.caption && (
            <div className={styles.captionFrame}>
              <p className={styles.captionText}>
                “{item.caption}” <br />
                <span className={styles.captionAttribution}>- {uploaderDisplayName}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          {!isMobileLayout && items[0] ? renderMediaItem(items[0], loadingStrategy) : (
            <div className={styles.pageContent}>
              <div className={styles.bookCoverBackContent}>
                <p className={styles.dedicationText}>Dedicated to our friends and family</p>
                <p className={styles.dedicationText}>who made this day special.</p>
                <div className={styles.decorativeDivider}>❦</div>
              </div>
            </div>
          )}
          {!isMobileLayout && items[0] && <div className={styles.pageNumber}>1</div>}
        </div>
      </div>
    );
  }
  if (isMobileLayout) {
    const userPageNum = pageNumber;
    return (
      <div
        className={`${styles.bookPage} ${isFlipped ? styles.flipped : ""} ${isTurning ? styles.turningPage : ''}`}
        onClick={onFlip}
        style={{ zIndex: zIndexValue }}
        role="region"
        aria-label={`Page ${userPageNum}`}
      >
        <div className={styles.pageFront}>
          {items[0] && renderMediaItem(items[0], loadingStrategy)}
          {items[0] && <div className={styles.pageNumber}>{userPageNum}</div>}
        </div>
        <div className={styles.pageBack}></div>
      </div>
    );
  } else {
    const userPageFront = (pageNumber - 1) * 2 + 2;
    const userPageBack = (pageNumber - 1) * 2 + 3;
    return (
      <div
        className={`${styles.bookPage} ${isFlipped ? styles.flipped : ""} ${isTurning ? styles.turningPage : ''}`}
        onClick={onFlip}
        style={{ zIndex: zIndexValue }}
        role="region"
        aria-label={`Page spread ${userPageFront}-${userPageBack}`}
      >
        <div className={styles.pageFront}>
          {items[0] && renderMediaItem(items[0], loadingStrategy)}
          {items[0] && <div className={styles.pageNumber}>{userPageFront}</div>}
        </div>
        <div className={styles.pageBack}>
          {items[1] && renderMediaItem(items[1], loadingStrategy)}
          {items[1] && <div className={styles.pageNumber}>{userPageBack}</div>}
        </div>
      </div>
    );
  }
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

  // currentPage is the 0-indexed index of the BookPage component that is currently "at the front" or being interacted with.
  // 0 is the cover page. 1 is the first content page component, etc.
  const [currentPage, setCurrentPage] = useState<number>(0); 
  const [flippedPages, setFlippedPages] = useState<Set<number>>(new Set());
  const [pageToAnimate, setPageToAnimate] = useState<number | null>(null);
  const [preloadedPages, setPreloadedPages] = useState<Set<number>>(new Set());

  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.matchMedia('(max-width: 1023px) and (orientation: portrait), (max-width: 767px)').matches;
      setIsMobileLayout(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  const itemsPerSpread = isMobileLayout ? 1 : 2;

  const totalBookPages = useMemo(() => {
    if (mediaItems.length === 0) return 1;
    return isMobileLayout ? mediaItems.length + 1 : Math.ceil(Math.max(0, mediaItems.length) / itemsPerSpread) + 1;
  }, [mediaItems.length, isMobileLayout, itemsPerSpread]);

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
    setIsLoading(true); // Consider a more specific loading state for delete
    try {
      const adminPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "defaultFallbackPassword";
      const response = await fetch("/api/delete-guest-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gcsObjectName: itemToDelete.name, password: adminPassword }),
      });
      const result: ApiResponse = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to delete media item.");
      }

      const updatedMediaItems = mediaItems.filter(item => item.id !== itemToDelete.id);
      setMediaItems(updatedMediaItems);
      setNotification({ message: result.message || "Media item deleted successfully.", type: "success" });
      
      // Recalculate totalBookPages based on new items length
      const newTotalBookPages = isMobileLayout 
        ? updatedMediaItems.length + 1 
        : Math.ceil(Math.max(0, updatedMediaItems.length) / itemsPerSpread) + 1;
      
      if (currentPage >= newTotalBookPages) {
        // If current page is now out of bounds, move to the new last page
        const newCurrentPage = Math.max(0, newTotalBookPages - 1);
        setCurrentPage(newCurrentPage);
        // Adjust flippedPages: remove pages that no longer exist
        const newFlippedPages = new Set<number>();
        flippedPages.forEach(p => {
          if (p < newCurrentPage) newFlippedPages.add(p); // Only keep flipped pages before the new current page
        });
        
        setFlippedPages(newFlippedPages);

      } else if (updatedMediaItems.length === 0) {
        setCurrentPage(0);
        setFlippedPages(new Set());
        setPageError("No photos or videos have been shared yet. Check back soon!");
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
        newSet.delete(pageIndexToFlip); // Unflip the page
      } else {
        newSet.add(pageIndexToFlip); // Flip the page
      }
      return newSet;
    });
    // Adjust animation duration for mobile layout
    const animationDuration = isMobileLayout ? 500 : 800; // Shorter duration for single-page flip
    setTimeout(() => setPageToAnimate(null), animationDuration);
  };

  const handleNextPage = () => {
    if (isLoading || pageToAnimate !== null) return;
  
    if (currentPage < totalBookPages - 1) {
      handlePageFlip(currentPage);
      setCurrentPage(currentPage + 1);
    } else if (currentPage === 0 && !flippedPages.has(0) && totalBookPages > 1) { 
      // Special case for opening the cover when it's the only page but there's content
      handlePageFlip(0);
      setCurrentPage(1); // Move to show the "first page" view
    }
  };

  const handlePrevPage = () => {
    if (isLoading || pageToAnimate !== null) return;
  
    if (currentPage > 0) {
      const pageToUnflipAndShow = currentPage - 1;
      handlePageFlip(pageToUnflipAndShow);
      setCurrentPage(pageToUnflipAndShow);
    }
  };
  
  const getPageItemsForBookPage = useCallback((pageIdx: number): MediaItem[] => {
    if (pageIdx === 0) { // Cover Page
      // On desktop, the back of the cover shows the first item. On mobile, it's blank.
      return isMobileLayout ? [] : mediaItems.length > 0 ? [mediaItems[0]] : [];
    }
    if (isMobileLayout) {
      const itemIndex = pageIdx - 1;
      return itemIndex < mediaItems.length ? [mediaItems[itemIndex]] : [];
    } else {
      // Desktop: page 0 is cover, its back has item 0. Page 1 component starts with item 1.
      const startIndex = (pageIdx - 1) * itemsPerSpread + 1;
      return mediaItems.slice(startIndex, startIndex + itemsPerSpread);
    }
  }, [mediaItems, isMobileLayout, itemsPerSpread]);

  const getCurrentViewingPageLabel = () => {
    if (mediaItems.length === 0) return "Cover";
  
    if (isMobileLayout) {
      if (currentPage === 0) return "Cover";
      return `Page ${currentPage}`;
    } else {
      if (currentPage === 0) {
        return flippedPages.has(0) ? "Page 1" : "Cover";
      }
      const firstUserPageNum = (currentPage - 1) * 2 + 2;
      const itemsOnSpread = getPageItemsForBookPage(currentPage).length;
  
      if (itemsOnSpread === 2) {
        return `Pages ${firstUserPageNum}-${firstUserPageNum + 1}`;
      } else if (itemsOnSpread === 1) {
        return `Page ${firstUserPageNum}`;
      }
      return "End";
    }
  };

  const getTotalPagesDisplayed = () => {
    if (mediaItems.length === 0) return "1";
    return isMobileLayout ? `${mediaItems.length}` : `${mediaItems.length + 1}`;
  };

  const isNextDisabled = () => {
    return isLoading || pageToAnimate !== null || currentPage >= totalBookPages - 1;
  };
  
  const isPrevDisabled = () => {
    if (isLoading || pageToAnimate !== null) return true;
    if (isMobileLayout) {
      return currentPage === 0;
    } else {
      // Can't go back if on the cover and it's not flipped
      return currentPage === 0 && !flippedPages.has(0);
    }
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
              <button className={styles.modalCloseButton} onClick={() => { setShowAuthModal(false); setAuthError(null); setPassword("");}} aria-label="Close admin login">×</button>
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

        {!isLoading && (mediaItems.length > 0 || (pageError && mediaItems.length === 0)) && ( // Show book structure if items or initial empty error
          <>
            <div className={styles.flipBookContainer} aria-label="Photo Album">
              <div className={styles.book}>
                {!isMobileLayout && <div className={styles.bookSpine} />}
                <div className={styles.bookPages}>
                  {Array.from({ length: totalBookPages }, (_, i) => {
                    const pageComponentIndex = i;
                    const isFlipped = flippedPages.has(pageComponentIndex);
                    
                    let zIndexValue;
                    if (pageToAnimate === pageComponentIndex) {
                        zIndexValue = MAX_Z_INDEX_BASE + 1;
                    } else if (pageComponentIndex === currentPage) {
                        zIndexValue = MAX_Z_INDEX_BASE;
                    } else if (isFlipped) {
                        zIndexValue = pageComponentIndex + 1;
                    } else {
                        zIndexValue = MAX_Z_INDEX_BASE - pageComponentIndex;
                    }

                    const pageLoadingStrategy = (pageComponentIndex === currentPage || preloadedPages.has(pageComponentIndex)) ? "eager" : "lazy";

                    return (
                      <BookPage
                        key={`bookpage-${pageComponentIndex}`} 
                        items={getPageItemsForBookPage(pageComponentIndex)}
                        pageNumber={pageComponentIndex}
                        isFlipped={isFlipped}
                        onFlip={() => {
                            if (pageComponentIndex === currentPage && !isFlipped) {
                                handleNextPage();
                            } else if (pageComponentIndex < currentPage) {
                                // Clicking a page to the "left" of the stack should turn back to it
                                setCurrentPage(pageComponentIndex);
                                setFlippedPages(prev => {
                                    const newSet = new Set<number>();
                                    prev.forEach(p => {
                                        if (p < pageComponentIndex) newSet.add(p);
                                    });
                                    return newSet;
                                });
                            }
                        }}
                        isAuthenticated={isAuthenticated}
                        onDeleteRequest={requestDeleteMedia}
                        onMediaClick={openLightbox}
                        zIndexValue={zIndexValue}
                        isTurning={pageToAnimate === pageComponentIndex}
                        isMobileLayout={isMobileLayout}
                        loadingStrategy={pageLoadingStrategy}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            
            {mediaItems.length > 0 && (
                 <div className={styles.bookControls}>
                 <button 
                   onClick={handlePrevPage} 
                   disabled={isPrevDisabled()}
                   className={styles.pageButton}
                   aria-label="Previous page"
                 >
                   <FaChevronLeft /> Previous
                 </button>
                 <span className={styles.pageIndicator} aria-live="polite">
                    {getCurrentViewingPageLabel()} / {getTotalPagesDisplayed()}
                 </span>
                 <button 
                   onClick={handleNextPage}
                   disabled={isNextDisabled()}
                   className={styles.pageButton}
                   aria-label="Next page"
                   onMouseEnter={() => {
                     if (!isNextDisabled()) {
                       const nextPageToPreload = currentPage + 1;
                       if (nextPageToPreload < totalBookPages) {
                         setPreloadedPages(prev => new Set(prev).add(nextPageToPreload));
                       }
                     }
                   }}
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