'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import styles from './SelfieGameLanding.module.css';

// A selection of photos for the background collage to add visual interest.
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

/**
 * The landing page for the Selfie Game, introducing the rules and theme.
 */
const SelfieGameIntroPage = () => {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const router = useRouter();

  /**
   * Navigates the user to the play page with their selected table number.
   */
  const handleStartGame = () => {
    if (tableNumber) {
      router.push(`/selfie-game/play?tableNumber=${tableNumber}`);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Background collage of photos */}
      <div className={styles.photoCollage}>
        {selectedPhotos.map((photo, index) => (
          <Image
            key={index}
            src={photo}
            alt={`Collage photo ${index + 1}`}
            width={200}
            height={200}
            className={styles.collageImage}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        ))}
      </div>
      <Header />
      <main className={styles.contentOverlay}>
        <div className={styles.introCard}>
          {/* Game Title */}
          <h1 className={styles.title}>The Wedding Hunger Games</h1>
          
          {/* Game Description */}
          <p className={styles.subtitle}>
            This is a competition to determine who gets to eat first at the wedding. 
            Guests will compete to submit selfies matching the theme chosen by the MCs. 
            The table that wins the round gets to go eat from the buffet!
          </p>

          {/* Cute themed image for the Hunger Games */}
          <div className={styles.hungerGamesImageWrapper}>
            <Image
              src="https://storage.googleapis.com/my-wedding-assets/FoodHungerGames.png"
              alt="Wedding Hunger Games"
              width={180}
              height={180}
              className={styles.hungerGamesImage}
              priority
            />
          </div>
          
          {/* Simple, clear rules for the game */}
          <div className={styles.rules}>
            <h2 className={styles.rulesTitle}>How to Play:</h2>
            <ul className={styles.rulesList}>
              <li><span className={styles.icon}>1️⃣</span>Select your table number from the list.</li>
              <li><span className={styles.icon}>🤔</span>Wait for the MC to announce the secret selfie theme.</li>
              <li><span className={styles.icon}>📸</span>Work with your table to take the perfect selfie.</li>
              <li><span className={styles.icon}>⬆️</span>Upload your table&apos;s masterpiece to the game.</li>
              <li><span className={styles.icon}>🏆</span>If the MCs pick your photo, your table eats first!</li>
            </ul>
          </div>

          {/* User interaction controls */}
          <div className={styles.navigation}>
            <select 
              className={styles.tableSelector} 
              onChange={(e) => setTableNumber(parseInt(e.target.value))} 
              value={tableNumber || ""} 
              aria-label="Select your table number"
            >
              <option value="" disabled>Select Your Table #</option>
              {/* Generate options for tables 1 through 24 */}
              {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>Table {n}</option>))}
            </select>
            <button 
              onClick={handleStartGame} 
              disabled={!tableNumber} 
              className={`${styles.btn} ${styles.btnPlay}`}
            >
              Let the Games Begin!
            </button>
          </div>

          {/* Link for the game host/admin */}
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
