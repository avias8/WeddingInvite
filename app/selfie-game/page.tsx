'use client';

import React from 'react';
import Header from '../components/Header';
import styles from './SelfieGameIntro.module.css';
import Link from 'next/link';

const SelfieGameIntroPage = () => {
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
              <li>The wedding hosts (admins) will announce a selfie theme.</li>
              <li>Get your table together and take a selfie that best matches the theme.</li>
              <li>Upload your table's best selfie to the game.</li>
              <li>The winning table gets to eat first!</li>
            </ol>
          </div>

          <div className={styles.navigation}>
            <Link href="/selfie-game/play" className={`${styles.btn} ${styles.btnPlay}`}>
              Play the Game
            </Link>
            <Link href="/selfie-game/admin" className={`${styles.btn} ${styles.btnAdmin}`}>
              Admin Panel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SelfieGameIntroPage;
