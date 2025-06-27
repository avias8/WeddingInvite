'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp
} from "firebase/firestore";
import Image from 'next/image';

import app from '../../../lib/firebase';
import Header from '../../components/Header';
import styles from './SelfieGamePlay.module.css';
import landingStyles from '../SelfieGameLanding.module.css'; // Import landing page styles
import ThemeCountdown from './ThemeCountdown';
import Lobby from './Lobby';
import Link from 'next/link';

import SubmissionsGrid from './SubmissionsGrid';
import { Submission, Winner } from '../types';

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

const selectedPhotos = [
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(16).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(17).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(18).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(19).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(20).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(21).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(22).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(23).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(24).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(25).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(26).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(27).JPEG",
];

const SelfieGamePlayContent = () => {
  const searchParams = useSearchParams();
  const tableNumFromQuery = searchParams.get('tableNumber');

  // Component state management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [liveMessage, setLiveMessage] = useState('');
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (tableNumFromQuery) {
      const num = parseInt(tableNumFromQuery);
      if (!isNaN(num)) {
        setTableNumber(num);
      }
    }
  }, [tableNumFromQuery]);

  // Set up a real-time listener for selfie submissions.
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
    return () => unsubscribe();
  }, []);

  // Set up a real-time listener for the admin's live message/theme.
  useEffect(() => {
    const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');
    const unsubscribe = onSnapshot(adminMessageDocRef, (docSnap) => {
      const newMessage = docSnap.exists() ? docSnap.data().text : '';
      if (newMessage && newMessage !== liveMessage) {
        setLiveMessage(newMessage);
        setShowCountdown(true);
      } else if (!newMessage) {
        setLiveMessage('');
      }
    }, (error) => {
      console.error("Error listening to admin message:", error);
    });
    return () => unsubscribe();
  }, [liveMessage]);
  
  // Set up a real-time listener to see if a winner has been declared.
  useEffect(() => {
    const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');
    const unsubscribe = onSnapshot(winnerDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setWinner(docSnap.data() as Winner);
        } else {
            setWinner(null);
        }
    });
    return () => unsubscribe();
  }, []);

  const showLobby = loadingInitial || !liveMessage || !!winner;

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
      await uploadBytes(imageRef, selectedFile);
      const url = await getDownloadURL(imageRef);
      
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

  const renderContent = () => {
    if (showLobby) {
        let message = "Waiting for the next theme...";
        if (loadingInitial) message = "Loading the game...";
        if (winner) message = `Table ${winner.tableNumber} won!`;
        return <Lobby message={message} winnerImage={winner?.imageUrl} theme={winner?.theme} />;
    }
    
    return <SubmissionsGrid submissions={submissions} winner={winner} />;
  }

  return (
    <div className={landingStyles.pageWrapper}>
      <div className={landingStyles.photoCollage}>
        {selectedPhotos.map((photo, index) => (
          <Image
            key={index}
            src={photo}
            alt={`Collage photo ${index + 1}`}
            width={200}
            height={200}
            className={landingStyles.collageImage}
          />
        ))}
      </div>
      {showCountdown && <ThemeCountdown theme={liveMessage} onComplete={() => setShowCountdown(false)} />}
      <Header />
      <main className={landingStyles.contentOverlay}>
        {liveMessage && !winner && (
            <div className={styles.liveMessageBanner}>
                <span>📣</span>
                <span>Theme: &quot;{liveMessage}&quot;</span>
            </div>
        )}
        <div className={`${styles.controlsContainer} ${showLobby ? styles.hidden : ''}`}>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.controls}>
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

const SelfieGamePlayPage = () => (
  <Suspense fallback={<div className={landingStyles.pageWrapper}><Lobby message="Loading the game..." /></div>}>
    <SelfieGamePlayContent />
  </Suspense>
);

export default SelfieGamePlayPage;

