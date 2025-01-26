"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./DressCode.module.css";

const swatchColors = [
  { hex: "#E63946", name: "Red" },
  { hex: "#F76C5E", name: "Coral" },
  { hex: "#FF9F1C", name: "Orange" },
  { hex: "#2A9D8F", name: "Teal" },
  { hex: "#264653", name: "Deep Blue" },
  { hex: "#FFC300", name: "Yellow" },
  { hex: "#8AB17D", name: "Sage" },
  { hex: "#344E41", name: "Forest Green" },
  { hex: "#D62828", name: "Crimson" },
  { hex: "#F4A261", name: "Peach" },
  { hex: "#F4D35E", name: "Goldenrod" },
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

const clothingStores = [
  {
    name: "Utsav Fashion",
    url: "https://www.utsavfashion.com/",
    location: "Online",
  },
  {
    name: "Bombay Boutique",
    url: "https://www.bombayboutique.com/",
    location: "Calgary, Alberta",
  },
  {
    name: "Manyavar",
    url: "https://www.manyavar.com/",
    location: "Vancouver, BC",
  },
];

export default function DressCode() {
  const [selectedColor, setSelectedColor] = useState(swatchColors[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    alert(`Copied ${hex} to clipboard!`);
  };

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
        We encourage our guests to wear vibrant and bold colors that reflect the joyous spirit of an Indian wedding! Choose from the rich palette below and feel free to mix and match. Avoid wearing black or white, as they are traditionally not worn at such celebrations.
      </p>

      {/* Interactive Swatch Section */}
      <div className={styles.swatchWrapper}>
        <div
          className={styles.previewBox}
          style={{ backgroundColor: selectedColor.hex }}
        >
          <p className={styles.previewText}>
            {selectedColor.name}
          </p>
        </div>

        <div className={styles.swatchGrid}>
          {swatchColors.map((color, index) => (
            <div
              key={index}
              className={styles.swatch}
              style={{ backgroundColor: color.hex }}
              onMouseEnter={() => setSelectedColor(color)}
              onClick={() => handleCopy(color.hex)}
              title={`Click to copy ${color.name}`}
            ></div>
          ))}
        </div>
      </div>

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

      {/* Store Recommendations */}
      <div className={styles.storeList}>
        <h3 className={styles.subtitle}>Where to Get These</h3>
        <ul>
          {clothingStores.map((store, index) => (
            <li key={index} className={styles.storeItem}>
              <a
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeLink}
              >
                {store.name}
              </a>{" "}
              - {store.location}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
