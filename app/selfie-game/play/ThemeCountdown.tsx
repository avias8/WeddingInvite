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

  const getCountdownText = () => {
    if (count > 0) return count;
    return 'Go!';
  };

  return (
    <div className={styles.countdownOverlay}>
      <div className={styles.content}>
        <p className={styles.themeLabel}>New Theme:</p>
        <h1 className={styles.themeText}>{theme}</h1>
        <div className={styles.countdownCircle}>
          <span className={styles.countdownNumber}>{getCountdownText()}</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeCountdown;
