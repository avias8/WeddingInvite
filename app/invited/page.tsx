"use client"; // Because we use client-side features here

import { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import InvitedGuest from "../components/InviteForm";
import Cookies from "js-cookie";
import styles from "./invited.module.css";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection"; 

Modal.setAppElement("#__next"); // For react-modal accessibility

export default function BigInvitePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteeName, setInviteeName] = useState<string | null>(null);
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitee data
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

  // Check for token in URL/hash or cookies
  useEffect(() => {
    const tokenFromHash = window.location.hash.substring(1);
    const tokenFromCookies = Cookies.get("inviteToken");

    if (tokenFromHash) {
      Cookies.set("inviteToken", tokenFromHash, { expires: 7 });
      fetchInvitee(tokenFromHash);
    } else if (tokenFromCookies) {
      fetchInvitee(tokenFromCookies);
    } else {
      setError("No token found. Please ensure you have entered your invitation token.");
    }
  }, [fetchInvitee]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Global site header */}
      <Header />

      <div className={styles.pageContainer}>
        {/* Hero Section */}
        <HeroSection
          mp4Src="/Sandwitchsnatch.mp4"
          webmSrc="/Sandwitchsnatch.webm"
          heroText="AVI AND SHAKTHI'S WEDDING"
        />

        {/* To: Guest Section */}
        <section className={styles.toGuestSection}>
          <p className={styles.heroSubtext}>
            To: {inviteeName || "Guest"}
          </p>
          <p
            className={`${styles.heroSubtextInvite} italic underline cursor-pointer`}
            onClick={openModal}
          >
            {isAttending === null
              ? "RSVP Status Unknown"
              : isAttending
                ? "You Are Attending"
                : "You Are Not Attending"}
          </p>
        </section>

        {/* Host Question Section */}
        <section className={`${styles.section} ${styles.hostQuestion}`}>
          <h3 className={styles.sectionTitle}>Questions from the Host</h3>
          <p className={styles.sectionText}>
            Please let us know of any dietary restrictions you have. We will reach out to confirm.
          </p>
          <button className={styles.sectionButton} onClick={openModal}>
            Respond to Host
          </button>
        </section>

        {/* Event Details Section */}
        <section className={styles.eventDetails}>
          <div className={styles.hostedBy}>
            <p className={styles.sectionTitle}>Hosted By</p>
            <p className={styles.familyName}>The Varma and Ganesh Family 💍</p>
          </div>
          <div className={styles.datesSection}>
            <p className={styles.dates}>June 29, 2025 | 11 AM</p>
            <p className={styles.location}>Hilltop Wedding Centre</p>
            <p className={styles.location}>Sylvan Lake, Alberta</p>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerText}>RSVP by March 31, 2025</p>
        </footer>

        {/* Modal (RSVP Form) */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Respond to Host Modal"
          className={styles.modalContent} /* Content styles */
          overlayClassName={styles.modalOverlay} /* Overlay styles */
        >
          <button onClick={closeModal} className={styles.sectionButton}>
            Close
          </button>

          <div className={styles.invitedGuestContainer}>
            <InvitedGuest />
          </div>

          <button onClick={closeModal} className={styles.bottomsectionButton}>
            Close
          </button>
        </Modal>

        {error && (
          <div className={`${styles.error} text-red-600`}>
            <p>{error}</p>
          </div>
        )}
      </div>

    </>
  );
}
