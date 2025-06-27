/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import app from '../../../lib/firebase';
import Header from '../../components/Header';
import styles from './SelfieGamePlay.module.css';
import Link from 'next/link';

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

// TypeScript interface for a single submission
interface Submission {
  id: string;
  imageUrl: string;
  storagePath: string;
  tableNumber: number;
  timestamp: Timestamp;
}

// TypeScript interface for the winner data
interface Winner {
    submissionId: string;
    imageUrl: string;
    tableNumber: number;
}

const SelfieGamePlayPage = () => {
  // Component state management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [liveMessage, setLiveMessage] = useState('');
  const [winner, setWinner] = useState<Winner | null>(null);

  // Set up a real-time listener for selfie submissions.
  // This hook ensures that as soon as a new selfie is added to the database,
  // it appears on everyone's screen instantly.
  useEffect(() => {
    const submissionsColRef = collection(db, 'selfie-game-submissions');
    const q = query(submissionsColRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const submissionsData: Submission[] = [];
      querySnapshot.forEach((doc) => {
        submissionsData.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(submissionsData);
      setLoadingInitial(false);
    });
    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Set up a real-time listener for the admin's live message/theme.
  // This will update the theme banner instantly for all players.
  useEffect(() => {
    const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');
    const unsubscribe = onSnapshot(adminMessageDocRef, (docSnap) => {
      const messageText = docSnap.exists() ? docSnap.data().text : '';
      setLiveMessage(messageText);
    }, (error) => {
      console.error("Error listening to admin message:", error);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Set up a real-time listener to see if a winner has been declared.
  useEffect(() => {
    const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');
    const unsubscribe = onSnapshot(winnerDocRef, (docSnap) => {
        setWinner(docSnap.exists() ? docSnap.data() as Winner : null);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("File is too large! Please select a selfie under 5MB.");
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
        setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tableNumber) {
        setError("Please select a selfie and your table number.");
        return;
    }
    setUploading(true);
    setError(null);
    const uniqueFileName = `${Date.now()}-${selectedFile.name}`;
    const imageRef = ref(storage, `selfie-game-submissions/${uniqueFileName}`);
    try {
      // Upload file to Cloud Storage
      await uploadBytes(imageRef, selectedFile);
      const url = await getDownloadURL(imageRef);
      
      // Add a new document to the Firestore collection
      const submissionsColRef = collection(db, 'selfie-game-submissions');
      await addDoc(submissionsColRef, {
        imageUrl: url,
        storagePath: imageRef.fullPath,
        tableNumber: tableNumber,
        timestamp: serverTimestamp()
      });
      setSelectedFile(null);
    } catch(err) {
      console.error("Upload failed:", err)
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Helper function to render the main content area
  const renderContent = () => {
    if (loadingInitial) return <p className={styles.placeholder}>Loading Selfies...</p>;
    if (submissions.length === 0) return <p className={styles.placeholder}>No selfies yet. Be the first!</p>;
    
    return (
        <div className={styles.submissionsGrid}>
            {submissions.map(sub => (
                <div key={sub.id} className={`${styles.submissionCard} ${winner?.submissionId === sub.id ? styles.winnerCard : ''}`}>
                    {winner?.submissionId === sub.id && <div className={styles.winnerBadge}>🏆 Winner!</div>}
                    <img src={sub.imageUrl} alt={`Selfie from Table ${sub.tableNumber}`} className={styles.image} />
                    <div className={styles.cardOverlay}>
                        <p>Table {sub.tableNumber}</p>
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        {liveMessage && (
            <div className={styles.liveMessageBanner}>
                <p>📣 Theme: &quot;{liveMessage}&quot;</p>
            </div>
        )}
        <div className={styles.controlsContainer}>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.controls}>
                <select className={styles.tableSelector} onChange={(e) => setTableNumber(parseInt(e.target.value))} value={tableNumber || ""} aria-label="Select your table number">
                    <option value="" disabled>Select Table #</option>
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>Table {n}</option>))}
                </select>
                <input type="file" id="file-input" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                <label htmlFor="file-input" className={styles.fileInputLabel}>
                    {selectedFile ? `Selected: ${selectedFile.name.substring(0, 15)}...` : 'Choose Selfie'}
                </label>
                <button onClick={handleUpload} disabled={uploading || !selectedFile || !tableNumber} className={`${styles.btn} ${styles.btnPrimary}`}>
                    {uploading ? 'Uploading...' : 'Upload Selfie'}
                </button>
            </div>
        </div>
        
        {renderContent()}

        <footer className={styles.footer}>
            <Link href="/selfie-game/admin" className={styles.adminLink}>
                Admin Panel
            </Link>
        </footer>
      </main>
    </div>
  );
};

export default SelfieGamePlayPage;
