// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import Header from "../components/Header"; // Assuming Header is in app/components
import styles from "./GuestUploads.module.css"; // We'll create this CSS module

// Define a type for the API response for better type safety
interface UploadResponse {
  success: boolean;
  message: string;
  uploadedFiles?: { fileName: string; gcsPath: string }[];
  error?: string;
}

export default function GuestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setMessage(null); // Clear previous messages
    setMessageType(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setMessage("Please select at least one file to upload.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("Uploading, please wait...");
    setMessageType(null); // Neutral message type while loading

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]); // API expects "files"
    }

    try {
      const response = await fetch("/api/guest-uploads", {
        method: "POST",
        body: formData,
        // Headers are not strictly necessary for FormData with fetch,
        // browser sets 'Content-Type': 'multipart/form-data' automatically.
      });

      const result: UploadResponse = await response.json();

      if (response.ok && result.success) {
        setMessage(
          result.message || "Files uploaded successfully! Thank you!"
        );
        setMessageType("success");
        setSelectedFiles(null); // Clear selection
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      } else {
        setMessage(
          result.error ||
            result.message ||
            "An error occurred during upload. Please try again."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Upload submission error:", error);
      setMessage(
        "A network error occurred. Please check your connection and try again."
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        <div className={styles.uploadCard}>
          <h1 className={styles.title}>Share Your Wedding Moments!</h1>
          <p className={styles.instructions}>
            We'd love to see the wedding through your eyes! Please upload your
            favorite photos and videos from our special day right here.
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
                accept="image/*,video/*" // Accepts all image and video types
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={isLoading}
              />
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className={styles.selectedFilesList}>
                <p>Selected:</p>
                <ul>
                  {Array.from(selectedFiles).map((file, index) => (
                    <li key={index}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className={styles.uploadButton}
              disabled={isLoading || !selectedFiles || selectedFiles.length === 0}
            >
              {isLoading ? "Uploading..." : "Upload Memories"}
            </button>
          </form>

          {message && (
            <div
              className={`${styles.message} ${
                messageType === "success"
                  ? styles.successMessage
                  : messageType === "error"
                  ? styles.errorMessage
                  : styles.loadingMessage // For the "Uploading, please wait..." state
              }`}
            >
              {message}
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