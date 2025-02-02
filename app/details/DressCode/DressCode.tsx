//app/details/DressCode/DressCode.tsx
"use client";

import styles from "./DressCode.module.css";
import ColorPicker from "./ColorPicker"; // Import the ColorPicker component
import Slideshow from "../../components/Slideshow";

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
  { hex: "#F9C74F", name: "Mustard" },
];

const dressImages = [
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire1.JPG",
    title: "Radiant Pink Silk Saree",
    description: "A luxurious magenta-pink silk saree...",
    width: 1920,
    height: 1080
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire2.JPG",
    title: "Golden Green Kanjivaram Saree",
    description: "A captivating golden-green Kanjivaram...",
    width: 1920,
    height: 1080
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire3.JPG",
    title: "Regal Orange and Purple Lehenga",
    description: "An enchanting orange silk lehenga...",
    width: 1920,
    height: 1080
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire4.JPG",
    title: "Emerald Green Ensemble Trio",
    description: "A stunning trio of emerald green outfits...",
    width: 1920,
    height: 1080
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire5.jpeg",
    title: "Lavender Embellished Lehenga",
    description: "A dreamy lavender lehenga...",
    width: 1080,
    height: 1350
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire6.jpeg",
    title: "Lilac Embroidered Anarkali Gown",
    description: "A graceful lilac Anarkali gown...",
    width: 1080,
    height: 1350
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire7.JPG",
    title: "Pastel Sherwani Trio",
    description: "A stunning collection of pastel sherwanis...",
    width: 1920,
    height: 1080
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire8.JPG",
    title: "Maroon Kurta Pajama",
    description: "A classic maroon kurta...",
    width: 1080,
    height: 1350
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire9.JPG",
    title: "Pink Shirt with Dhoti",
    description: "A light pink short-sleeve shirt...",
    width: 1080,
    height: 1350
  },
  {
    src: "https://storage.googleapis.com/my-wedding-assets/Images/Attire10.JPG",
    title: "Black Shirt with Kerala Dhoti",
    description: "A stylish black shirt...",
    width: 1920,
    height: 1080
  }
];

export default function DressCode() {
  return (
    <div>

      {/* Color Picker Section */}
      <ColorPicker
        swatchColors={swatchColors}
        onColorSelect={(color) => console.log("Selected Color:", color)}
      />

      <p className={styles.attireDescription}>
        We invite our guests to embrace vibrant and bold colors to reflect the joyous spirit of an Indian wedding! While our decor features a neutral palette, we encourage you to stand out with rich, colorful attire that adds a festive and celebratory flair. Feel free to mix and match from the palette below to create your unique look!
      </p>

      {/* Slideshow Component */}
      <Slideshow slides={dressImages} />
    </div>
  );
}