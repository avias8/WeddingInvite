"use client";

import React from "react";
import "./Timeline.css";

interface TimelineItem {
  time: string;
  title: string;
}

interface TimelineDay {
  date: string;
  location: string; // Moved location to the day level
  events: TimelineItem[];
}

interface TimelineProps {
  title: string;
  days: TimelineDay[];
}

const Timeline: React.FC<TimelineProps> = ({ title, days }) => {
  return (
    <div>
      <h1 className="timeline-covertitle">{title}</h1>
      {days.map((day, index) => (
        <div key={index} className="timeline-day">
          <h2 className="timeline-date">
    {day.date} <span className="timeline-location">| {day.location}</span>
</h2>

          <div className="timeline-events">
            {day.events.map((event, eventIndex) => (
              <div key={eventIndex} className="timeline-event">
                <div className="timeline-time">{event.time}</div>
                <div className="timeline-details">
                  <span className="timeline-title">{event.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
