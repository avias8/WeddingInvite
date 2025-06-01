// app/guest-uploads/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import Header from "../components/Header";
import styles from "./GuestUploads.module.css";

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
  progress: number;
  previewUrl?: string; // For image thumbnail previews
  fileType: 'image' | 'video' | 'other'; // To distinguish file types
  errorMessage?: string;
  gcsObjectName?: string;
}

// Simple SVG Play Icon for video thumbnails
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px" className={styles.videoIcon}>
    <path d="M8 5v14l11-7z" />
  </svg>
);


export default function GuestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filesStatus, setFilesStatus] = useState<IndividualFileStatus[]>([]);
  const [overallMessage, setOverallMessage] = useState<string | null>(null);
  const [overallMessageType, setOverallMessageType] = useState< "success" | "error" | null >(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    filesStatus.forEach(fs => {
      if (fs.previewUrl) {
        URL.revokeObjectURL(fs.previewUrl);
      }
    });

    setSelectedFiles(event.target.files);
    setOverallMessage(null);
    setOverallMessageType(null);

    if (event.target.files) {
      const newFilesStatusArray = Array.from(event.target.files).map(file => {
        let previewUrl: string | undefined;
        let fileType: 'image' | 'video' | 'other' = 'other';

        if (file.type.startsWith("image/")) {
          fileType = 'image';
          try {
            previewUrl = URL.createObjectURL(file);
          } catch (e) {
            console.error("Error creating object URL for image preview:", e);
          }
        } else if (file.type.startsWith("video/")) {
          fileType = 'video';
          // No dynamic preview for video, icon will be used
        }

        return {
          file,
          status: "pending" as "pending" | "uploading" | "success" | "error",
          progress: 0,
          previewUrl,
          fileType,
        };
      });
      setFilesStatus(newFilesStatusArray);
    } else {
      setFilesStatus([]);
    }
  };

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
          if (status === "success" && newStatusUpdate.progress !== 100) newStatusUpdate.progress = 100;
          if (status === "error" && progress === undefined) newStatusUpdate.progress = 0;
          return newStatusUpdate;
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
    setOverallMessage("✨ Processing your beautiful memories...");
    setOverallMessageType(null);

    let allSuccessful = true;
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
          if (!signedUrlResponse.ok || !signedUrlData.success || !signedUrlData.signedUrl) {
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
                // successfulUploadsCount++; // Handled after Promise.all
                resolve();
              } else {
                reject(new Error(`Upload failed for ${file.name}. Status: ${xhr.status} ${xhr.statusText || 'Unknown error'}`));
              }
            };
            xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}. Please check your connection.`));
            xhr.onabort = () => reject(new Error(`Upload aborted for ${file.name}.`));
            xhr.send(file);
          });
          return { success: true, fileName: file.name }; // Return success marker
        } catch (error) {
          // allSuccessful = false; // Handled after Promise.all
          const errMsg = error instanceof Error ? error.message : "An unknown error occurred during upload.";
          if (process.env.NODE_ENV !== 'production') {
            console.error(`Error uploading ${file.name}:`, error);
          }
          updateFileStatus(i, "error", undefined, errMsg, 0);
          return { success: false, fileName: file.name, error: errMsg }; // Return error marker
        }
      })();
    });
    
    const results = await Promise.all(uploadPromises);
    successfulUploadsCount = results.filter(r => r.success).length;
    allSuccessful = results.every(r => r.success);

    setIsSubmitting(false);
    if (allSuccessful) {
      setOverallMessage(`🎉 Amazing! ${successfulUploadsCount} precious ${successfulUploadsCount === 1 ? 'memory' : 'memories'} uploaded successfully! Thank you for sharing your moments with us! ✨`);
      setOverallMessageType("success");
    } else if (successfulUploadsCount > 0) {
      setOverallMessage(
        `📸 Great progress! ${successfulUploadsCount} ${successfulUploadsCount === 1 ? 'file' : 'files'} uploaded successfully, but some encountered issues. Please check the details below and try again for the failed uploads.`
      );
      setOverallMessageType("error");
    } else {
      setOverallMessage("😔 Oops! All uploads encountered issues. Please try again or contact us if the problem persists.");
      setOverallMessageType("error");
    }
    
    if (allSuccessful) {
        setSelectedFiles(null);
        setFilesStatus([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                accept="image/*,video/*"
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
                      <div className={styles.fileInfoRow}> {/* Changed from fileInfo to fileInfoRow */}
                        <div className={styles.fileThumbnailContainer}>
                          {fs.fileType === 'image' && fs.previewUrl && (
                            <img 
                              src={fs.previewUrl} 
                              alt={`Preview of ${fs.file.name}`} 
                              className={styles.filePreviewThumbnail} 
                            />
                          )}
                          {fs.fileType === 'video' && (
                            <div className={styles.videoThumbnailPlaceholder}>
                              <VideoIcon />
                            </div>
                          )}
                          {fs.fileType === 'other' && (
                             <div className={styles.otherFileThumbnailPlaceholder}>📄</div>
                          )}
                        </div>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>
                            {getStatusIcon(fs.status)} {fs.file.name}
                          </span>
                          <span className={styles.fileSize}>
                            ({formatFileSize(fs.file.size)})
                          </span>
                        </div>
                        <span className={`${styles.statusText} ${styles[fs.status]}`}>
                          {fs.status === "uploading" ? `${fs.progress}%` : fs.status}
                        </span>
                      </div>
                      
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
                <><span>✨ Uploading Magic...</span></>
              ) : (
                <><span>Share the Love</span></>
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
                  : styles.loadingMessage
              }`}
              role="alert"
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