import React, { useState, useEffect } from 'react';
import styles from './ThemeCountdown.module.css';

interface ThemeCountdownProps {
  theme: string;
  onComplete: () => void;
}

const ThemeCountdown: React.FC<ThemeCountdownProps> = ({ theme, onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const completeTimer = setTimeout(onComplete, 1000); // Hold on "Go!" for a second
      return () => clearTimeout(completeTimer);
    }
  }, [count, onComplete]);

  const renderCountdown = () => {
    if (count > 0) {
      return <span className={styles.countdownNumber}>{count}</span>;
    }
    return <span className={styles.goText}>Go!</span>;
  };

  return (
    <div className={styles.countdownOverlay}>
      <div className={styles.content}>
        <p className={styles.themeLabel}>Get Ready For...</p>
        <h1 className={styles.themeText}>{theme}</h1>
        {renderCountdown()}
      </div>
    </div>
  );
};

export default ThemeCountdown;
