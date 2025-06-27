'use client';
import React from 'react';
import styles from './SelfieGameControls.module.css';

interface SelfieGameControlsProps {
  liveMessage: string;
  adminMessage: string;
  setAdminMessage: (value: string) => void;
  handleSetMessage: (e: React.FormEvent) => void;
  winner: { submissionId: string } | null;
  handleClearWinner: () => void;
  handleClearAllSubmissions: () => void;
  handleNextTheme: () => void;
  processing: boolean;
  submissionsCount: number;
}

const SelfieGameControls: React.FC<SelfieGameControlsProps> = ({
  liveMessage,
  adminMessage,
  setAdminMessage,
  handleSetMessage,
  winner,
  handleClearWinner,
  handleClearAllSubmissions,
  handleNextTheme,
  processing,
  submissionsCount,
}) => {
  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlCard}>
        <h3>Set Live Theme</h3>
        <p>Current Theme: <strong>{liveMessage}</strong></p>
        <form onSubmit={handleSetMessage} className={styles.form}>
          <input
            type="text"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            placeholder="e.g., Best Group Pose!"
            className={styles.input}
          />
          <button type="submit" className={styles.btn}>Set Theme</button>
        </form>
      </div>

      <div className={styles.controlCard}>
        <h3>Manage Game</h3>
        <div className={styles.dangerZone}>
          <button onClick={handleNextTheme} className={`${styles.btn} ${styles.btnPrimary}`}>
            Next Theme
          </button>
          {winner && (
            <button onClick={handleClearWinner} className={`${styles.btn} ${styles.btnWarning}`}>
              Clear Winner
            </button>
          )}
          <button
            onClick={handleClearAllSubmissions}
            disabled={processing || submissionsCount === 0}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            {processing ? 'Clearing...' : 'Clear All Submissions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelfieGameControls;
