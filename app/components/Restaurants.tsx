"use client";

import React from "react";
import styles from "./Restaurants.module.css";

const restaurants = [
  {
    name: "Major Tom",
    description: "Fine dining with stunning city views.",
    image: "/images/major-tom.jpg",
  },
  {
    name: "Soul Pocha",
    description: "Korean comfort food at its finest.",
    image: "/images/soul-pocha.jpeg",
  },
  {
    name: "Dosa Garden",
    description: "Authentic South Indian flavors.",
    image: "/images/dosa-garden.webp",
  },
  {
    name: "Banzai",
    description: "Fresh sushi and Japanese cuisine.",
    image: "/images/banzai.jpg",
  },
  {
    name: "Chairman’s",
    description: "Modern Fine Dining.",
    image: "/images/chairmans.jpg",
  },
  {
    name: "Baladi Shawarma",
    description: "Middle Eastern street food specialties.",
    image: "/images/baladi-shawarma.jpg",
  },
];

export default function Restaurants() {
  return (
    <div className={styles.restaurantsWrapper}>
      <h1 className={styles.title}>Restaurants to Eat At</h1>
      <p className={styles.subtitle}>
        A few of Avi & Shakthi's favorite spots to try!
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
