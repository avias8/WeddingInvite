// components/PhotoCollage.tsx

import React from 'react';
import Image from 'next/image';
import styles from './PhotoCollage.module.css';

const selectedPhotos = [
    // Your list of photo URLs...
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(16).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(17).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(18).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(19).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(20).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(21).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(22).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(23).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(24).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(25).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(26).JPEG",
    "https://storage.googleapis.com/my-wedding-assets/Images/OurStory%20(27).JPEG",
];

const PhotoCollage = () => {
  // --- CHANGE: Duplicate the array to create a seamless loop ---
  const duplicatedPhotos = [...selectedPhotos, ...selectedPhotos];

  return (
    // --- CHANGE: Added a new wrapper for the animation ---
    <div className={styles.collageContainer}>
      <div className={styles.scrollingCollage}>
        {duplicatedPhotos.map((photo, index) => (
          <Image
            key={index}
            src={photo}
            alt={`Collage photo ${index + 1}`}
            width={200}
            height={200}
            className={styles.collageImage}
            priority={index < 8}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoCollage;