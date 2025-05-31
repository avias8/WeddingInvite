// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import Header from "../components/Header";
import styles from "./GuestUploads.module.css";

interface UploadResponse {
  success: boolean;
  message?: string; // Optional for this new approach
  signedUrl?: string;
  gcsObjectName?: string;
  error?: string;
  details?: string;
}

interface IndividualFileStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
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
        Array.from(event.target.files).map(file => ({ file, status: "pending" }))
      );
    } else {
      setFilesStatus([]);
    }
  };

  const updateFileStatus = (index: number, status: IndividualFileStatus["status"], gcsObjectName?: string, errorMessage?: string) => {
    setFilesStatus(prev =>
      prev.map((fs, i) =>
        i === index ? { ...fs, status, gcsObjectName, errorMessage } : fs
      )
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
    setOverallMessageType(null);

    let allSuccessful = true;
    let successfulUploadsCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      updateFileStatus(i, "uploading");

      try {
        // 1. Get signed URL from your new API
        const signedUrlResponse = await fetch("/api/generate-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });

        const signedUrlData: UploadResponse = await signedUrlResponse.json();

        if (!signedUrlResponse.ok || !signedUrlData.success || !signedUrlData.signedUrl) {
          throw new Error(signedUrlData.error || signedUrlData.details || "Failed to get an upload URL.");
        }

        // 2. Upload file directly to GCS
        const gcsUploadResponse = await fetch(signedUrlData.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!gcsUploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}. Status: ${gcsUploadResponse.status}`);
        }

        updateFileStatus(i, "success", signedUrlData.gcsObjectName);
        successfulUploadsCount++;

      } catch (error) {
        allSuccessful = false;
        const errMsg = error instanceof Error ? error.message : "An unknown error occurred during upload.";
        console.error(`Error uploading ${file.name}:`, error);
        updateFileStatus(i, "error", undefined, errMsg);
        // You might want to collect individual errors to show them
      }
    }

    setIsSubmitting(false);
    if (allSuccessful) {
      setOverallMessage( `${successfulUploadsCount} file(s) uploaded successfully! Thank you!`);
      setOverallMessageType("success");
      setSelectedFiles(null); // Clear selection
      setFilesStatus([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    } else if (successfulUploadsCount > 0) {
        setOverallMessage(
            `Finished: ${successfulUploadsCount} file(s) uploaded successfully, but some failed. Check individual statuses.`
        );
        setOverallMessageType("error"); // or a "warning" type if you have one
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
                      <span>
                        {fs.file.name} ({(fs.file.size / 1024 / 1024).toFixed(2)} MB) - {}
                        <span className={`${styles.statusText} ${styles[fs.status]}`}>
                            {fs.status.toUpperCase()}
                        </span>
                      </span>
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
                  : styles.loadingMessage
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