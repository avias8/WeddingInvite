/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from '../../lib/firebase';
import styles from './SelfieGame.module.css'; // Import the CSS module

const storage = getStorage(app);

const SelfieGamePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = ref(storage, 'selfie-game/active-selfie.jpg');

  useEffect(() => {
    console.log("Attempting to fetch initial selfie...");
    getDownloadURL(imageRef)
      .then((url) => {
        console.info("Successfully fetched existing selfie URL:", url);
        setImageUrl(url);
      })
      .catch((err) => {
        if (err.code === 'storage/object-not-found') {
          console.log("No active selfie found.");
          setImageUrl(null);
        } else {
          console.error("Firebase Error: Failed to fetch initial image.", err);
          setError("Could not load the current selfie. Please try refreshing.");
        }
      });
  }, [imageRef]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log(`File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      await uploadBytes(imageRef, selectedFile);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);
      setSelectedFile(null);
    } catch (err) {
      console.error("Firebase Error: Upload failed.", err);
      setError("Something went wrong during the upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    setError(null);
    try {
      await deleteObject(imageRef);
      setImageUrl(null);
    } catch (err) {
      console.error("Firebase Error: Deletion failed.", err);
      setError("Could not clear the selfie. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Selfie Game</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.controls}>
        <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
        <button onClick={handleUpload} disabled={!selectedFile || uploading} className={`${styles.btn} ${styles.btnPrimary}`}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button onClick={handleClear} disabled={!imageUrl} className={`${styles.btn} ${styles.btnSecondary}`}>
          Clear Selfie
        </button>
      </div>
      {imageUrl ? (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt="Current Selfie" className={styles.image} />
        </div>
      ) : (
        <p className={styles.placeholder}>No selfie has been uploaded yet. Be the first!</p>
      )}
    </div>
  );
};

export default SelfieGamePage;
