'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import styles from './SelfieGameIntro.module.css';
import Link from 'next/link';

const SelfieGameIntroPage = () => {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const router = useRouter();

  const handleStartGame = () => {
    if (tableNumber) {
      router.push(`/selfie-game/play?tableNumber=${tableNumber}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.introCard}>
          <div className={styles.icon}>📸</div>
          <h1 className={styles.title}>The Wedding Selfie Game!</h1>
          
          <div className={styles.rules}>
            <h2 className={styles.rulesTitle}>How to Play</h2>
            <ol className={styles.rulesList}>
              <li>Select your table number below.</li>
              <li>The wedding hosts (admins) will announce a selfie theme.</li>
              <li>Get your table together and take a selfie that best matches the theme.</li>
              <li>Upload your table&apos;s best selfie to the game.</li>
              <li>The winning table gets to eat first!</li>
            </ol>
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
              Start Game
            </button>
          </div>
          <div className={styles.adminLinkContainer}>
            <Link href="/selfie-game/admin" className={styles.btnAdmin}>
              Admin Panel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SelfieGameIntroPage;
