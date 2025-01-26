"use client";

import React from "react";
import styles from "./Restaurants.module.css";

const restaurants = [
  {
    name: "Major Tom",
    description: "Fine dining with stunning city views.",
    image: "https://storage.googleapis.com/my-wedding-assets/Images/major-tom.jpg",
  },
  {
    name: "Soul Pocha",
    description: "Korean comfort food at its finest.",
    image: "https://storage.googleapis.com/my-wedding-assets/Images/soul-pocha.jpeg",
  },
  {
    name: "Dosa Garden",
    description: "Authentic South Indian flavors.",
    image: "https://storage.googleapis.com/my-wedding-assets/Images/dosa-garden.webp",
  },
  {
    name: "Banzai",
    description: "Fresh sushi and Japanese cuisine.",
    image: "https://storage.googleapis.com/my-wedding-assets/Images/banzai.jpg",
  },
  {
    name: "Chairman’s",
    description: "Modern Fine Dining.",
    image: "https://storage.googleapis.com/my-wedding-assets/Images/chairmans.jpg",
  },
  {
    name: "Baladi Shawarma",
    description: "Middle Eastern street food specialties.",
    image: "https://storage.googleapis.com/my-wedding-assets/Images/baladi-shawarma.jpg",
  },
];

export default function Restaurants() {
  return (
    <div className={styles.restaurantsWrapper}>
      <h1 className={styles.title}>Restaurants to Eat At</h1>
      <p className={styles.subtitle}>
        A few of Avi & Shakthi&apos;s favorite spots to try!
      </p>
      <div className={styles.grid}>
        {restaurants.map((restaurant, index) => (
          <div
            key={index}
            className={styles.card}
            style={{ backgroundImage: `url(${restaurant.image})` }}
          >
            <div className={styles.overlay}>
              <h2 className={styles.cardTitle}>{restaurant.name}</h2>
              <p className={styles.cardDescription}>{restaurant.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
