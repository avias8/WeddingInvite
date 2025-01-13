import React from "react";
// Import the CSS file
import "./OurStory.css";
// Import the VIPList component
import VIPList from "../components/VIPlist";
import Timeline from "../components/Timeline";

export default function OurStory() {
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

    const timelineDays = [
        {
            date: "June 29, 2025",
            location: "Sylvan Lake",
            events: [
                { time: "11:00 AM", title: "Hindu Ceremony" },
                { time: "2 PM", title: "Dance Party/Reception" },
                { time: "4:00 PM", title: "Lunch" },
                { time: "9:30 PM", title: "After Party" },
            ],
        },
    ];
    

    return (
        <div className="pageContainer">
            <header className="hero">
                <video autoPlay muted loop playsInline className="hero-video">
                    <source src="/Sandwitchsnatch.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                <span className="hero-title">Avi & Shakthi</span>
            </header>


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

            <section className="timelineSection">
                <div className="imageContainer">
                    <img
                        src="/Avi&Shakthi.JPEG"
                        alt="Avi and Shakthi"
                        className="timelineImage"
                    />
                </div>
                <div className="timeline-container">
                    <Timeline title="The Key Events" days={timelineDays} />
                </div>
            </section>


            {/* VIP List Section */}
            <section className="section">
                <VIPList sectionTitle="Our Guests of Honor" guests={vipData} />
            </section>

            {/* Footer */}
            <footer className="footer">
                <p className="footerText">We can&apos;t wait to celebrate with you.</p>
            </footer>
        </div>
    );
}
