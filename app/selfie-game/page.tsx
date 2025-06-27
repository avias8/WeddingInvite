'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import styles from './SelfieGameLanding.module.css';

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

const SelfieGameIntroPage = () => {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const router = useRouter();

  const handleStartGame = () => {
    if (tableNumber) {
      router.push(`/selfie-game/play?tableNumber=${tableNumber}`);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.photoCollage}>
        {selectedPhotos.map((photo, index) => (
          <Image
            key={index}
            src={photo}
            alt={`Collage photo ${index + 1}`}
            width={200}
            height={200}
            className={styles.collageImage}
          />
        ))}
      </div>
      <Header />
      <main className={styles.contentOverlay}>
        <div className={styles.introCard}>
          <h1 className={styles.title}>The Wedding Selfie Game</h1>
          <p className={styles.subtitle}>Ready to capture some memories? Follow the steps below to join the fun!</p>
          
          <div className={styles.rules}>
            <ul className={styles.rulesList}>
              <li><span className={styles.icon}>1️⃣</span>Select your table number.</li>
              <li><span className={styles.icon}>📸</span>Snap a selfie based on the host&apos;s theme.</li>
              <li><span className={styles.icon}>⬆️</span>Upload your table&apos;s masterpiece.</li>
              <li><span className={styles.icon}>🏆</span>Win bragging rights (and maybe a prize!).</li>
            </ul>
          </div>

          <div className={styles.navigation}>
            <select 
              className={styles.tableSelector} 
              onChange={(e) => setTableNumber(parseInt(e.target.value))} 
              value={tableNumber || ""} 
              aria-label="Select your table number"
            >
              <option value="" disabled>Select Your Table #</option>
              {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>Table {n}</option>))}
            </select>
            <button 
              onClick={handleStartGame} 
              disabled={!tableNumber} 
              className={`${styles.btn} ${styles.btnPlay}`}
            >
              Let&apos;s Play!
            </button>
          </div>

          <div className={styles.adminLinkContainer}>
            <Link href="/selfie-game/admin" className={styles.btnAdmin}>
              Host Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SelfieGameIntroPage;
