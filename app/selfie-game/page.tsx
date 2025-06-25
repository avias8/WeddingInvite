/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// Import Firestore functions
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import app from '../../lib/firebase';
import Header from '../components/Header';
import styles from './SelfieGame.module.css';

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

const SelfieGamePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true); // To show initial loading state

  // Reference to the image file in Cloud Storage
  const imageRef = ref(storage, 'selfie-game/active-selfie.jpg');
  // Reference to the document in Firestore
  const selfieDocRef = doc(db, 'selfie-game', 'status');

  // Set up a real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(selfieDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setImageUrl(data.url);
      } else {
        setImageUrl(null);
      }
      setLoadingInitial(false);
    }, (err) => {
      console.error("Firestore listener error:", err);
      setError("Could not connect to the selfie game.");
      setLoadingInitial(false);
    });

    // Clean up the listener when the component unmounts.
    return () => unsubscribe();
  }, [selfieDocRef]);

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
      await setDoc(selfieDocRef, { url: url });
      setSelectedFile(null);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    setError(null);
    setUploading(true);
    try {
      await deleteObject(imageRef);
      await setDoc(selfieDocRef, { url: null });
    } catch (err: unknown) { // <-- FIX IS HERE
      // Type guard to check the error structure safely
      if (typeof err === 'object' && err !== null && 'code' in err) {
          const firebaseError = err as { code: string };
          if (firebaseError.code === 'storage/object-not-found') {
              // If file is not in storage, it's already "cleared".
              // Still ensure the database record is cleared.
              await setDoc(selfieDocRef, { url: null });
          } else {
              // For other known Firebase errors
              setError("Failed to clear the selfie.");
          }
      } else {
          // For any other unexpected errors
          setError("An unexpected error occurred.");
      }
    } finally {
        setUploading(false);
    }
  };

  const renderContent = () => {
    if (loadingInitial) {
        return <p className={styles.placeholder}>Connecting to the game...</p>;
    }
    if (imageUrl) {
        return (
            <div className={styles.imageContainer}>
                <img src={imageUrl} alt="Current Selfie" className={styles.image} />
            </div>
        );
    }
    return <p className={styles.placeholder}>No selfie has been uploaded yet. Be the first!</p>;
  }

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
              <button onClick={handleClear} disabled={!imageUrl || uploading} className={`${styles.btn} ${styles.btnSecondary}`}>
                {uploading ? 'Processing...' : 'Clear Selfie'}
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SelfieGamePage;