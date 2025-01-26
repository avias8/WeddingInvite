"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./DressCode.module.css";
import ColorPicker from "./ColorPicker";

const swatchColors = [
  { hex: "#A52A2A", name: "Deep Red" },
  { hex: "#FF8C00", name: "Marigold Orange" },
  { hex: "#E0115F", name: "Rani Pink" },
  { hex: "#FFD700", name: "Royal Gold" },
  { hex: "#228B22", name: "Emerald Green" },
  { hex: "#40E0D0", name: "Turquoise Blue" },
  { hex: "#800080", name: "Purple" },
  { hex: "#0F52BA", name: "Deep Sapphire" },
  { hex: "#F7E7CE", name: "Champagne Beige" },
  { hex: "#B76E79", name: "Rose Gold" },
  { hex: "#FA8072", name: "Salmon Pink" },
  { hex: "#FF4500", name: "Burnt Orange" },
  { hex: "#DAA520", name: "Goldenrod Yellow" },
  { hex: "#2E8B57", name: "Sea Green" },
];

const dressImages = [
  {
    src: "https://cdn.avivarma.ca/Images/attire1.jpg",
    title: "Traditional Saree",
    description: "A vibrant red saree, symbolizing love and celebration, perfect for festive occasions.",
  },
  {
    src: "https://cdn.avivarma.ca/Images/attire2.jpg",
    title: "Lehenga Choli",
    description: "An elegant lehenga adorned with intricate embroidery, ideal for weddings.",
  },
  {
    src: "https://cdn.avivarma.ca/Images/attire3.jpg",
    title: "Sherwani",
    description: "A regal sherwani for men, blending tradition with sophistication.",
  },
  {
    src: "https://cdn.avivarma.ca/Images/attire4.webp",
    title: "Anarkali Dress",
    description: "A graceful anarkali with flowing layers, perfect for evening celebrations.",
  },
];

export default function DressCode() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(swatchColors[0]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dressImages.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? dressImages.length - 1 : prev - 1
    );
  };

  const currentDress = dressImages[currentIndex];

  return (
    <div className={styles.dressCodeWrapper}>
      <h1 className={styles.title}>Interactive Dress Code</h1>
      <p className={styles.blurb}>
      We invite our guests to embrace vibrant and bold colors to reflect the joyous spirit of an Indian wedding! While our decor features a neutral palette, we encourage you to stand out with rich, colorful attire that adds a festive and celebratory flair. Feel free to mix and match from the palette below to create your unique look!
      </p>

      {/* Color Picker */}
      <ColorPicker
        swatchColors={swatchColors}
        onColorSelect={(color) => setSelectedColor(color)}
      />

      {/* Slideshow Section */}
      <div className={styles.slideshowContainer}>
        <button className={styles.navButton} onClick={handlePrevious}>
          &#8592;
        </button>
        <div className={styles.imageWrapper}>
          <Image
            src={currentDress.src}
            alt={currentDress.title}
            width={300}
            height={400}
            className={styles.image}
          />
        </div>
        <button className={styles.navButton} onClick={handleNext}>
          &#8594;
        </button>
      </div>

      {/* Attire Description */}
      <div className={styles.attireDetails}>
        <h2 className={styles.attireTitle}>{currentDress.title}</h2>
        <p className={styles.attireDescription}>{currentDress.description}</p>
      </div>
    </div>
  );
}