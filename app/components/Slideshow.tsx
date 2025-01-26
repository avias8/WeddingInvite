"use client";

import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import default styles
import styles from "./Slideshow.module.css";

interface Slide {
  src: string;
  title: string;
  description: string;
}

interface SlideshowProps {
  slides: Slide[];
}

export default function Slideshow({ slides }: SlideshowProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index);
  };

  return (
    <div className={styles.slideshowContainer}>
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop={true}
        emulateTouch={true}
        autoPlay={true}
        interval={5000}
        transitionTime={800}
        onChange={handleSlideChange} // Track slide change
      >
        {slides.map((slide, index) => (
          <div key={index} className={styles.carouselImageWrapper}>
            <img src={slide.src} alt={slide.title} />
          </div>
        ))}
      </Carousel>
      <div className={styles.carouselCaptionContainer}>
        <h2>{slides[currentSlideIndex].title}</h2>
        <p>{slides[currentSlideIndex].description}</p>
      </div>
    </div>
  );
}
