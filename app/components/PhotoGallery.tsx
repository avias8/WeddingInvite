"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./PhotoGallery.module.css";

const ourStoryPhotos = [
    "/Images/Cow.JPEG",
    "/Images/Mirror.jpg",
    "/Images/Orange.jpg",
    "/Images/OurStory (10).JPEG",
    "/Images/OurStory (13).JPEG",
    "/Images/OurStory (16).JPEG",
    "/Images/OurStory (17).JPEG",
    "/Images/OurStory (18).JPEG",
    "/Images/OurStory (19).JPEG",
    "/Images/OurStory (20).JPEG",
    "/Images/OurStory (21).JPEG",
    "/Images/OurStory (22).JPEG",
    "/Images/OurStory (23).JPEG",
    "/Images/OurStory (24).JPEG",
    "/Images/OurStory (25).JPEG",
    "/Images/OurStory (26).JPEG",
    "/Images/OurStory (27).JPEG",
    "/Images/OurStory (28).JPEG",
    "/Images/OurStory (29).JPEG",
    "/Images/OurStory (30).jpeg",
    "/Images/OurStory (5).JPEG",
    "/Images/OurStory (6).JPEG",
    "/Images/OurStory (6).jpg",
    "/Images/OurStory (7).JPEG",
    "/Images/OurStory (8).JPEG",
    "/Images/OurStory (9).JPEG",
    "/Images/Outside.JPG",
    "/Images/Puja.JPEG",
    "/Images/Stairs.JPG",
    "/Images/Us.jpeg",
    "/Images/Vast.jpg",
    "/Images/WeddingDay.jpeg",
];

export default function PhotoGallery() {
    const [photos, setPhotos] = useState<string[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<boolean[]>([]);
    const [nextPhotos, setNextPhotos] = useState<string[]>([]);
    const [lastFlippedIndices, setLastFlippedIndices] = useState<number[]>([]);

    // Generic shuffle function
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Memoized getRandomIndices function
    const getRandomIndices = useCallback(
        (total: number, count: number, exclude: number[] = []): number[] => {
            const availableIndices = Array.from({ length: total }, (_, i) => i).filter(
                (i) => !exclude.includes(i)
            );

            if (availableIndices.length < count) {
                return Array.from({ length: count }, () =>
                    Math.floor(Math.random() * total)
                );
            }

            const shuffled = shuffleArray(availableIndices);
            return shuffled.slice(0, count);
        },
        [] // Dependencies: none since shuffleArray is defined locally and doesn't depend on external state
    );

    // Shuffle Photos Function (Memoized)
    const shufflePhotos = useCallback(() => {
        const randomIndices = getRandomIndices(9, 3, lastFlippedIndices);
        const displayedPhotos = new Set(photos);
        const availablePhotos = ourStoryPhotos.filter(
            (photo) => !displayedPhotos.has(photo)
        );
        const shuffledAvailable = shuffleArray(availablePhotos);
        const updatedNextPhotos = [...nextPhotos];

        randomIndices.forEach((index, i) => {
            updatedNextPhotos[index] =
                shuffledAvailable[i % shuffledAvailable.length];
        });

        setNextPhotos(updatedNextPhotos);
        setFlippedIndices((prev) => {
            const newFlipped = [...prev];
            randomIndices.forEach((index) => {
                newFlipped[index] = true;
            });
            return newFlipped;
        });

        setTimeout(() => {
            setPhotos((prev) => {
                const newPhotos = [...prev];
                randomIndices.forEach((index) => {
                    newPhotos[index] = updatedNextPhotos[index];
                });
                return newPhotos;
            });

            setFlippedIndices((prev) => {
                const newFlipped = [...prev];
                randomIndices.forEach((index) => {
                    newFlipped[index] = false;
                });
                return newFlipped;
            });

            setLastFlippedIndices(randomIndices);
        }, 800);
    }, [photos, nextPhotos, lastFlippedIndices, getRandomIndices]);

    // Initialize Photos on Mount
    useEffect(() => {
        const shuffled = shuffleArray(ourStoryPhotos);
        setPhotos(shuffled.slice(0, 9));
        setNextPhotos(shuffled.slice(0, 9));
        setFlippedIndices(new Array(9).fill(false));
    }, []);

    // Automatic Shuffle Every 5 Seconds
    useEffect(() => {
        const interval = setInterval(shufflePhotos, 5000);
        return () => clearInterval(interval);
    }, [shufflePhotos]);

    return (
        <div className={styles.galleryContainer}>
            <h2 className={styles.galleryTitle}>Our Story in Photos</h2>
            <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                    <div
                        key={index}
                        className={`${styles.card} ${flippedIndices[index] ? styles.flipped : ""
                            }`}
                    >
                        <div className={styles.cardInner}>
                            <div className={styles.cardFront}>
                                <Image
                                    src={photo}
                                    alt={`Photo ${index + 1}`}
                                    width={300}
                                    height={300}
                                    className={styles.photo}
                                />
                            </div>
                            <div className={styles.cardBack}>
                                <Image
                                    src={nextPhotos[index] || photo}
                                    alt={`Photo ${index + 1}`}
                                    width={300}
                                    height={300}
                                    className={styles.photo}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
