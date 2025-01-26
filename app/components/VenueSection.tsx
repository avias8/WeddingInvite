"use client";

import React from "react";
import Image from "next/image";
import styles from "./VenueSection.module.css";

interface VenueSectionProps {
    /** Name of the venue, e.g. "Hilltop Wedding Center" */
    venueName: string;
    /** A short snippet or description/story about the venue */
    venueDescription: string;
    /** URL to an image of the venue */
    imageUrl: string;
    /** Address lines (e.g., "1234 Hilltop Rd", "T4S 1S6") */
    addressLines: string[];
    /** The city or region heading, e.g. "Sylvan Lake, Alberta" */
    locationHeading: string;
    /** Phone number */
    phoneNumber: string;
    /** Email address */
    email: string;
    /** Google Maps or directions link (optional) */
    mapLink?: string;
}

export default function VenueSection({
    venueName,
    venueDescription,
    imageUrl,
    addressLines,
    locationHeading,
    phoneNumber,
    email,
    mapLink,
}: VenueSectionProps) {
    return (
        <div className={styles.venueWrapper}>
            {/* Left Column: Venue Info / Short Description */}
            <div className={styles.leftColumn}>
                <h2 className={styles.venueTitle}>{venueName}</h2>
                <p className={styles.venueDescription}>{venueDescription}</p>
            </div>

            {/* Center Column: Photo */}
            <div className={styles.centerColumn}>
                <Image
                    src={imageUrl}
                    alt={venueName}
                    width={600}
                    height={400}
                    className={styles.venueImage}
                    priority
                />
            </div>

            {/* Right Column: Address + Contact + Embedded Map */}
            <div className={styles.rightColumn}>
                <h3 className={styles.locationHeading}>{locationHeading}</h3>
                {addressLines.map((line, idx) => (
                    <p key={idx} className={styles.addressLine}>
                        {line}
                    </p>
                ))}
                <p className={styles.phoneEmail}>
                    {phoneNumber}
                    <br />
                    <a href={`mailto:${email}`} className={styles.emailLink}>
                        {email}
                    </a>
                </p>

                {/* Embedded Google Map */}
                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
                    <iframe className={styles.mapIframe}
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2437.5497078838175!2d-114.0739137866627!3d52.342314571898406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5375ada3671595bd%3A0x2dafb2938dd36202!2sHilltop%20Wedding%20Center!5e0!3m2!1sen!2sca!4v1737607447403!5m2!1sen!2sca"
                        width="200"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="eager"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                {/* Directions Link */}
                {mapLink && (
                    <a
                        className={styles.mapLink}
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Get Directions
                    </a>
                )}
            </div>
        </div>
    );
}
