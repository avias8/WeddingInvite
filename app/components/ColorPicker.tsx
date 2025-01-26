"use client";

import React, { useState } from "react";
import styles from "./ColorPicker.module.css";

interface SwatchColor {
  hex: string;
  name: string;
}

interface ColorPickerProps {
  swatchColors: SwatchColor[];
  onColorSelect: (color: SwatchColor) => void;
}

export default function ColorPicker({ swatchColors, onColorSelect }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(swatchColors[0]);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    alert(`Copied ${hex} to clipboard!`);
  };

  return (
    <div className={styles.colorPickerWrapper}>
      {/* Color Preview */}
      <div
        className={styles.previewBox}
        style={{ backgroundColor: selectedColor.hex }}
      >
        <p className={styles.previewText}>{selectedColor.name}</p>
      </div>

      {/* Color Swatches */}
      <div className={styles.swatchGrid}>
        {swatchColors.map((color, index) => (
          <div
            key={index}
            className={styles.swatch}
            style={{ backgroundColor: color.hex }}
            onMouseEnter={() => {
              setSelectedColor(color);
              onColorSelect(color);
            }}
            onClick={() => handleCopy(color.hex)}
            title={`Click to copy ${color.name}`}
          ></div>
        ))}
      </div>
    </div>
  );
}