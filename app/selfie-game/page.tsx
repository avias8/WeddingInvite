/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  setDoc,
  writeBatch,
  Timestamp // Import Timestamp type
} from "firebase/firestore";

import app from '../../lib/firebase';
import Header from '../components/Header';
import styles from './SelfieGame.module.css';

// Initialize Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

// Type for a single selfie submission
interface Submission {
  id: string;
  imageUrl: string;
  storagePath: string;
  tableNumber: number;
  timestamp: Timestamp; // Use the specific Firestore Timestamp type instead of any
}

const SelfieGamePage = () => {
  // User states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // App status states
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [liveMessage, setLiveMessage] = useState('');

  // Firestore references
  const submissionsColRef = collection(db, 'selfie-game-submissions');
  const adminMessageDocRef = doc(db, 'selfie-game-admin', 'message');

  // Real-time listener for selfie submissions
  useEffect(() => {
    const q = query(submissionsColRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const submissionsData: Submission[] = [];
      querySnapshot.forEach((doc) => {
        submissionsData.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(submissionsData);
      setLoadingInitial(false);
    }, (err) => {
      console.error("Firestore submissions listener error:", err);
      setError("Could not load selfie feed.");
      setLoadingInitial(false);
    });
    return () => unsubscribe();
  }, [submissionsColRef]); // Added missing dependency

  // Real-time listener for the admin message
  useEffect(() => {
    const unsubscribe = onSnapshot(adminMessageDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLiveMessage(docSnap.data().text);
      } else {
        setLiveMessage('');
      }
    }, (err) => {
      console.error("Firestore admin message listener error:", err);
    });
    return () => unsubscribe();
  }, [adminMessageDocRef]); // Added missing dependency

  // Check for admin auth state in session storage
  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAdminAuthenticated");
    if (authStatus === "true") {
      setIsAdmin(true);
    }
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
    if (!selectedFile) {
        setError("Please select a selfie to upload.");
        return;
    }
    if (!tableNumber) {
        setError("Please select your table number.");
        return;
    }

    setUploading(true);
    setError(null);
    
    const uniqueFileName = `${Date.now()}-${selectedFile.name}`;
    const imageRef = ref(storage, `selfie-game-submissions/${uniqueFileName}`);

    try {
      await uploadBytes(imageRef, selectedFile);
      const url = await getDownloadURL(imageRef);
      
      await addDoc(submissionsColRef, {
        imageUrl: url,
        storagePath: imageRef.fullPath,
        tableNumber: tableNumber,
        timestamp: serverTimestamp()
      });

      setSelectedFile(null);
      // Let the success message appear briefly
      setError(null);

    } catch(err) {
      console.error("Upload failed:", err)
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      // Logic copied from ManagementLayout
      const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "yosdfedbar";
      if (adminPassword === correctPassword) {
          sessionStorage.setItem("isAdminAuthenticated", "true");
          setIsAdmin(true);
          setShowAdminLogin(false);
          setAdminPassword('');
      } else {
          setError("Admin login failed. Incorrect password.");
      }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    setIsAdmin(false);
  }

  const handleDelete = async (submission: Submission) => {
    if (!isAdmin) {
        setError("You must be an admin to delete selfies.");
        return;
    }
    if (!window.confirm(`Are you sure you want to delete the selfie from Table ${submission.tableNumber}?`)) return;

    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, 'selfie-game-submissions', submission.id));
      // Delete the file from Storage
      const imageToDeleteRef = ref(storage, submission.storagePath);
      await deleteObject(imageToDeleteRef);
    } catch (err) {
        console.error("Delete failed:", err);
        setError("Failed to delete the selfie.");
    }
  };

  const handleClearAllSubmissions = async () => {
    if (!isAdmin) {
      setError("You must be an admin to clear all submissions.");
      return;
    }
    if (!window.confirm("ARE YOU SURE you want to delete ALL selfies? This action cannot be undone.")) return;
    
    setUploading(true); // Reuse uploading state for visual feedback
    setError(null);

    const submissionsToDelete = [...submissions]; // Create a copy of the current submissions

    try {
        // Delete files from Storage in parallel
        const storageDeletePromises = submissionsToDelete.map(sub => {
            const imageRef = ref(storage, sub.storagePath);
            return deleteObject(imageRef).catch(err => {
                // Log error but don't stop the process if a file doesn't exist
                console.warn(`Could not delete file ${sub.storagePath}:`, err);
            });
        });

        // Delete documents from Firestore using a batch write
        const batch = writeBatch(db);
        submissionsToDelete.forEach(sub => {
            const docRef = doc(db, 'selfie-game-submissions', sub.id);
            batch.delete(docRef);
        });
        
        await Promise.all(storageDeletePromises); // Wait for storage deletions
        await batch.commit(); // Commit the batch deletion from Firestore

    } catch (err) {
        console.error("Failed to clear all submissions:", err);
        setError("An error occurred while clearing submissions. Some items may remain.");
    } finally {
        setUploading(false);
    }
  };

  const handleSetMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
        await setDoc(adminMessageDocRef, { text: adminMessage });
        setAdminMessage(''); // Clear input after setting
    } catch {
        setError("Failed to set the message.")
    }
  }

  const renderContent = () => {
    if (loadingInitial) {
        return <p className={styles.placeholder}>Loading the Selfie Game...</p>;
    }
    if (submissions.length === 0) {
        return <p className={styles.placeholder}>No selfies have been uploaded yet. Be the first!</p>;
    }
    return (
        <div className={styles.submissionsGrid}>
            {submissions.map(sub => (
                <div key={sub.id} className={styles.submissionCard}>
                    <img src={sub.imageUrl} alt={`Selfie from Table ${sub.tableNumber}`} className={styles.image} />
                    <div className={styles.cardOverlay}>
                        <p>Table {sub.tableNumber}</p>
                        {isAdmin && (
                            <button onClick={() => handleDelete(sub)} className={styles.deleteBtn}>
                                &times;
                            </button>
                        )}
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
                <p>📣 {liveMessage}</p>
            </div>
        )}
        <div className={styles.bannerContainer}>
          <h1 className={styles.sectionHeading}>Wedding Selfie Game</h1>
          <p className={styles.instructions}>
            It&apos;s a race to get your table&apos;s selfie on the board! Select your table number, snap a pic, and upload it to join the fun.
          </p>
        </div>

        <div className={styles.controlsContainer}>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.controls}>
                <select 
                    className={styles.tableSelector} 
                    onChange={(e) => setTableNumber(parseInt(e.target.value))}
                    value={tableNumber || ""}
                    aria-label="Select your table number"
                >
                    <option value="" disabled>Select Table #</option>
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>Table {n}</option>
                    ))}
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

        <div className={styles.adminSection}>
            {!isAdmin ? (
                <button onClick={() => setShowAdminLogin(!showAdminLogin)} className={styles.adminToggle}>Admin Login</button>
            ) : (
                <button onClick={handleAdminLogout} className={styles.adminToggle}>Admin Logout</button>
            )}

            {showAdminLogin && !isAdmin && (
                <form onSubmit={handleAdminLogin} className={styles.adminForm}>
                    <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Password" required />
                    <button type="submit" className={styles.btn}>Login</button>
                </form>
            )}

            {isAdmin && (
                <>
                    <form onSubmit={handleSetMessage} className={styles.adminForm}>
                        <input type="text" value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="Set a live message for all guests" />
                        <button type="submit" className={styles.btn}>Set Message</button>
                    </form>
                    <button onClick={handleClearAllSubmissions} disabled={uploading || submissions.length === 0} className={`${styles.btn} ${styles.btnDanger}`}>
                        {uploading ? 'Clearing...' : 'Clear All Submissions'}
                    </button>
                </>
            )}
        </div>
      </main>
    </div>
  );
};

export default SelfieGamePage;
