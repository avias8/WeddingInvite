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

  const updateFileStatus = (
    index: number,
    status: IndividualFileStatus["status"],
    gcsObjectName?: string,
    errorMessage?: string,
    progress?: number // Optional progress parameter
  ) => {
    setFilesStatus(prev =>
      prev.map((fs, i) => {
        if (i === index) {
          const newStatus = { ...fs, status, gcsObjectName, errorMessage };
          if (progress !== undefined) {
            newStatus.progress = progress;
          }
          // Ensure progress is 100 on success, 0 on error if not already set
          if (status === "success" && newStatus.progress !== 100) newStatus.progress = 100;
          if (status === "error" && progress === undefined) newStatus.progress = 0; // Reset progress on error if not specified
          return newStatus;
        }
        return fs;
      })
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setOverallMessage("Please select at least one file to upload.");
      setOverallMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setOverallMessage("Processing uploads...");
    setOverallMessageType(null); // Neutral message type while processing

    let allSuccessful = true;
    let successfulUploadsCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      updateFileStatus(i, "uploading", undefined, undefined, 0); // Start progress at 0

      try {
        // 1. Get signed URL from your API
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
          xhr.open("PUT", signedUrlData.signedUrl as string);
          xhr.setRequestHeader("Content-Type", file.type);

          // Progress event listener
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              updateFileStatus(i, "uploading", undefined, undefined, percentComplete);
            }
          };

          // On successful upload
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              updateFileStatus(i, "success", signedUrlData.gcsObjectName, undefined, 100);
              successfulUploadsCount++;
              resolve();
            } else {
              reject(new Error(`Upload failed for ${file.name}. Status: ${xhr.status} ${xhr.statusText}`));
            }
          };

          // On upload error
          xhr.onerror = () => {
            reject(new Error(`Network error during upload for ${file.name}.`));
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
        console.error(`Error uploading ${file.name}:`, error);
        updateFileStatus(i, "error", undefined, errMsg, 0); // Reset progress on error
      }
    }

    setIsSubmitting(false);
    if (allSuccessful) {
      setOverallMessage(`${successfulUploadsCount} file(s) uploaded successfully! Thank you!`);
      setOverallMessageType("success");
      setSelectedFiles(null);
      setFilesStatus([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (successfulUploadsCount > 0) {
      setOverallMessage(
        `Finished: ${successfulUploadsCount} file(s) uploaded successfully, but some failed. Check individual statuses.`
      );
      setOverallMessageType("error"); // Or a "warning" type
    } else {
      setOverallMessage("All file uploads failed. Please try again or contact support.");
      setOverallMessageType("error");
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
            favorite photos and videos from our special day right here. (Large videos are now supported!)
          </p>

          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.fileInputContainer}>
              <label htmlFor="fileUpload" className={styles.fileInputLabel}>
                {selectedFiles && selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "Choose Files (Photos/Videos)"}
              </label>
              <input
                type="file"
                id="fileUpload"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={isSubmitting}
              />
            </div>

            {filesStatus.length > 0 && (
              <div className={styles.selectedFilesList}>
                <p>Selected Files:</p>
                <ul>
                  {filesStatus.map((fs, index) => (
                    <li key={index} className={styles.fileStatusItem}>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{fs.file.name}</span>
                        <span className={styles.fileSize}> ({(fs.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <span className={`${styles.statusText} ${styles[fs.status]}`}>
                          {fs.status.toUpperCase()}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      {(fs.status === "uploading" || fs.status === "success") && (
                        <div className={styles.progressBarContainer}>
                          <div
                            className={`${styles.progressBar} ${fs.status === "success" ? styles.progressSuccess : ""}`}
                            style={{ width: `${fs.progress}%` }}
                          >
                            {fs.status === "uploading" && fs.progress > 0 && `${fs.progress}%`}
                            {fs.status === "success" && `✓`}
                          </div>
                        </div>
                      )}
                      {fs.status === "error" && fs.errorMessage && (
                        <span className={styles.fileErrorMessage}>Error: {fs.errorMessage}</span>
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
              {isSubmitting ? "Uploading..." : "Upload Memories"}
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
            >
              {overallMessage}
            </div>
          )}
          <p className={styles.thankYouNote}>
            Thank you for sharing your memories with us!
          </p>
          <p className={styles.photoFeedLink}>
            <a href="/photo-feed" className={styles.link}>
              View the Photo Feed
            </a>
          </p>
        </div>
      </div>
    </>
  );
}