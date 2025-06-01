// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import Header from "../components/Header"; // Adjust path as needed
import styles from "./GuestUploads.module.css"; // Ensure this path is correct

interface UploadResponse {
  success: boolean;
  message?: string;
  signedUrl?: string;
  gcsObjectName?: string;
  error?: string;
  details?: string;
}

interface IndividualFileStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number; // Progress percentage (0-100)
  errorMessage?: string;
  gcsObjectName?: string;
}

export default function GuestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filesStatus, setFilesStatus] = useState<IndividualFileStatus[]>([]);
  const [overallMessage, setOverallMessage] = useState<string | null>(null);
  const [overallMessageType, setOverallMessageType] = useState< "success" | "error" | null >(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the change event of the file input.
   * Updates the selected files and initializes their status.
   * @param event - The change event from the file input.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setOverallMessage(null);
    setOverallMessageType(null);
    if (event.target.files) {
      setFilesStatus(
        Array.from(event.target.files).map(file => ({
          file,
          status: "pending",
          progress: 0, // Initialize progress to 0
        }))
      );
    } else {
      setFilesStatus([]);
    }
  };

  /**
   * Updates the status and progress of a specific file in the filesStatus array.
   * @param index - The index of the file in the filesStatus array.
   * @param status - The new status of the file.
   * @param gcsObjectName - (Optional) The GCS object name if upload is successful.
   * @param errorMessage - (Optional) An error message if the upload failed.
   * @param progress - (Optional) The upload progress percentage.
   */
  const updateFileStatus = (
    index: number,
    status: IndividualFileStatus["status"],
    gcsObjectName?: string,
    errorMessage?: string,
    progress?: number
  ) => {
    setFilesStatus(prev =>
      prev.map((fs, i) => {
        if (i === index) {
          const newStatusUpdate = { ...fs, status, gcsObjectName, errorMessage };
          if (progress !== undefined) {
            newStatusUpdate.progress = progress;
          }
          // Ensure progress is 100 on success, 0 on error if not already set by progress event
          if (status === "success" && newStatusUpdate.progress !== 100) newStatusUpdate.progress = 100;
          if (status === "error" && progress === undefined) newStatusUpdate.progress = 0;
          return newStatusUpdate;
        }
        return fs;
      })
    );
  };

  /**
   * Handles the form submission for uploading files.
   * Iterates through selected files, gets a signed URL for each,
   * and uploads them to GCS using XMLHttpRequest to track progress.
   * @param event - The form submission event.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setOverallMessage("Please select at least one file to upload.");
      setOverallMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setOverallMessage("✨ Processing your beautiful memories...");
    setOverallMessageType(null); // Neutral message type while processing

    let allSuccessful = true;
    let successfulUploadsCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      updateFileStatus(i, "uploading", undefined, undefined, 0); // Start progress at 0

      try {
        // 1. Get signed URL from the API
        const signedUrlResponse = await fetch("/api/generate-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });

        const signedUrlData: UploadResponse = await signedUrlResponse.json();

        if (!signedUrlResponse.ok || !signedUrlData.success || !signedUrlData.signedUrl) {
          throw new Error(signedUrlData.error || signedUrlData.details || "Failed to get an upload URL.");
        }

        // 2. Upload file directly to GCS using XMLHttpRequest for progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signedUrlData.signedUrl as string, true); // Ensure async is true
          xhr.setRequestHeader("Content-Type", file.type);

          // Progress event listener
          xhr.upload.onprogress = (progressEvent) => {
            if (progressEvent.lengthComputable) {
              const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              updateFileStatus(i, "uploading", undefined, undefined, percentComplete);
            }
          };

          // On successful upload
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) { // Check for successful HTTP status codes
              updateFileStatus(i, "success", signedUrlData.gcsObjectName, undefined, 100);
              successfulUploadsCount++;
              resolve();
            } else {
              reject(new Error(`Upload failed for ${file.name}. Status: ${xhr.status} ${xhr.statusText || 'Unknown error'}`));
            }
          };

          // On upload error
          xhr.onerror = () => {
            // This typically handles network errors
            reject(new Error(`Network error during upload for ${file.name}. Please check your connection.`));
          };

          // On upload abort
          xhr.onabort = () => {
            reject(new Error(`Upload aborted for ${file.name}.`));
          };

          xhr.send(file);
        });

      } catch (error) {
        allSuccessful = false;
        const errMsg = error instanceof Error ? error.message : "An unknown error occurred during upload.";
        // Conditional console logging for production
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Error uploading ${file.name}:`, error);
        }
        updateFileStatus(i, "error", undefined, errMsg, 0); // Reset progress on error
      }
    }

    setIsSubmitting(false);
    // Update overall message based on upload results
    if (allSuccessful) {
      setOverallMessage(`🎉 Amazing! ${successfulUploadsCount} precious ${successfulUploadsCount === 1 ? 'memory' : 'memories'} uploaded successfully! Thank you for sharing your moments with us! ✨`);
      setOverallMessageType("success");
      setSelectedFiles(null); // Clear selection
      setFilesStatus([]);     // Clear file statuses
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    } else if (successfulUploadsCount > 0) {
      setOverallMessage(
        `📸 Great progress! ${successfulUploadsCount} ${successfulUploadsCount === 1 ? 'file' : 'files'} uploaded successfully, but some encountered issues. Please check the details below and try again for the failed uploads.`
      );
      setOverallMessageType("error"); // Or a "warning" type if you have one
    } else {
      setOverallMessage("😔 Oops! All uploads encountered issues. Please try again or contact us if the problem persists.");
      setOverallMessageType("error");
    }
  };

  /**
   * Formats file size in a human-readable format
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Gets the appropriate icon for file status
   * @param status - Current file status
   * @returns Icon string
   */
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
      <div className={styles.pageContainer}>
        <div className={styles.uploadCard}>
          <h1 className={styles.title}>Share Your Wedding Moments!</h1>
          <p className={styles.instructions}>
            We&apos;d love to see the wedding through your eyes! Please upload your
            favorite photos and videos from our special day. Every moment you captured
            is a treasure to us! 💕
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
                accept="image/*,video/*" // Restrict file types
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={isSubmitting}
              />
            </div>

            {filesStatus.length > 0 && (
              <div className={styles.selectedFilesList}>
                <p>✨ Your Selected Memories:</p>
                <ul>
                  {filesStatus.map((fs, index) => (
                    <li key={index} className={styles.fileStatusItem}>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>
                          {getStatusIcon(fs.status)} {fs.file.name}
                        </span>
                        <span className={styles.fileSize}>
                          ({formatFileSize(fs.file.size)})
                        </span>
                        <span className={`${styles.statusText} ${styles[fs.status]}`}>
                          {fs.status === "uploading" ? `${fs.progress}%` : fs.status}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      {(fs.status === "uploading" || fs.status === "success") && (
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
                        <div className={styles.fileErrorMessage}>
                          <strong>Upload Issue:</strong> {fs.errorMessage}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className={styles.uploadButton}
              disabled={isSubmitting || !selectedFiles || selectedFiles.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span>✨ Uploading Magic...</span>
                </>
              ) : (
                <>
                  <span>Share the Love</span>
                </>
              )}
            </button>
          </form>

          {overallMessage && (
            <div
              className={`${styles.message} ${
                overallMessageType === "success"
                  ? styles.successMessage
                  : overallMessageType === "error"
                  ? styles.errorMessage
                  : styles.loadingMessage // For neutral "Processing uploads..."
              }`}
              role="alert" // For accessibility
            >
              {overallMessage}
            </div>
          )}
          
          <p className={styles.thankYouNote}>
            Every photo tells our story... Thank you for being part of it! 💫
          </p>
          
          <p className={styles.photoFeedLink}>
            <a href="/photo-feed" className={styles.link}>
              🖼️ Explore Our Memory Gallery
            </a>
          </p>
        </div>
      </div>
    </>
  );
}