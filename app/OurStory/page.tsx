import React from "react";
// Import the CSS file
import "./OurStory.css";
// Import the VIPList component
import VIPList from "../components/VIPlist";
import HeroSection from "../components/HeroSection";
import BannerSection from "../components/BannerSection";
import TeaserSchedule from "../components/TeaserSchedule";
import VenueSection from "../components/VenueSection";
import Countdown from "../components/Countdown";
import PhotoGallery from "../components/PhotoGallery";



export default function OurStory() {

    const scheduleData = [
        { time: "10:00 AM", description: "Doors Open" },
        { time: "11:00 AM", description: "Ceremony Starts" },
        { time: "1:00 PM", description: "Lunch!" },
    ];

    const vipData = [
        {
            title: "Parents of the Bride",
            names: ["Karthika Devi & Ganesh Sankar Govindarajan"],
        },
        {
            title: "Parents of the Groom",
            names: ["Vaishali and Anil Varma"],
        },
        {
            title: "Brother of the Bride",
            names: ["Prathyunkar Ganesh Sankar"],
        },
        {
            title: "Sisters of the Groom",
            names: ["Tanya & Vani Chowdhary"],
        },
        {
            title: "Maid of Honour",
            names: ["Areeba Nadeem"],
        },
        {
            title: "Best Man",
            names: ["Zain Chandani"],
        },
        {
            title: "Bridal Party",
            names: ["Kavya Bhagawatula", "Harshad Karishnaraj"],
        },
        {
            title: "Groomsmen",
            names: ["Sunith Arlic", "Sim Khinda", "Saffy Swaleh"],
        },
    ];

    return (
        <div className="pageContainer">
            {/* Hero Section */}
            <HeroSection
                mp4Src="https://storage.googleapis.com/my-wedding-assets/Rokha.mp4"
                webmSrc="https://storage.googleapis.com/my-wedding-assets/Rokha.webm"
                heroText="AVI AND SHAKTHI'S WEDDING"
                subText="06 • 29 • 2025"
            />

            {/* Teaser Schedule */}
            <section className="section">
                <TeaserSchedule heading="Here’s a sneak peek of our special day’s schedule"
                    scheduleItems={scheduleData}
                    footnote="The dancing & reception starts after!" />
            </section>


            {/* Our Story Section */}
            <section className="section">
                <h2 className="sectionTitle">Our Story</h2>
                <p className="sectionText">
                    It all began in Calgary, where Avi and Shakthi first met. From that
                    moment, a connection formed, and what started as a simple
                    conversation soon grew into something special.
                </p>
                <p className="sectionText">
                    Over time, they discovered shared values, laughter, and experiences
                    that brought them closer together. Now, they are excited to take the
                    next step in their journey and look forward to celebrating this
                    special occasion with all of you.
                </p>
            </section>

            {/* Photo Gallery */}
            <PhotoGallery />

            <BannerSection />

            {/* VIP List Section */}
            <section className="section">
                <VIPList sectionTitle="Our Guests of Honor" guests={vipData} />
            </section>

            {/* Countdown to, e.g., June 29, 2024 at 11 AM */}
            <Countdown targetDate="2025-06-29T11:00:00" />

            <VenueSection
                venueName="Hilltop Wedding Center"
                locationHeading="Sylvan Lake, Alberta"
                addressLines={[
                    "Box 9077",
                    "T4S 1S6",
                ]}
                phoneNumber="403-896-8673"
                email="info@hilltopweddingcenter.com"
                venueDescription="We're excited to celebrate with you at Syvlan Lake's Hilltop Wedding Center - a charming venue overlooking the Lake surrounded by nature. The perfect setting for a day of love and joy."
                imageUrl="/Images/Venue.jpg"
                mapLink="https://www.google.com/maps/dir/?api=1&destination=Blue%20Sign%2039145,%20Sylvan%20Lake,%20AB%20T0M%200H0,%20Canada"
            />

            {/* Footer */}
            <footer className="footer">
                <p className="footerText">We can&apos;t wait to celebrate with you.</p>
            </footer>
        </div>
    );
}
