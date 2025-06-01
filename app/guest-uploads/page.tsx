// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import Header from "../components/Header";
import styles from "./GuestUploads.module.css";
import GuestSelector from "../components/GuestSelector"; // Import GuestSelector
import { FaUserCircle } from "react-icons/fa"; // For displaying identified guest

interface UploadResponse {
  success: boolean;
  message?: string;
  signedUrl?: string;
  gcsObjectName?: string;
  error?: string;
  details?: string;
  // If your API for generate-upload-url is updated to save GuestMedia record immediately
  // it might return the new GuestMedia ID, which could be useful.
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
}

// --- NotificationBar (assuming it exists or you'll add it) ---
// You can copy the NotificationBar component from the photo-feed page or create a shared one.
// For brevity, I'll assume it's available and works similarly.
const NotificationBar = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  return (
    <div className={`${styles.notificationBar} ${type === "success" ? styles.successMessage : styles.errorMessage}`}>
      <span>{message}</span>
      <button onClick={onClose} className={styles.notificationCloseButton}>&times;</button>
    </div>
  );
};


const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px" className={styles.videoIcon}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function GuestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filesStatus, setFilesStatus] = useState<IndividualFileStatus[]>([]);
  const [overallMessage, setOverallMessage] = useState<string | null>(null);
  const [overallMessageType, setOverallMessageType] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Guest Identification State ---
  const [currentGuestId, setCurrentGuestId] = useState<number | null>(null);
  const [currentGuestName, setCurrentGuestName] = useState<string | null>(null);
  const [showGuestIdentifyModal, setShowGuestIdentifyModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);


  useEffect(() => {
    // Load guest identity from session storage on mount
    const storedGuestId = sessionStorage.getItem("uploadGuestId");
    const storedGuestName = sessionStorage.getItem("uploadGuestName");
    if (storedGuestId && storedGuestName) {
      setCurrentGuestId(parseInt(storedGuestId, 10));
      setCurrentGuestName(storedGuestName);
    } else {
      // If no guest is identified, prompt them immediately on page load.
      setShowGuestIdentifyModal(true);
    }
  }, []);


  useEffect(() => {
    return () => {
      filesStatus.forEach(fs => {
        if (fs.previewUrl) {
          URL.revokeObjectURL(fs.previewUrl);
        }
      });
    };
  }, [filesStatus]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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
        return { file, status: "pending" as const, progress: 0, previewUrl, fileType };
      });
      setFilesStatus(newFilesStatusArray);
    } else {
      setFilesStatus([]);
    }
  };

  const updateFileStatus = (index: number, status: IndividualFileStatus["status"], gcsObjectName?: string, errorMessage?: string, progress?: number) => {
    setFilesStatus(prev =>
      prev.map((fs, i) => {
        if (i === index) {
          const newStatusUpdate = { ...fs, status, gcsObjectName, errorMessage };
          if (progress !== undefined) newStatusUpdate.progress = progress;
          if (status === "success" && newStatusUpdate.progress !== 100) newStatusUpdate.progress = 100;
          if (status === "error" && progress === undefined) newStatusUpdate.progress = 0;
          return newStatusUpdate;
        }
        return fs;
      })
    );
  };

  const handleGuestIdentified = (guest: { id: number; name: string; inviteeId: number }) => {
    setCurrentGuestId(guest.id);
    setCurrentGuestName(guest.name);
    sessionStorage.setItem("uploadGuestId", guest.id.toString());
    sessionStorage.setItem("uploadGuestName", guest.name);
    setShowGuestIdentifyModal(false);
    setNotification({ message: `Uploading as ${guest.name}. Welcome!`, type: "success" });
  };

  const handleChangeGuest = () => {
    sessionStorage.removeItem("uploadGuestId");
    sessionStorage.removeItem("uploadGuestName");
    setCurrentGuestId(null);
    setCurrentGuestName(null);
    setShowGuestIdentifyModal(true);
     setNotification(null);
  };


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentGuestId) {
      setOverallMessage("Please identify yourself before uploading files.");
      setOverallMessageType("error");
      setShowGuestIdentifyModal(true); // Prompt to identify
      return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      setOverallMessage("Please select at least one file to upload.");
      setOverallMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setOverallMessage(`✨ Processing your beautiful memories, ${currentGuestName}...`);
    setOverallMessageType(null);

    let successfulUploadsCount = 0;

    const uploadPromises = filesStatus.map((fs, i) => {
      const file = fs.file;
      updateFileStatus(i, "uploading", undefined, undefined, 0);

      return (async () => {
        try {
          // Include currentGuestId when requesting a signed URL
          const signedUrlResponse = await fetch("/api/generate-upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              guestId: currentGuestId, // Pass the identified guest's ID
            }),
          });
          const signedUrlData: UploadResponse = await signedUrlResponse.json();
          if (!signedUrlResponse.ok || !signedUrlData.success || !signedUrlData.signedUrl || !signedUrlData.gcsObjectName) {
            throw new Error(signedUrlData.error || signedUrlData.details || "Failed to get an upload URL.");
          }

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", signedUrlData.signedUrl as string, true);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.upload.onprogress = (progressEvent) => {
              if (progressEvent.lengthComputable) {
                const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                updateFileStatus(i, "uploading", undefined, undefined, percentComplete);
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                updateFileStatus(i, "success", signedUrlData.gcsObjectName, undefined, 100);
                
                // Optional: AFTER successful GCS upload, inform backend to create GuestMedia record
                // This assumes your /api/generate-upload-url doesn't create the DB record,
                // and you have another endpoint like /api/media/finalize-upload
                fetch('/api/media/finalize-upload', { // TODO: Create this backend endpoint
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gcsObjectName: signedUrlData.gcsObjectName,
                        originalFileName: file.name,
                        contentType: file.type,
                        uploaderId: currentGuestId
                    })
                }).catch(finalizeError => console.error("Error finalizing upload metadata:", finalizeError));

                resolve();
              } else {
                reject(new Error(`Upload failed for ${file.name}. Status: ${xhr.status} ${xhr.statusText || 'Unknown error'}`));
              }
            };
            xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}. Please check your connection.`));
            xhr.onabort = () => reject(new Error(`Upload aborted for ${file.name}.`));
            xhr.send(file);
          });
          return { success: true, fileName: file.name };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "An unknown error occurred during upload.";
          if (process.env.NODE_ENV !== 'production') console.error(`Error uploading ${file.name}:`, error);
          updateFileStatus(i, "error", undefined, errMsg, 0);
          return { success: false, fileName: file.name, error: errMsg };
        }
      })();
    });
    
    const results = await Promise.all(uploadPromises);
    successfulUploadsCount = results.filter(r => r.success).length;
    const allSuccessful = results.every(r => r.success);

    setIsSubmitting(false);
    if (allSuccessful) {
      setOverallMessage(`🎉 Amazing, ${currentGuestName}! ${successfulUploadsCount} precious ${successfulUploadsCount === 1 ? 'memory has' : 'memories have'} been uploaded successfully! Thank you! ✨`);
      setOverallMessageType("success");
    } else if (successfulUploadsCount > 0) {
      setOverallMessage(`📸 Great progress, ${currentGuestName}! ${successfulUploadsCount} ${successfulUploadsCount === 1 ? 'file has' : 'files have'} been uploaded. Some others had issues - please check below.`);
      setOverallMessageType("error");
    } else {
      setOverallMessage(`😔 Oops, ${currentGuestName}! All uploads encountered issues. Please try again or contact us.`);
      setOverallMessageType("error");
    }
    
    if (allSuccessful) {
      setSelectedFiles(null);
      setFilesStatus([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      {notification && (
        <NotificationBar
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className={styles.pageContainer}>
        <div className={styles.uploadCard}>
            {currentGuestName && (
                <div className={styles.identifiedGuestInfo}>
                    <FaUserCircle className={styles.identifiedGuestIcon} />
                    <span>Uploading as: <strong>{currentGuestName}</strong></span>
                    <button onClick={handleChangeGuest} className={styles.changeGuestButton}>
                        (Change User)
                    </button>
                </div>
            )}

          <h1 className={styles.title}>Share Your Wedding Moments!</h1>
          <p className={styles.instructions}>
            We&apos;d love to see the wedding through your eyes! Please upload your
            favorite photos and videos. Every moment you captured is a treasure to us! 💕
          </p>

          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.fileInputContainer}>
              <label htmlFor="fileUpload" className={styles.fileInputLabel}>
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
                disabled={isSubmitting || !currentGuestId} // Disable if no guest identified
              />
            </div>

            {filesStatus.length > 0 && (
              <div className={styles.selectedFilesList}>
                <p>✨ Your Selected Memories:</p>
                <ul> {/* List items remain the same */}
                  {filesStatus.map((fs, index) => (
                    <li key={index} className={styles.fileStatusItem}>
                      <div className={styles.fileInfoRow}>
                        <div className={styles.fileThumbnailContainer}>
                          {fs.fileType === 'image' && fs.previewUrl && ( <img src={fs.previewUrl} alt={`Preview of ${fs.file.name}`} className={styles.filePreviewThumbnail} /> )}
                          {fs.fileType === 'video' && ( <div className={styles.videoThumbnailPlaceholder}><VideoIcon /></div> )}
                          {fs.fileType === 'other' && ( <div className={styles.otherFileThumbnailPlaceholder}>📄</div> )}
                        </div>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}> {getStatusIcon(fs.status)} {fs.file.name} </span>
                          <span className={styles.fileSize}> ({formatFileSize(fs.file.size)}) </span>
                        </div>
                        <span className={`${styles.statusText} ${styles[fs.status]}`}>
                          {fs.status === "uploading" ? `${fs.progress}%` : fs.status}
                        </span>
                      </div>
                      {(fs.status === "uploading" || fs.status === "success") && (
                        <div className={styles.progressBarContainer}>
                          <div className={`${styles.progressBar} ${fs.status === "success" ? styles.progressSuccess : ""}`} style={{ width: `${fs.progress}%` }} role="progressbar" aria-valuenow={fs.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Upload progress for ${fs.file.name}`}>
                            {fs.status === "uploading" && fs.progress > 15 && `${fs.progress}%`}
                            {fs.status === "success" && `Complete! ✨`}
                          </div>
                        </div>
                      )}
                      {fs.status === "error" && fs.errorMessage && ( <div className={styles.fileErrorMessage}> <strong>Upload Issue:</strong> {fs.errorMessage} </div> )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className={styles.uploadButton}
              disabled={isSubmitting || !selectedFiles || selectedFiles.length === 0 || !currentGuestId}
            >
              {isSubmitting ? "✨ Uploading Magic..." : "Share the Love"}
            </button>
          </form>

          {overallMessage && ( <div className={`${styles.message} ${ overallMessageType === "success" ? styles.successMessage : overallMessageType === "error" ? styles.errorMessage : styles.loadingMessage }`} role="alert"> {overallMessage} </div> )}
          
          <p className={styles.thankYouNote}> Every photo tells our story... Thank you for being part of it! 💫 </p>
          <p className={styles.photoFeedLink}> <a href="/photo-feed" className={styles.link}> 🖼️ Explore Our Memory Gallery </a> </p>
        </div>
      </div>

      {showGuestIdentifyModal && (
        <GuestSelector
            isOpen={showGuestIdentifyModal}
            onClose={() => {
                setShowGuestIdentifyModal(false);
                if (!currentGuestId) setNotification({message: "Please identify yourself to upload photos.", type: "error"});
            }}
            onGuestIdentified={handleGuestIdentified}
        />
      )}
    </>
  );
}