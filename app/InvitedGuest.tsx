"use client";

import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie"; // For managing cookies on the client side
import styles from "./InvitedGuest.module.css";

export default function InvitedGuest() {
  const [token, setToken] = useState<string | null>(null);
  const [lookupValue, setLookupValue] = useState<string>("");
  const [invitee, setInvitee] = useState<{
    name: string;
    email: string;
    maxInvites: number;
    guests: number;
    isAttending: boolean;
    dietaryRestrictions: string | null;
    accessibilityInfo: string | null;
    comments: string | null;
    songRequests: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
  const [accessibilityInfo, setAccessibilityInfo] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [songRequests, setSongRequests] = useState<string>("");

  // Save the token to cookies
  const saveTokenToCookies = (token: string) => {
    Cookies.set("inviteToken", token, { expires: 7 }); // Expires in 7 days
  };

  // Fetch invitee data
  const fetchInvitee = useCallback(async (lookupToken: string) => {
    try {
      const response = await fetch(`/api/invitees/${lookupToken}`);
      if (!response.ok) {
        throw new Error("No invitation found for the provided token.");
      }
      const data = await response.json();
      setInvitee(data);

      // Set invitee details
      setIsAttending(data.isAttending);
      setGuests(data.guests || data.maxInvites);
      setDietaryRestrictions(data.dietaryRestrictions || "");
      setAccessibilityInfo(data.accessibilityInfo || "");
      setComments(data.comments || "");
      setSongRequests(data.songRequests || "");

      // Save token to cookies
      saveTokenToCookies(lookupToken);
    } catch (err) {
      console.error("Error fetching invitee:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  }, []);

  // Initialize token and fetch data
  useEffect(() => {
    const tokenFromHash = window.location.hash.substring(1);
    const cachedToken = Cookies.get("inviteToken");

    if (tokenFromHash) {
      setToken(tokenFromHash);
      fetchInvitee(tokenFromHash);
    } else if (cachedToken) {
      setToken(cachedToken);
      fetchInvitee(cachedToken);
    }
  }, [fetchInvitee]);

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      setError("Please enter your Invitation Token.");
      return;
    }
    setError(null);
    await fetchInvitee(lookupValue.trim());
  };

  const handleAttendance = (attending: boolean) => {
    setIsAttending(attending);
    if (attending && invitee) {
      setGuests(invitee.maxInvites);
    } else {
      setGuests(0);
    }
  };

  const handleGuestsChange = (value: number) => {
    if (invitee) {
      const validGuests = Math.max(1, Math.min(value, invitee.maxInvites));
      setGuests(validGuests);
    }
  };

  const handleSubmit = async () => {
    if (!token && !lookupValue) {
      setError("Invitation Token is missing.");
      return;
    }

    try {
      const response = await fetch(`/api/invitees/${token || lookupValue}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAttending,
          guests,
          dietaryRestrictions,
          accessibilityInfo,
          comments,
          songRequests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update RSVP. Please try again.");
      }

      alert("RSVP updated successfully!");
    } catch (err) {
      console.error("Error updating RSVP:", err);
      setError("An error occurred while updating your RSVP.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.hero}>
        <h1>
          <span>RSVP Invitation</span>
        </h1>
        <p className={styles.heroSubtext}>
          Enter your details to confirm your RSVP.
        </p>
      </header>

      {!invitee && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Lookup Invitation</h3>
          <div className={styles.formField}>
            <label htmlFor="inviteToken">Invitation Token</label>
            <input
              type="text"
              id="inviteToken"
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              placeholder="Enter your Invitation Token"
            />
          </div>
          <button className={styles.sectionButton} onClick={handleLookup}>
            Lookup
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </section>
      )}

      {invitee && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Welcome, {invitee.name}</h3>
          <div className={styles.formField}>
            <label>Will you be attending?</label>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.sectionButton} ${
                  isAttending === true ? styles.activeButton : ""
                }`}
                onClick={() => handleAttendance(true)}
              >
                Yes
              </button>
              <button
                className={`${styles.sectionButton} ${
                  isAttending === false ? styles.activeButton : ""
                }`}
                onClick={() => handleAttendance(false)}
              >
                No
              </button>
            </div>
          </div>

          {isAttending && (
            <>
              <div className={styles.formField}>
                <label>Number of Guests:</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => handleGuestsChange(parseInt(e.target.value))}
                  min="1"
                  max={invitee.maxInvites}
                />
              </div>
              <div className={styles.formField}>
                <label>Dietary Restrictions:</label>
                <textarea
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g., Vegan, Nut Allergy"
                />
              </div>
              <div className={styles.formField}>
                <label>Accessibility Info:</label>
                <textarea
                  value={accessibilityInfo}
                  onChange={(e) => setAccessibilityInfo(e.target.value)}
                  placeholder="e.g., Wheelchair access required"
                />
              </div>
              <div className={styles.formField}>
                <label>Comments:</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any additional comments"
                />
              </div>
              <div className={styles.formField}>
                <label>Song Requests:</label>
                <textarea
                  value={songRequests}
                  onChange={(e) => setSongRequests(e.target.value)}
                  placeholder="e.g., Your favorite songs"
                />
              </div>
            </>
          )}

          <button className={styles.sectionButton} onClick={handleSubmit}>
            Submit RSVP
          </button>
        </section>
      )}
    </div>
  );
}
