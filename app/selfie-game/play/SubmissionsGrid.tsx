'use client';
import React from 'react';
import styles from './SelfieGamePlay.module.css';
import { Submission, Winner } from '../types';

interface SubmissionsGridProps {
  submissions: Submission[];
  winner: Winner | null;
}

const SubmissionsGrid: React.FC<SubmissionsGridProps> = ({ submissions, winner }) => {
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
};

export default SubmissionsGrid;
