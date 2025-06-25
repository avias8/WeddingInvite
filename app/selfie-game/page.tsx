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

  // **MODIFIED: Set up a real-time listener **
  useEffect(() => {
    // onSnapshot listens for real-time updates to the document.
    const unsubscribe = onSnapshot(selfieDocRef, (docSnap) => {
      if (docSnap.exists()) {
        // If the document exists, get the url from its data.
        const data = docSnap.data();
        setImageUrl(data.url); // Set the image URL from the document
      } else {
        // If the document doesn't exist, it means no selfie has been set.
        setImageUrl(null);
      }
      setLoadingInitial(false); // Finished initial load
    }, (err) => {
      console.error("Firestore listener error:", err);
      setError("Could not connect to the selfie game.");
      setLoadingInitial(false);
    });

    // Clean up the listener when the component unmounts.
    return () => unsubscribe();
  }, [selfieDocRef]); // The dependency array ensures this effect runs only once.

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
  };

  // **MODIFIED: Update Firestore after upload **
  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      // 1. Upload the file to Storage
      await uploadBytes(imageRef, selectedFile);
      // 2. Get the new download URL
      const url = await getDownloadURL(imageRef);
      // 3. Update the Firestore document with the new URL
      await setDoc(selfieDocRef, { url: url });
      // The `onSnapshot` listener will automatically update the imageUrl state now.
      setSelectedFile(null);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // **MODIFIED: Update Firestore after clearing **
  const handleClear = async () => {
    setError(null);
    setUploading(true); // Use uploading state to disable button
    try {
      // 1. Delete the object from Storage
      await deleteObject(imageRef);
      // 2. Update the Firestore document to remove the URL
      await setDoc(selfieDocRef, { url: null });
      // The `onSnapshot` listener will automatically update the imageUrl state to null.
    } catch (err: any) {
      // If the file doesn't exist in storage, that's okay, still clear the doc
      if (err.code === 'storage/object-not-found') {
        await setDoc(selfieDocRef, { url: null });
      } else {
        setError("Failed to clear the selfie.");
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