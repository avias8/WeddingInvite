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
  writeBatch,
  Timestamp
} from "firebase/firestore";

import app from '../../../lib/firebase';
import Header from '../../components/Header';
import styles from './SelfieGameAdmin.module.css';
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

const SelfieGameAdminPage = () => {
  // Component State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const [winner, setWinner] = useState<{submissionId: string} | null>(null);

  // Firestore References
  const submissionsColRef = collection(db, 'selfie-game-submissions');
  const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');
  const winnerDocRef = doc(db, 'selfie-game-admin', 'winner');

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
    const q = query(submissionsColRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
      setSubmissions(subs);
    }, (err) => {
        console.error("Submission listener error:", err);
        setError("Could not connect to the submissions feed.");
    });
    return () => unsubscribe();
  }, [isAdmin, submissionsColRef]);

  // Real-time listener for the admin message/theme
  useEffect(() => {
    const unsubscribe = onSnapshot(adminMessageDocRef, (docSnap) => {
      setLiveMessage(docSnap.exists() ? docSnap.data().text : 'N/A');
    });
    return () => unsubscribe();
  }, [adminMessageDocRef]);

  // Real-time listener for the winner document
  useEffect(() => {
    const unsubscribe = onSnapshot(winnerDocRef, (docSnap) => {
        setWinner(docSnap.exists() ? docSnap.data() as {submissionId: string} : null);
    });
    return () => unsubscribe();
  }, [winnerDocRef]);

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
    await setDoc(winnerDocRef, { 
        submissionId: submission.id,
        imageUrl: submission.imageUrl,
        tableNumber: submission.tableNumber
    });
  };

  // Function to clear the current winner
  const handleClearWinner = async () => {
    if (!window.confirm('Are you sure you want to clear the current winner?')) return;
    await deleteDoc(winnerDocRef);
  }

  // Function to clear all submissions
  const handleClearAllSubmissions = async () => {
    if (!window.confirm("ARE YOU SURE you want to delete ALL selfies?")) return;
    setProcessing(true);
    const batch = writeBatch(db);
    const deletePromises = submissions.map(sub => {
      batch.delete(doc(db, 'selfie-game-submissions', sub.id));
      return deleteObject(ref(storage, sub.storagePath)).catch(err => console.warn("Could not delete file:", err));
    });
    await Promise.all(deletePromises);
    await batch.commit();
    await deleteDoc(winnerDocRef); // Also clear the winner
    setProcessing(false);
  };

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

        <div className={styles.adminCard}>
            <h3>Set Live Theme/Message</h3>
            <p>Current Theme: <strong>{liveMessage}</strong></p>
            <form onSubmit={handleSetMessage} className={styles.adminForm}>
                <input type="text" value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="e.g., Best Group Pose!" />
                <button type="submit" className={styles.btn}>Set Theme</button>
            </form>
        </div>

        <div className={styles.adminCard}>
            <h3>Manage Submissions</h3>
            <p>{submissions.length} total selfies submitted.</p>
            {winner && <p>Current Winner: <strong>Table {submissions.find(s => s.id === winner.submissionId)?.tableNumber}</strong></p>}
            <div className={styles.dangerZone}>
                {winner && <button onClick={handleClearWinner} className={`${styles.btn} ${styles.btnWarning}`}>Clear Winner</button>}
                <button onClick={handleClearAllSubmissions} disabled={processing || submissions.length === 0} className={`${styles.btn} ${styles.btnDanger}`}>
                    {processing ? 'Clearing...' : 'Clear All Submissions'}
                </button>
            </div>
        </div>

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
