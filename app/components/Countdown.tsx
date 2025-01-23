"use client";

import React, { useState, useEffect } from "react";
import styles from "./Countdown.module.css";

interface CountdownProps {
  /** The target date/time to count down to (ISO string or date-like) */
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // parse target date from string
    const endDate = new Date(targetDate).getTime();

    // define a function that updates the time left
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        // if date is in the past, clear interval
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // calculate time components
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    // call updateCountdown immediately
    updateCountdown();

    // set interval to update every second
    const timer = setInterval(updateCountdown, 1000);

    // cleanup on unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={styles.countdownContainer}>
      <h2 className={styles.title}>Let the countdown begin!</h2>
      <div className={styles.timeRow}>
        <div className={styles.timeBox}>
          <span className={styles.timeValue}>{timeLeft.days}</span>
          <span className={styles.label}>Days</span>
        </div>
        <div className={styles.timeBox}>
          <span className={styles.timeValue}>{timeLeft.hours}</span>
          <span className={styles.label}>Hours</span>
        </div>
        <div className={styles.timeBox}>
          <span className={styles.timeValue}>{timeLeft.minutes}</span>
          <span className={styles.label}>Mins</span>
        </div>
        <div className={styles.timeBox}>
          <span className={styles.timeValue}>{timeLeft.seconds}</span>
          <span className={styles.label}>Secs</span>
        </div>
      </div>
    </div>
  );
}
