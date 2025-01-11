"use client"; // Marks this file as a client component

import { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import InvitedGuest from "./InvitedGuest"; // Import your component
import Cookies from "js-cookie"; // For managing cookies on the client side
import styles from "./HomePage.module.css";

Modal.setAppElement("#__next"); // Set the root app element for accessibility

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [inviteeName, setInviteeName] = useState<string | null>(null);
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch invitee data
  const fetchInvitee = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/invitees/${token}`);
      if (!response.ok) {
        throw new Error("No invitation found for the provided token.");
      }
      const data = await response.json();
      setInviteeName(data.name);
      setIsAttending(data.isAttending);
    } catch (err) {
      console.error("Error fetching invitee:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  }, []);

  // Check for token in URL hash or cookies
  useEffect(() => {
    const tokenFromHash = window.location.hash.substring(1); // Get token from URL hash
    const tokenFromCookies = Cookies.get("inviteToken");

    if (tokenFromHash) {
      Cookies.set("inviteToken", tokenFromHash, { expires: 7 }); // Save token in cookies
      fetchInvitee(tokenFromHash);
    } else if (tokenFromCookies) {
      fetchInvitee(tokenFromCookies);
    } else {
      setError("No token found. Please ensure you have entered your invitation token.");
    }
  }, [fetchInvitee]);

  // Functions to handle modal open/close
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Clear token functionality
  const clearTokenFromCookies = () => {
    Cookies.remove("inviteToken");
    setInviteeName(null);
    setIsAttending(null);
    setError("Token cache cleared. Please re-enter your token.");
  };

  return (
    <div className={styles.pageContainer}>
      {/* Title Section */}
      <header className={styles.hero}>
        <h1>
          <span>AVI AND SHAKTHI'S WEDDING</span>
        </h1>
        <p className={styles.heroSubtext}>
          To: {inviteeName || "Guest"} {/* Display the invitee's name */}
        </p>
        <p
          className={`${styles.heroSubtextInvite} italic underline cursor-pointer`}
          onClick={openModal} // Open modal when clicked
        >
          {isAttending === null
            ? "RSVP Status Unknown"
            : isAttending
            ? "You Are Attending"
            : "You Are Not Attending"} {/* Display attending status */}
        </p>
      </header>

      {/* Host Question Section */}
      <section className={`${styles.section} ${styles.hostQuestion}`}>
        <h3 className={styles.sectionTitle}>Questions from the Host</h3>
        <p className={styles.sectionText}>
          Please let us know of any dietary restrictions you have. We will reach out to confirm.
        </p>
        <button
          className={styles.sectionButton}
          onClick={openModal} // Open modal when clicked
        >
          Respond to Host
        </button>
      </section>

      {/* Event Details Section */}
      <section className={styles.eventDetails}>
        {/* Hosted By Section */}
        <div className={styles.hostedBy}>
          <p className={styles.sectionTitle}>Hosted By</p>
          <p className={styles.familyName}>The Varma and Ganesh Family 💍</p>
        </div>
        {/* Dates Section */}
        <div className={styles.datesSection}>
          <p className={styles.dates}>June 28, 2025 | 2 PM</p>
          <p className={styles.dates}>June 29, 2025 | 11 AM</p>
          <br />
          <p className={styles.location}>Calgary, Alberta</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>RSVP by March 31, 2025</p>
      </footer>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Respond to Host Modal"
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
        >
        {/* Fixed Close Button at the Top-Right */}
        <button onClick={closeModal} className={styles.closeButton}>
            Close
        </button>

        {/* Modal Content */}
        <InvitedGuest />

        {/* Close Button at the Bottom */}
        <button onClick={closeModal} className={styles.bottomCloseButton}>
            Close
        </button>
    </Modal>


      {/* Error Message */}
      {error && (
        <div className={`${styles.error} text-red-600`}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
