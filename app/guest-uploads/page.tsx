// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import Header from "../components/Header";
import styles from "./GuestUploads.module.css";
import GuestSelector from "../components/GuestSelector";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import Image from "next/image"; // Import next/image

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
}

// NotificationBar Component
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
    <div className={`${styles.notificationBar} ${type === "success" ? styles.successMessage : styles.errorMessage}`}>
      <span>{message}</span>
      <button onClick={onClose} className={styles.notificationCloseButton}>&times;</button>
    </div>
  );
};

// VideoIcon Component (remains the same)
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

  const [currentGuestId, setCurrentGuestId] = useState<number | null>(null);
  const [currentGuestName, setCurrentGuestName] = useState<string | null>(null);
  const [showGuestIdentifyModal, setShowGuestIdentifyModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // useEffect for guest identification (remains the same)
  useEffect(() => {
    const storedGuestId = sessionStorage.getItem("uploadGuestId");
    const storedGuestName = sessionStorage.getItem("uploadGuestName");
    if (storedGuestId && storedGuestName) {
      setCurrentGuestId(parseInt(storedGuestId, 10));
      setCurrentGuestName(storedGuestName);
    } else {
      setShowGuestIdentifyModal(true);
    }
  }, []);

  // useEffect for revoking object URLs (remains the same)
  useEffect(() => {
    return () => {
      filesStatus.forEach(fs => {
        if (fs.previewUrl) {
          URL.revokeObjectURL(fs.previewUrl);
        }
      });
    };
  }, [filesStatus]);

  // handleFileChange (remains the same)
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

  // updateFileStatus (remains the same)
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

  // handleGuestIdentified (remains the same)
  const handleGuestIdentified = (guest: { id: number; name: string; inviteeId: number }) => {
    setCurrentGuestId(guest.id);
    setCurrentGuestName(guest.name);
    sessionStorage.setItem("uploadGuestId", guest.id.toString());
    sessionStorage.setItem("uploadGuestName", guest.name);
    setShowGuestIdentifyModal(false);
    setNotification({ message: `Welcome, ${guest.name}! You're all set to share your memories.`, type: "success" });
  };

  // handleChangeGuest (remains the same)
  const handleChangeGuest = () => {
    sessionStorage.removeItem("uploadGuestId");
    sessionStorage.removeItem("uploadGuestName");
    setCurrentGuestId(null);
    setCurrentGuestName(null);
    setShowGuestIdentifyModal(true);
    setNotification(null);
  };

  // handleSubmit (remains the same, ensure currentGuestId is used for finalize-upload)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentGuestId) {
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
    setOverallMessage(`✨ Processing your beautiful memories, ${currentGuestName}...`);
    setOverallMessageType(null);
    let successfulUploadsCount = 0;

    const uploadPromises = filesStatus.map((fs, i) => {
      const file = fs.file;
      updateFileStatus(i, "uploading", undefined, undefined, 0);
      return (async () => {
        try {
          const signedUrlResponse = await fetch("/api/generate-upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, contentType: file.type }),
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
                // Ensure currentGuestId is passed to finalize-upload
                fetch('/api/media/finalize-upload', { // Assuming this endpoint exists
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gcsObjectName: signedUrlData.gcsObjectName,
                        originalFileName: file.name,
                        contentType: file.type,
                        uploaderId: currentGuestId // Pass the identified guest's ID
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

  // formatFileSize (remains the same)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // getStatusIcon (remains the same)
  const getStatusIcon = (status: IndividualFileStatus["status"]): string => {
    switch (status) {
      case "pending": return "⏳";
      case "uploading": return "📤";
      case "success": return "✅";
      case "error": return "❌";
      default: return "📄";
    }
  };

  // SelectedUserBadge Component (remains the same)
  const SelectedUserBadge = () =>
    currentGuestName ? (
      <div className={styles.selectedUserBadgeCard}>
        <span className={styles.userAvatar}><FaUserCircle /></span>
        <span className={styles.userName}>{currentGuestName}</span>
        <button className={styles.changeUserBtn} onClick={handleChangeGuest}>
          Change
        </button>
      </div>
    ) : null;

  return (
    <>
      <Header />
      {/* Pass notification.message or null to NotificationBar */}
      <NotificationBar
        message={notification ? notification.message : null}
        type={notification ? notification.type : "success"} // Default type if message is null but component is rendered
        onClose={() => setNotification(null)}
      />
      <div className={styles.pageContainer}>
        <SelectedUserBadge />
        <div className={styles.uploadCard}>
          {!currentGuestName && (
            <div className={`${styles.identifiedGuestBanner} ${styles.guestNotIdentifiedBanner}`}>
              <FaCamera className={styles.guestAvatar} />
              <span className={styles.uploadingAsText}>Please identify yourself to share photos!</span>
              <button onClick={() => setShowGuestIdentifyModal(true)} className={styles.identifyButton}>
                Identify Yourself
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
                disabled={isSubmitting || !currentGuestId}
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
                          {/* Use next/image for image previews */}
                          {fs.fileType === 'image' && fs.previewUrl && (
                            <Image
                              src={fs.previewUrl}
                              alt={`Preview of ${fs.file.name}`}
                              width={50} // Provide appropriate width
                              height={50} // Provide appropriate height
                              style={{ objectFit: "cover" }} // Use style prop for objectFit
                              className={styles.filePreviewThumbnail}
                              unoptimized={true} // Object URLs might not be optimizable by Next.js
                            />
                          )}
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
            context="upload"
        />
      )}
    </>
  );
}
