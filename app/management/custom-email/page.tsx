// app/management/custom-email/page.tsx
"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import type { Invitee } from "@/app/types"; // Assuming your types are here
import styles from "./CustomEmail.module.css"; // We'll create this basic CSS module

export default function CustomEmailPage() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [selectedInviteeEmails, setSelectedInviteeEmails] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>(""); // For HTML content

  const [loadingInvitees, setLoadingInvitees] = useState<boolean>(true);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInviteesData() {
      setLoadingInvitees(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/invitees");
        if (!res.ok) {
          throw new Error(`Failed to fetch invitees: ${res.statusText}`);
        }
        const data: Invitee[] = await res.json();
        setInvitees(data);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "An unknown error occurred while fetching invitees.");
      } finally {
        setLoadingInvitees(false);
      }
    }
    fetchInviteesData();
  }, []);

  const handleCheckboxChange = (email: string) => {
    setSelectedInviteeEmails(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(email)) {
        newSelected.delete(email);
      } else {
        newSelected.add(email);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedInviteeEmails.size === invitees.length) {
      setSelectedInviteeEmails(new Set()); // Deselect all
    } else {
      setSelectedInviteeEmails(new Set(invitees.map(invitee => invitee.email))); // Select all
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    setSendError(null);
    setSendSuccess(null);

    if (selectedInviteeEmails.size === 0) {
      setSendError("Please select at least one recipient.");
      setSendingEmail(false);
      return;
    }
    if (!emailSubject.trim()) {
      setSendError("Email subject cannot be empty.");
      setSendingEmail(false);
      return;
    }
    if (!emailBody.trim()) {
      setSendError("Email body cannot be empty.");
      setSendingEmail(false);
      return;
    }

    try {
      const response = await fetch("/api/send-custom-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: Array.from(selectedInviteeEmails),
          subject: emailSubject,
          htmlContent: emailBody,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || `Failed to send emails. Status: ${response.status}`);
      }
      
      setSendSuccess(result.message || "Emails sent successfully!");
      // Optionally clear form or selected emails
      // setSelectedInviteeEmails(new Set());
      // setEmailSubject("");
      // setEmailBody("");

    } catch (err) {
      setSendError(err instanceof Error ? err.message : "An unknown error occurred while sending emails.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loadingInvitees) return <div className={styles.loading}>Loading invitees...</div>;
  if (fetchError) return <div className={styles.error}>Error: {fetchError}</div>;

  return (
    <div className={styles.customEmailContainer}>
      <h1 className={styles.pageTitle}>Send Custom Email to Guests</h1>

      <form onSubmit={handleSubmit} className={styles.emailForm}>
        <div className={styles.recipientsSection}>
          <h2 className={styles.sectionTitle}>Select Recipients ({selectedInviteeEmails.size} selected)</h2>
          {invitees.length > 0 && (
            <button type="button" onClick={handleSelectAll} className={styles.selectAllButton}>
              {selectedInviteeEmails.size === invitees.length ? "Deselect All" : "Select All"}
            </button>
          )}
          <ul className={styles.inviteeList}>
            {invitees.map((invitee) => (
              <li key={invitee.id} className={styles.inviteeItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedInviteeEmails.has(invitee.email)}
                    onChange={() => handleCheckboxChange(invitee.email)}
                  />
                  {invitee.name} ({invitee.email})
                </label>
              </li>
            ))}
          </ul>
          {invitees.length === 0 && <p>No invitees found.</p>}
        </div>

        <div className={styles.composeSection}>
          <h2 className={styles.sectionTitle}>Compose Email</h2>
          <div className={styles.formGroup}>
            <label htmlFor="emailSubject">Subject:</label>
            <input
              type="text"
              id="emailSubject"
              value={emailSubject}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="emailBody">Body (HTML is supported):</label>
            <textarea
              id="emailBody"
              value={emailBody}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)}
              rows={10}
              required
            />
          </div>
        </div>

        {sendError && <p className={`${styles.error} ${styles.feedbackMessage}`}>{sendError}</p>}
        {sendSuccess && <p className={`${styles.success} ${styles.feedbackMessage}`}>{sendSuccess}</p>}

        <button type="submit" className={styles.sendButton} disabled={sendingEmail}>
          {sendingEmail ? "Sending..." : "Send Email"}
        </button>
      </form>
    </div>
  );
}