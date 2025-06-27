/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  doc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  writeBatch
} from "firebase/firestore";

import app from '../../../lib/firebase';
import Header from '../../components/Header';
import styles from './SelfieGameAdmin.module.css';
import Link from 'next/link';

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

import { Submission, Winner } from '../types';

import SelfieGameControls from './SelfieGameControls';

const SelfieGameAdminPage = () => {
  // Component State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const [winner, setWinner] = useState<Winner | null>(null);

  // Check for admin auth status on initial load
  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAdminAuthenticated");
    if (authStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  // Real-time listener for selfie submissions
  // This updates the admin view instantly when guests upload photos.
  useEffect(() => {
    if (!isAdmin) return; // Only listen if authenticated as admin

    const submissionsColRef = collection(db, 'selfie-game-submissions');
    const q = query(submissionsColRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(subs);
    }, (err) => {
        console.error("Submission listener error:", err);
        setError("Could not connect to the submissions feed.");
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Real-time listener for the admin message/theme
  useEffect(() => {
    const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');
    const unsubscribe = onSnapshot(adminMessageDocRef, (docSnap) => {
      setLiveMessage(docSnap.exists() ? docSnap.data().text : 'N/A');
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for the winner document
  useEffect(() => {
    const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');
    const unsubscribe = onSnapshot(winnerDocRef, (docSnap) => {
        setWinner(docSnap.exists() ? docSnap.data() as Winner : null);
    });
    return () => unsubscribe();
  }, []);

  // Admin login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "yosdfedbar";
    if (adminPassword === correctPassword) {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      setIsAdmin(true);
      setError('');
      setAdminPassword('');
    } else {
      setError("Incorrect password.");
    }
  };

  // Admin logout handler
  const handleAdminLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    setIsAdmin(false);
  };

  // Function to set the live theme/message
  const handleSetMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');
      await setDoc(adminMessageDocRef, { text: adminMessage });
      setAdminMessage('');
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error setting message:", err);
      setError("Failed to set message. Please try again.");
    }
  };
  
  // Function to declare a winner
  const handleDeclareWinner = async (submission: Submission) => {
    if (!window.confirm(`Declare Table ${submission.tableNumber} the winner?`)) return;
    const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');
    await setDoc(winnerDocRef, { 
        submissionId: submission.id,
        imageUrl: submission.imageUrl,
        tableNumber: submission.tableNumber,
        theme: liveMessage,
    });
  };

  const handleClearWinner = async () => {
    if (!window.confirm('Are you sure you want to clear the current winner?')) return;
    const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');
    await deleteDoc(winnerDocRef);
  }

  const handleClearGame = async (clearMessage: boolean = false) => {
    const confirmationMessage = clearMessage
      ? "Are you sure you want to start the next round? This will clear the theme, all submissions, and the winner."
      : "ARE YOU SURE you want to delete ALL selfies and the winner?";
    if (!window.confirm(confirmationMessage)) return;

    setProcessing(true);
    try {
      // Clear submissions
      const batch = writeBatch(db);
      submissions.forEach(sub => {
        batch.delete(doc(db, 'selfie-game-submissions', sub.id));
        deleteObject(ref(storage, sub.storagePath)).catch(err => console.warn("Could not delete file:", err));
      });
      await batch.commit();

      // Clear winner
      const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');
      await deleteDoc(winnerDocRef);

      // Optionally clear theme message
      if (clearMessage) {
        const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');
        await setDoc(adminMessageDocRef, { text: '' });
      }
    } catch (err) {
      console.error("Error clearing game state:", err);
      setError("Failed to clear game state. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Function to clear all submissions
  const handleClearAllSubmissions = () => handleClearGame(false);

  // Function to prepare for the next theme
  const handleNextTheme = () => handleClearGame(true);

  // Render the login form if not authenticated
  if (!isAdmin) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleAdminLogin} className={styles.loginForm}>
          <h2>Admin Access</h2>
          <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Password" required />
          <button type="submit" className={styles.btn}>Login</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    );
  }

  // Render the full admin panel if authenticated
  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.header}>
            <h1>Admin Panel</h1>
            <button onClick={handleAdminLogout} className={styles.adminToggle}>Logout</button>
        </div>

        <div className={styles.adminLayout}>
          <SelfieGameControls
            liveMessage={liveMessage}
            adminMessage={adminMessage}
            setAdminMessage={setAdminMessage}
            handleSetMessage={handleSetMessage}
            winner={winner}
            handleClearWinner={handleClearWinner}
            handleClearAllSubmissions={handleClearAllSubmissions}
            handleNextTheme={handleNextTheme}
            processing={processing}
            submissionsCount={submissions.length}
          />

          <div className={styles.submissionsGrid}>
              {submissions.map(sub => (
                  <div key={sub.id} className={`${styles.submissionCard} ${winner?.submissionId === sub.id ? styles.winnerCard : ''}`}>
                      <img src={sub.imageUrl} alt={`Selfie from Table ${sub.tableNumber}`} className={styles.image} />
                      <div className={styles.cardOverlay}>
                          <p>Table {sub.tableNumber}</p>
                          <button onClick={() => handleDeclareWinner(sub)} className={styles.winnerBtn} disabled={winner?.submissionId === sub.id}>
                            🏆
                          </button>
                      </div>
                  </div>
              ))}
          </div>
        </div>
        <footer className={styles.footer}>
            <Link href="/selfie-game/play" className={styles.gameLink}>
                View Guest Page
            </Link>
        </footer>
      </main>
    </div>
  );
};

export default SelfieGameAdminPage;
