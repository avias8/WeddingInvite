"use client";

import React from "react";
import styles from "./TeaserSchedule.module.css";

interface ScheduleItem {
  time: string;
  description: string;
}

interface TeaserScheduleProps {
  /** The top heading text. E.g. "Here’s a sneak peek of our special day's schedule" */
  heading: string;
  /** Each time block in the schedule */
  scheduleItems: ScheduleItem[];
  /** Optional subtext or note at the bottom, e.g. "The dancing & reception starts after!" */
  footnote?: string;
}

export default function TeaserSchedule({
  heading,
  scheduleItems,
  footnote,
}: TeaserScheduleProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.scheduleList}>
        {scheduleItems.map((item, idx) => (
          <li key={idx} className={styles.scheduleItem}>
            <div className={styles.time}>{item.time}</div>
            <div className={styles.description}>{item.description}</div>
          </li>
        ))}
      </ul>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </div>
  );
}
