"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./BannerSection.module.css";

const shakthiPhotos = [
    "/ShakthiYoung/IMG_0616.jpeg",
    "/ShakthiYoung/IMG_6575.JPG",
    "/ShakthiYoung/IMG_6577.JPG",
    "/ShakthiYoung/IMG_6578.JPG",
    "/ShakthiYoung/IMG_6579.JPG",
    "/ShakthiYoung/IMG_6580.JPG",
];

const aviPhotos = [
    "/AviYoung/Bones.JPEG",
    "/AviYoung/Fat.JPEG",
    "/AviYoung/HighUp.JPEG",
    "/AviYoung/Hoodie.JPEG",
    "/AviYoung/IMG_0165.JPEG",
    "/AviYoung/Lake.JPEG",
    "/AviYoung/Plates.JPEG",
    "/AviYoung/Teeth.JPEG",
    "/AviYoung/YoungAvi.JPEG",
];

// Helper to pick a random photo
function getRandomPhoto(photoArray: string[]) {
    const randIndex = Math.floor(Math.random() * photoArray.length);
    return photoArray[randIndex];
}

export default function BannerSection() {
    const [shakthiPhotoSrc, setShakthiPhotoSrc] = useState<string | null>(null);
    const [aviPhotoSrc, setAviPhotoSrc] = useState<string | null>(null);

    // Initialize random photos on mount (client-side)
    useEffect(() => {
        setShakthiPhotoSrc(getRandomPhoto(shakthiPhotos));
        setAviPhotoSrc(getRandomPhoto(aviPhotos));
    }, []);

    // Handlers to shuffle photos
    function handleShakthiShuffle() {
        setShakthiPhotoSrc(getRandomPhoto(shakthiPhotos));
    }

    function handleAviShuffle() {
        setAviPhotoSrc(getRandomPhoto(aviPhotos));
    }

    const funFacts = [
        "Avi proposed to Shakthi at a Dosa Restaurant (His favourite food is Dosa).",
        "Avi's first time seeing Shakthi perform was in Hawaii!",
        "Shakthi and Avi will have been legally married for 7 months before this ceremony!",
        "Shakthi has seen all 100+ of SuperStar Rajinikanth's movies (Now she's making Avi watch them with her!).",
        "Avi and Shakthi's first date was at a themed Rainforest Dosa restaurant (Complete with a fake waterfall and jungle noises).",
        "Shakthi's favourite movie is 'Shrek' and Avi's is 'Pacific Rim'!",
    ];

    const ourStory = `
    We first met in Calgary, where fate brought two unique worlds together. 
    From our first conversation, it was clear there was a spark — one that grew stronger with every laugh, shared moment, and dream for the future. 
    Over time, we built a bond rooted in mutual respect, love, and an endless curiosity for life's adventures. 
    Together, we've navigated milestones, supported each other through challenges, and celebrated every success with joy. 

    Now, as we take this exciting step forward, we can't wait to continue writing the next chapters of our story — hand in hand, heart to heart.
  `;

    const shakthiStory = `
    Shakthi was born in Chennai, Tamil Nadu, and moved to Canada with her family at the age of two. 
    Growing up in Calgary, she developed a deep connection to her cultural roots through Bharatanatyam, 
    which she began learning at the age of three under the guidance of her mother. Over the years, 
    Shakthi has flourished as a dancer, teacher, and compassionate individual, finding joy in sharing 
    her heritage with others. Now, she is excited to embark on a new journey with Avi, filled with 
    laughter, love, and adventures waiting to unfold.
  `;

    const aviStory = `
    Avi grew up in Fort McMurray, Alberta, where the boreal forest and a close-knit community sparked his love for exploration and creativity. 
    His passion for problem-solving led him to pursue engineering at UBC, where he honed his skills. 

    Today, Avi channels his curiosity into building cutting-edge projects in virtual reality and machine learning, as well as this website!
    As he looks forward to this new chapter with Shakthi, Avi is eager to create a life rich with shared experiences, growth, and endless possibilities.
  `;

    return (
        <div className={styles.bannerContainer}>
            {/* Three story cards */}
            <div className={styles.cardsWrapper}>
                <div className={styles.storyCard}>
                    <h3 className={styles.storyTitle}>Story of Shakthi</h3>
                    <div className={styles.photoWrapper}>
                        {shakthiPhotoSrc && (
                            <Image
                                src={shakthiPhotoSrc}
                                alt="Photos of Shakthi"
                                width={300}
                                height={300}
                                className={styles.topPhoto}
                            />
                        )}
                        <button
                            type="button"
                            className={styles.shuffleButton}
                            onClick={handleShakthiShuffle}
                        >
                            Shuffle Photo
                        </button>
                    </div>
                    <p className={styles.storyText}>{shakthiStory}</p>
                </div>
                <div className={`${styles.storyCard} ${styles.storyCardNoBorder}`}>
                    <h3 className={styles.storyTitle}>Story of Us</h3>
                    <p className={styles.storyText}>{ourStory}</p>
                </div>
                <div className={styles.storyCard}>
                    <h3 className={styles.storyTitle}>Story of Avi</h3>
                    <div className={styles.photoWrapper}>
                        {aviPhotoSrc && (
                            <Image
                                src={aviPhotoSrc}
                                alt="Photos of Avi"
                                width={300}
                                height={300}
                                className={styles.topPhoto}
                            />
                        )}
                        <button
                            type="button"
                            className={styles.shuffleButton}
                            onClick={handleAviShuffle}
                        >
                            Shuffle Photo
                        </button>
                    </div>
                    <p className={styles.storyText}>{aviStory}</p>
                </div>
            </div>

            {/* Fun Facts Section */}
            <div className={styles.funFactsWrapper}>
                <h3 className={styles.funFactsTitle}>Fun Facts About Us!</h3>
                <ul className={styles.funFactsList}>
                    {funFacts.map((fact, index) => (
                        <li key={index} className={styles.funFactsItem}>
                            {fact}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
