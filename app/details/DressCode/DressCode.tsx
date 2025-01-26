"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./DressCode.module.css";
import ColorPicker from "./ColorPicker"; // Import the ColorPicker component

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
  { hex: "#F4D35E", name: "Goldenrod" },
  { hex: "#A8DADC", name: "Powder Blue" },
  { hex: "#457B9D", name: "Slate Blue" },
  { hex: "#1D3557", name: "Navy" },
  { hex: "#90BE6D", name: "Mint" },
];

const dressImages = [
  {
    src: "https://cdn.avivarma.ca/Images/Attire1.JPG",
    title: "Radiant Pink Silk Saree",
    description: "A luxurious magenta-pink silk saree with a lustrous finish, paired with a matching blouse. Perfect for weddings and festive celebrations, it radiates elegance and grace with its timeless design.",
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire2.JPG",
    title: "Golden Green Kanjivaram Saree",
    description: "A captivating golden-green Kanjivaram silk saree with an exquisite sheen, paired with a contrasting maroon blouse. This timeless piece is perfect for weddings, receptions, and cultural festivities, radiating sophistication and grace."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire3.JPG",
    title: "Regal Orange and Purple Lehenga",
    description: "An enchanting orange silk lehenga with rich purple borders featuring intricate golden motifs, paired with a royal purple dupatta and a metallic blouse. This outfit is a stunning choice for weddings, receptions, and festive events, showcasing traditional grandeur.",
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire4.JPG",
    title: "Emerald Green Ensemble Trio",
    description: "A stunning trio of emerald green outfits, featuring an elegant gown with ruching details and two intricately embellished lehengas with matching dupattas. Perfect for evening receptions, cocktail parties, or festive celebrations, these outfits exude glamour and sophistication."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire5.jpeg",
    title: "Lavender Embellished Lehenga",
    description: "A dreamy lavender lehenga adorned with intricate sequin and thread embroidery, paired with a delicate matching blouse and a sheer dupatta. Perfect for receptions, engagements, and special occasions, this ensemble radiates elegance and charm."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire6.jpeg",
    title: "Lilac Embroidered Anarkali Gown",
    description: "A graceful lilac Anarkali gown featuring delicate floral embroidery and a flowing silhouette. With its intricate sequin detailing and sheer dupatta, this ensemble is perfect for engagements, sangeet ceremonies, and evening celebrations."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire7.JPG",
    title: "Pastel Sherwani Trio",
    description: "A stunning collection of pastel sherwanis in sky blue, blush pink, and mint green, adorned with intricate embroidery. Perfect for groomsmen or festive events, these sherwanis exude elegance and charm."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire8.JPG",
    title: "Maroon Kurta Pajama",
    description: "A classic maroon kurta with subtle diamond-pattern embroidery, paired with white pajama trousers. Ideal for festive occasions or casual traditional gatherings, offering timeless sophistication."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire9.JPG",
    title: "Pink Shirt with Dhoti",
    description: "A light pink short-sleeve shirt paired with a traditional white dhoti featuring a golden border. Perfect for casual cultural events, combining comfort and tradition effortlessly."
  },
  {
    src: "https://cdn.avivarma.ca/Images/Attire10.JPG",
    title: "Black Shirt with Kerala Dhoti",
    description: "A stylish black shirt paired with a crisp white Kerala dhoti featuring a golden border. A modern take on traditional attire, perfect for cultural ceremonies and casual gatherings."
  }
];

export default function DressCode() {
  const [currentIndex, setCurrentIndex] = useState(0);

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
      <h1 className={styles.title}>Dress Code</h1>

      {/* Color Picker Section */}
      <ColorPicker
        swatchColors={swatchColors}
        onColorSelect={(color) => console.log("Selected Color:", color)}
      />

      <p className={styles.attireDescription}>
        We invite our guests to embrace vibrant and bold colors to reflect the joyous spirit of an Indian wedding! While our decor features a neutral palette, we encourage you to stand out with rich, colorful attire that adds a festive and celebratory flair. Feel free to mix and match from the palette below to create your unique look!
      </p>

      <br></br>

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