"use client";

import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import styles from "./Slideshow.module.css";

interface Slide {
  src: string;
  title: string;
  description: string;
  width: number;  // Required property
  height: number; // Required property
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
        onChange={handleSlideChange}
      >
        {slides.map((slide, index) => (
          <div key={index} className={styles.carouselImageWrapper}>
            <Image
              src={slide.src}
              alt={slide.title}
              width={slide.width}    // Now properly set
              height={slide.height}  // Now properly set
              quality={80}
              priority={index === 0}
              className={styles.carouselImage}
              sizes="(max-width: 768px) 100vw, 80vw"
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
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