/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from '../../lib/firebase';
import Header from '../components/Header';
import styles from './SelfieGame.module.css';

const storage = getStorage(app);

const SelfieGamePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = ref(storage, 'selfie-game/active-selfie.jpg');

  useEffect(() => {
    getDownloadURL(imageRef)
      .then((url) => setImageUrl(url))
      .catch((err) => {
        if (err.code === 'storage/object-not-found') setImageUrl(null);
        else setError("Could not load the current selfie.");
      });
  }, [imageRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
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
      setError("Upload failed. Please try again.");
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
      setError("Failed to clear the selfie.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <div className={styles.bannerContainer}>
          <h1 className={styles.sectionHeading}>Selfie Game</h1>
          <div className={styles.controlsContainer}>
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
          </div>
          {imageUrl ? (
            <div className={styles.imageContainer}>
              <img src={imageUrl} alt="Current Selfie" className={styles.image} />
            </div>
          ) : (
            <p className={styles.placeholder}>No selfie has been uploaded yet. Be the first!</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SelfieGamePage;
