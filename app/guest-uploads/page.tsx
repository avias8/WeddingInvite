// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import Header from "../components/Header";
import styles from "./GuestUploads.module.css";
import GuestSelector from "../components/GuestSelector"; // Assuming this is the updated GuestSelector
import { FaUserCircle, FaCamera, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"; // Removed FaSpinner
import Image from "next/image";

interface UploadResponse {
  success: boolean;
  message?: string;
  signedUrl?: string;
  gcsObjectName?: string;
  error?: string;
  details?: string;
  guestMediaId?: number;
}

interface IndividualFileStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  previewUrl?: string;
  fileType: 'image' | 'video' | 'other';
  errorMessage?: string;
  gcsObjectName?: string;
  caption?: string; 
}

// NotificationBar Component (as previously defined, or your implementation)
const NotificationBar = ({ message, type, onClose }: { message: string | null; type: "success" | "error" | "info"; onClose: () => void }) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (message) {
      timer = setTimeout(() => {
        onClose();
      }, 5000); // Notification stays for 5 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, onClose]);

  if (!message) return null;

  let icon = null;
  let baseClasses = styles.notificationBar;
  if (type === "success") {
    icon = <FaCheckCircle className={styles.notificationIcon} />;
    baseClasses += ` ${styles.successMessage}`;
  } else if (type === "error") {
    icon = <FaExclamationTriangle className={styles.notificationIcon} />;
    baseClasses += ` ${styles.errorMessage}`;
  } else if (type === "info") {
    // Assuming you might add an info icon, or just rely on color
    baseClasses += ` ${styles.infoMessage}`; // Add an .infoMessage style in your CSS
  }


  return (
    <div className={baseClasses}>
      {icon}
      <span>{message}</span>
      <button onClick={onClose} className={styles.notificationCloseButton}>&times;</button>
    </div>
  );
};


// VideoIcon Component (as previously defined)
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px" className={styles.videoIcon}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function GuestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filesStatus, setFilesStatus] = useState<IndividualFileStatus[]>([]);
  const [overallMessage, setOverallMessage] = useState<string | null>(null);
  const [overallMessageType, setOverallMessageType] = useState<"success" | "error" | "info" | null>(null); // Added "info"
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentGuestId, setCurrentGuestId] = useState<number | null>(null);
  const [currentGuestName, setCurrentGuestName] = useState<string | null>(null);
  // We don't necessarily need to store currentInviteeId in GuestUploadPage's state 
  // unless other parts of GuestUploadPage need it directly. 
  // The important part is that GuestMedia.uploaderId gets the correct Guest.id.
  const [showGuestIdentifyModal, setShowGuestIdentifyModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null); // Added "info"


  // --- Define Anonymous Guest Details ---
  const ANONYMOUS_GUEST_DETAILS = {
    id: 251,
    name: "Anonymous",
    inviteeId: 140, // This is the invitee_id for the "Anonymous" guest row
  };

  useEffect(() => {
    const storedGuestId = sessionStorage.getItem("uploadGuestId");
    const storedGuestName = sessionStorage.getItem("uploadGuestName");
    if (storedGuestId && storedGuestName) {
      setCurrentGuestId(parseInt(storedGuestId, 10));
      setCurrentGuestName(storedGuestName);
    } else {
      // Initially, always show the modal if no guest is identified in session
      setShowGuestIdentifyModal(true);
    }
  }, []);

  useEffect(() => {
    // Cleanup Object URLs when component unmounts or filesStatus changes
    return () => {
      filesStatus.forEach(fs => {
        if (fs.previewUrl) {
          URL.revokeObjectURL(fs.previewUrl);
        }
      });
    };
  }, [filesStatus]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Revoke old URLs before setting new files
    filesStatus.forEach(fs => { if (fs.previewUrl) URL.revokeObjectURL(fs.previewUrl); });
    
    setSelectedFiles(event.target.files);
    setOverallMessage(null);
    setOverallMessageType(null);

    if (event.target.files) {
      const newFilesStatusArray = Array.from(event.target.files).map(file => {
        let previewUrl: string | undefined;
        let fileType: 'image' | 'video' | 'other' = 'other';
        if (file.type.startsWith("image/")) {
          fileType = 'image';
          try { previewUrl = URL.createObjectURL(file); } catch (e) { console.error("Error creating object URL for image preview:", e); }
        } else if (file.type.startsWith("video/")) {
          fileType = 'video';
        }
        return { file, status: "pending" as const, progress: 0, previewUrl, fileType, errorMessage: undefined, gcsObjectName: undefined, caption: "" };
      });
      setFilesStatus(newFilesStatusArray);
    } else {
      setFilesStatus([]);
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setFilesStatus(prev =>
      prev.map((fs, i) => (i === index ? { ...fs, caption } : fs))
    );
  };

  const updateFileStatus = (index: number, status: IndividualFileStatus["status"], gcsObjectName?: string, errorMessage?: string, progress?: number) => {
    setFilesStatus(prev =>
      prev.map((fs, i) => {
        if (i === index) {
          const newStatusUpdate: Partial<IndividualFileStatus> = { status, gcsObjectName, errorMessage };
          if (progress !== undefined) newStatusUpdate.progress = progress;
          if (status === "success" && (newStatusUpdate.progress === undefined || newStatusUpdate.progress < 100)) newStatusUpdate.progress = 100;
          if (status === "error" && progress === undefined) newStatusUpdate.progress = 0; // Reset progress on error
          return { ...fs, ...newStatusUpdate };
        }
        return fs;
      })
    );
  };

  // This function is called by GuestSelector when a specific guest is identified
  const handleGuestIdentified = (guest: { id: number; name: string; inviteeId: number }) => {
    setCurrentGuestId(guest.id);
    setCurrentGuestName(guest.name);
    sessionStorage.setItem("uploadGuestId", guest.id.toString());
    sessionStorage.setItem("uploadGuestName", guest.name);
    // You could also store guest.inviteeId in session if needed elsewhere
    // sessionStorage.setItem("uploadInviteeId", guest.inviteeId.toString());
    setShowGuestIdentifyModal(false);
    
    // Only show "Welcome" for non-anonymous selections
    if (guest.id !== ANONYMOUS_GUEST_DETAILS.id) {
      setNotification({ message: `Welcome, ${guest.name}! You're all set to share your memories.`, type: "success" });
    }
  };

  // This function is called by GuestSelector when user chooses to proceed anonymously
  const handleProceedAnonymously = () => {
    // Use the predefined anonymous guest details
    handleGuestIdentified({
      id: ANONYMOUS_GUEST_DETAILS.id,
      name: ANONYMOUS_GUEST_DETAILS.name,
      inviteeId: ANONYMOUS_GUEST_DETAILS.inviteeId 
    });
    // GuestSelector's onClose will handle setShowGuestIdentifyModal(false)
    setNotification({ message: "You are proceeding anonymously. Your uploads will not be associated with your name.", type: "info" });
  };


  const handleChangeGuest = () => {
    sessionStorage.removeItem("uploadGuestId");
    sessionStorage.removeItem("uploadGuestName");
    // sessionStorage.removeItem("uploadInviteeId"); // If you stored it
    setCurrentGuestId(null);
    setCurrentGuestName(null);
    setShowGuestIdentifyModal(true);
    setNotification(null); // Clear any previous notifications
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGuestId && currentGuestId !== 0) { // Allow 0 if it's a valid ID (e.g. for anonymous)
      setOverallMessage("Please identify yourself before uploading files.");
      setOverallMessageType("error");
      setShowGuestIdentifyModal(true);
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      setOverallMessage("Please select at least one file to upload.");
      setOverallMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setOverallMessage(`✨ Processing your beautiful memories, ${currentGuestName || 'Guest'}...`);
    setOverallMessageType(null); // Or "info" type if you have styling for it

    const operationResults: { success: boolean; fileName: string; error?: string }[] = [];

    for (let i = 0; i < filesStatus.length; i++) {
      const fs = filesStatus[i];
      const file = fs.file;
      updateFileStatus(i, "uploading", undefined, undefined, 0);

      try {
        // Step 1: Get Signed URL
        const signedUrlResponse = await fetch("/api/generate-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const signedUrlData: UploadResponse = await signedUrlResponse.json();
        if (!signedUrlResponse.ok || !signedUrlData.success || !signedUrlData.signedUrl || !signedUrlData.gcsObjectName) {
          throw new Error(signedUrlData.error || signedUrlData.details || "Failed to get an upload URL.");
        }

        // Step 2: Upload to GCS
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrlData.signedUrl as string, true);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.upload.onprogress = (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              updateFileStatus(i, "uploading", signedUrlData.gcsObjectName, undefined, percentComplete);
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`GCS Upload failed for ${file.name}. Status: ${xhr.status} ${xhr.statusText || 'Unknown error'}`));
            }
          };
          xhr.onerror = () => reject(new Error(`Network error during GCS upload for ${file.name}.`));
          xhr.onabort = () => reject(new Error(`GCS Upload aborted for ${file.name}.`));
          xhr.send(file);
        });

        // Step 3: Finalize Upload with Backend
        const finalizeResponse = await fetch('/api/media/finalize-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gcsObjectName: signedUrlData.gcsObjectName,
            originalFileName: file.name,
            contentType: file.type,
            uploaderId: currentGuestId, // This will be 251 for anonymous
            caption: fs.caption, 
          })
        });
        const finalizeData: UploadResponse = await finalizeResponse.json();

        if (!finalizeResponse.ok || !finalizeData.success) {
          throw new Error(finalizeData.error || finalizeData.message || `Failed to save ${file.name} details to our records.`);
        }

        updateFileStatus(i, "success", signedUrlData.gcsObjectName, undefined, 100);
        operationResults.push({ success: true, fileName: file.name });

      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "An unknown error occurred during processing.";
        if (process.env.NODE_ENV !== 'production') console.error(`Error processing ${file.name}:`, error);
        updateFileStatus(i, "error", fs.gcsObjectName, errMsg, 0);
        operationResults.push({ success: false, fileName: file.name, error: errMsg });
      }
    } // End of for loop

    setIsSubmitting(false);
    const successfulUploadsCount = operationResults.filter(r => r.success).length;
    const allSuccessful = operationResults.every(r => r.success);

    if (allSuccessful && filesStatus.length > 0) {
      setOverallMessage(`🎉 Amazing, ${currentGuestName || 'Guest'}! ${successfulUploadsCount} precious ${successfulUploadsCount === 1 ? 'memory has' : 'memories have'} been uploaded successfully! Thank you! ✨`);
      setOverallMessageType("success");
      setSelectedFiles(null); 
      setFilesStatus([]); 
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    } else if (successfulUploadsCount > 0) {
      setOverallMessage(`📸 Great progress, ${currentGuestName || 'Guest'}! ${successfulUploadsCount} ${successfulUploadsCount === 1 ? 'file has' : 'files have'} been uploaded. Some others had issues - please check their status below.`);
      setOverallMessageType("error"); 
    } else if (filesStatus.length > 0) {
      setOverallMessage(`😔 Oops, ${currentGuestName || 'Guest'}! All uploads encountered issues. Please check individual file errors below and try again.`);
      setOverallMessageType("error");
    } else {
      setOverallMessage(`No files were processed.`); // Should not happen if submit button is enabled
      setOverallMessageType(null);
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: IndividualFileStatus["status"]): string => {
    switch (status) {
      case "pending": return "⏳";
      case "uploading": return "📤";
      case "success": return "✅";
      case "error": return "❌";
      default: return "📄";
    }
  };

  return (
    <>
      <Header />
      <NotificationBar
        message={notification ? notification.message : null}
        type={notification ? notification.type : "success"}
        onClose={() => setNotification(null)}
      />

      {showGuestIdentifyModal && (
        <GuestSelector
          isOpen={showGuestIdentifyModal}
          onClose={() => {
            setShowGuestIdentifyModal(false);
            // If modal is closed without any identification (neither specific guest nor anonymous)
            // and user is not yet identified, prompt them.
            if (currentGuestId === null && currentGuestName === null) {
                 setNotification({ message: "Please identify yourself or proceed anonymously to upload photos.", type: "error"});
            }
          }}
          onGuestIdentified={handleGuestIdentified}
          onSelectAnonymous={handleProceedAnonymously} // Pass the new handler
          context="upload"
        />
      )}

      <div className={styles.pageContainer}>
        {/* Conditional Banner for Guest Identification Status */}
        {(!currentGuestName && !showGuestIdentifyModal && currentGuestId === null) && ( // Show only if not identified AND modal is not open
          <div className={`${styles.identifiedGuestBanner} ${styles.guestNotIdentifiedBanner}`}>
            <FaCamera className={styles.guestAvatar} />
            <span className={styles.uploadingAsText}>Please identify yourself to share photos!</span>
            <button onClick={() => setShowGuestIdentifyModal(true)} className={styles.identifyButton}>
              Identify Yourself
            </button>
          </div>
        )}
        {currentGuestName && (
          <div className={styles.identifiedGuestBanner}>
            <FaUserCircle className={styles.guestAvatar} />
            <span className={styles.uploadingAsText}>
              Uploading as <strong>{currentGuestName}</strong>
            </span>
            <button onClick={handleChangeGuest} className={styles.identifyButton}>
              Change Guest
            </button>
          </div>
        )}
        <div className={styles.uploadCard}>
          <h1 className={styles.title}>Share Your Wedding Moments!</h1>
          <p className={styles.instructions}>
            We&apos;d love to see the wedding through your eyes! Please upload your
            favorite photos and videos. Every moment you captured is a treasure to us! 💕
          </p>

          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.fileInputContainer}>
              <label
                htmlFor="fileUpload"
                className={`${styles.fileInputLabel} ${
                  (!currentGuestId && currentGuestId !== ANONYMOUS_GUEST_DETAILS.id) ? styles.disabledLabel : ''
                }`}
              >
                {selectedFiles && selectedFiles.length > 0
                  ? `${selectedFiles.length} beautiful ${selectedFiles.length === 1 ? 'file' : 'files'} selected`
                  : "Choose Your Favorite Memories"}
              </label>
              <input
                type="file"
                id="fileUpload"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={!currentGuestId || currentGuestId === ANONYMOUS_GUEST_DETAILS.id || isSubmitting} // Disable if not identified
              />
            </div>

            {filesStatus.length > 0 && (
              <div className={styles.selectedFilesList}>
                <p>✨ Your Selected Memories:</p>
                <ul>
                  {filesStatus.map((fs, index) => (
                    <li key={index} className={styles.fileStatusItem}>
                      <div className={styles.fileInfoRow}>
                        <div className={styles.fileThumbnailContainer}>
                          {fs.fileType === 'image' && fs.previewUrl && (
                            <Image
                              src={fs.previewUrl}
                              alt={`Preview of ${fs.file.name}`}
                              width={50}
                              height={50}
                              style={{ objectFit: "cover" }}
                              className={styles.filePreviewThumbnail}
                              unoptimized={true} // Good for blob URLs
                            />
                          )}
                          {fs.fileType === 'video' && (<div className={styles.videoThumbnailPlaceholder}><VideoIcon /></div>)}
                          {fs.fileType === 'other' && (<div className={styles.otherFileThumbnailPlaceholder}>📄</div>)}
                        </div>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}> {getStatusIcon(fs.status)} {fs.file.name} </span>
                          <span className={styles.fileSize}> ({formatFileSize(fs.file.size)}) </span>
                        </div>
                        <span className={`${styles.statusText} ${styles[fs.status]}`}>
                          {fs.status === "uploading" ? `${fs.progress}%` : fs.status}
                        </span>
                      </div>
                      {/* Caption Input for each file */}
                      <div className={styles.captionInputContainer}>
                        <textarea
                          placeholder="Add a caption (optional, max 150 chars)"
                          value={fs.caption || ""}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          maxLength={150}
                          className={styles.captionTextarea}
                          rows={2} // Default rows
                          disabled={isSubmitting || fs.status === 'success' || fs.status === 'error'}
                        />
                        <span className={styles.charCount}>
                          {(fs.caption?.length || 0)}/150
                        </span>
                      </div>
                      {(fs.status === "uploading" || fs.status === "success") && fs.progress > 0 && (
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={`${styles.progressBar} ${fs.status === "success" ? styles.progressSuccess : ""}`} 
                            style={{ width: `${fs.progress}%` }} 
                            role="progressbar" 
                            aria-valuenow={fs.progress} 
                            aria-valuemin={0} 
                            aria-valuemax={100} 
                            aria-label={`Upload progress for ${fs.file.name}`}
                          >
                            {fs.status === "uploading" && fs.progress > 15 && `${fs.progress}%`}
                            {fs.status === "success" && `Complete! ✨`}
                          </div>
                        </div>
                      )}
                      {fs.status === "error" && fs.errorMessage && (
                        <div className={styles.fileErrorMessage}> <strong>Upload Issue:</strong> {fs.errorMessage} </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className={styles.uploadButton}
              disabled={isSubmitting || !selectedFiles || selectedFiles.length === 0 || (currentGuestId === null && currentGuestId !== ANONYMOUS_GUEST_DETAILS.id)}
            >
              {isSubmitting ? "✨ Uploading Magic..." : "Share the Love"}
            </button>
          </form>

          {overallMessage && (
            <div className={`${styles.message} ${
                overallMessageType === "success" ? styles.successMessage : 
                overallMessageType === "error" ? styles.errorMessage : 
                overallMessageType === "info" ? styles.infoMessage : // Assuming you'll add .infoMessage style
                styles.loadingMessage // Default or general loading
            }`} role="alert"> 
              {overallMessage} 
            </div>
          )}

          <p className={styles.thankYouNote}> Every photo tells our story... Thank you for being part of it! 💫 </p>
          <p className={styles.photoFeedLink}> <a href="/photo-feed" className={styles.link}> 🖼️ Explore Our Memory Gallery </a> </p>
        </div>
      </div>
    </>
  );
}
