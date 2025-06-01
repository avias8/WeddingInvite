// app/components/GuestSelector.tsx
"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import styles from './GuestSelector.module.css';
import type { Invitee, Guest } from '@/app/types'; // Assuming your types are in this path

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestIdentified: (guest: { id: number; name: string; inviteeId: number }) => void;
  // Optional: to pre-fill token if known by parent
  initialToken?: string;
}

interface InviteeWithGuests extends Invitee {
  guestsList?: Guest[];
}

export default function GuestSelector({
  isOpen,
  onClose,
  onGuestIdentified,
  initialToken = "",
}: GuestSelectorProps) {
  const [token, setToken] = useState<string>(initialToken);
  const [step, setStep] = useState<'tokenInput' | 'guestSelect' | 'noGuests' | 'error'>('tokenInput');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteeData, setInviteeData] = useState<InviteeWithGuests | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');

  useEffect(() => {
    // Reset state when modal is reopened or closed, or initial token changes
    if (isOpen) {
      setToken(initialToken);
      setStep('tokenInput');
      setError(null);
      setInviteeData(null);
      setSelectedGuestId('');
    }
  }, [isOpen, initialToken]);

  const handleTokenSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter your invitation token.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setInviteeData(null);

    try {
      const response = await fetch(`/api/invitees/${token.trim()}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Invitation token not found. Please check your token and try again.");
        }
        throw new Error("Failed to fetch invitation details. Please try again later.");
      }
      const data: InviteeWithGuests = await response.json();

      if (!data.isAttending) {
        setError("This RSVP indicates you are not attending. Social features are for attending guests.");
        setStep('error');
        setIsLoading(false);
        return;
      }
      
      setInviteeData(data);

      // Check if guestsList exists and has entries
      // The API /api/invitees/[token] should ideally return guestsList if the relation is set up in Prisma
      // For now, we assume it might be missing or needs to be fetched separately if not included.
      // A more robust API `/api/auth/identify-guest-via-token` would handle this logic.
      // For this component, let's simulate based on what /api/invitees/[token] would give if guestsList is included.

      // To properly get guestsList, you might need to adjust the /api/invitees/[token]
      // to include guestsList: e.g., prisma.invitee.findUnique({ where: {token}, include: { guestsList: true }})
      
      // SIMULATED: Assuming data.guestsList is populated by the API
      // If your API doesn't populate guestsList, this part needs adjustment or a different API call.
      // For now, we'll rely on the Invitee.guests count and Invitee.name as a fallback for single-guest parties if guestsList is empty.

      const guestsAssociated = await fetch(`/api/guests?inviteeId=${data.id}`);
      if (!guestsAssociated.ok) {
          console.warn("Could not fetch specific guest records for this invitee. Falling back to invitee details.");
          // Fallback logic if guestsList isn't directly available or fetchable this way
           if (data.guests === 1 && data.name) {
                // This is a simplification. Ideally, a Guest record should exist.
                // The `onGuestIdentified` expects a Guest ID. We are using invitee.id as a placeholder if no guest record exists
                // This implies that the backend for like/comment might need to handle an "inviteeId" if a "guestId" isn't found
                // OR the admin process ensures a Guest record is created for the main invitee.
                // For now, we'll assume a primary guest record might share the invitee's name and needs an ID.
                // This part is a bit of a hack due to not having the actual guest record ID.
                // A dedicated API for identification would solve this better.
                
                // Let's try to find if a guest record matches the invitee name
                const primaryGuest = data.guestsList?.find(g => g.name.toLowerCase() === data.name.toLowerCase());
                if (primaryGuest) {
                    onGuestIdentified({ id: primaryGuest.id, name: primaryGuest.name, inviteeId: data.id });
                    onClose();
                } else if (data.guestsList && data.guestsList.length === 1) { // If only one guest record, assume it's the one
                    onGuestIdentified({ id: data.guestsList[0].id, name: data.guestsList[0].name, inviteeId: data.id });
                    onClose();
                } else if (data.guestsList && data.guestsList.length > 1) {
                    setStep('guestSelect');
                    setSelectedGuestId(data.guestsList[0].id.toString());
                } else {
                     // If no specific guest records, and it's a single guest party
                     // This scenario is problematic as we need a Guest.id.
                     // The backend "identify" API should handle creating a Guest record for the Invitee if one doesn't exist.
                    setError("Could not identify a specific guest. Please ensure guest details are complete in the RSVP or contact hosts.");
                    setStep('error');
                }
           } else if (data.guestsList && data.guestsList.length > 0) {
                setStep('guestSelect');
                if (data.guestsList.length > 0) {
                    setSelectedGuestId(data.guestsList[0].id.toString());
                }
           } else {
                setError("No specific guest records found for this invitation, or party size is zero. Please contact hosts if this is an error.");
                setStep('noGuests');
           }

      } else {
        const specificGuests: Guest[] = await guestsAssociated.json();
        if (specificGuests && specificGuests.length > 0) {
            setInviteeData(prev => prev ? { ...prev, guestsList: specificGuests } : null);
            setStep('guestSelect');
            setSelectedGuestId(specificGuests[0].id.toString());
        } else if (data.guests === 1 && data.name) {
            // Fallback if no specific guest records, and it's a single-guest party
            // This is still less than ideal as it relies on creating/finding a Guest record implicitly.
            // A dedicated API like `/api/auth/identify-guest-via-token` should handle this better.
            // For now, we'll assume a placeholder or that an admin has created a guest record for the invitee.
            // The `onGuestIdentified` needs a proper guest ID.
            // Let's prompt for admin action here.
            setError(`No specific guest record for ${data.name}. An admin may need to add them to the guest list for this RSVP.`);
            setStep('error');
        } else {
            setError("No guest details found for this invitation. Please contact the hosts.");
            setStep('noGuests');
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSelectionSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId || !inviteeData || !inviteeData.guestsList) {
      setError("Please select a guest.");
      return;
    }
    const guest = inviteeData.guestsList.find(g => g.id.toString() === selectedGuestId);
    if (guest) {
      onGuestIdentified({ id: guest.id, name: guest.name, inviteeId: inviteeData.id });
      onClose();
    } else {
      setError("Selected guest not found. Please try again.");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          &times;
        </button>

        {isLoading && <p className={styles.loadingText}>Verifying...</p>}
        {error && <p className={styles.errorText}>{error}</p>}

        {step === 'tokenInput' && !isLoading && (
          <form onSubmit={handleTokenSubmit}>
            <h3 className={styles.modalTitle}>Identify Yourself</h3>
            <p className={styles.modalInstructions}>
              Please enter your invitation token to like and comment on photos.
              This token is found in your wedding invitation email.
            </p>
            <div className={styles.formGroup}>
              <label htmlFor="inviteToken" className={styles.label}>Invitation Token:</label>
              <input
                type="text"
                id="inviteToken"
                value={token}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                className={styles.input}
                placeholder="Enter your token"
                required
              />
            </div>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Token"}
            </button>
          </form>
        )}

        {step === 'guestSelect' && inviteeData && inviteeData.guestsList && inviteeData.guestsList.length > 0 && !isLoading && (
          <form onSubmit={handleGuestSelectionSubmit}>
            <h3 className={styles.modalTitle}>Who are you, {inviteeData.name}&apos;s party?</h3>
            <p className={styles.modalInstructions}>Select your name from the list to continue.</p>
            <div className={styles.formGroup}>
              <label htmlFor="guestSelector" className={styles.label}>Select Your Name:</label>
              <select
                id="guestSelector"
                value={selectedGuestId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedGuestId(e.target.value)}
                className={styles.select}
                required
              >
                {inviteeData.guestsList.map((guest) => (
                  <option key={guest.id} value={guest.id.toString()}>
                    {guest.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={styles.submitButton}>
              Confirm Identity
            </button>
          </form>
        )}
        {step === 'noGuests' && !isLoading && (
            <div>
                <h3 className={styles.modalTitle}>Guest Details Needed</h3>
                <p className={styles.modalInstructions}>
                    It seems specific guest names haven&apos;t been added for this invitation yet.
                    Please ask the wedding hosts to update the guest list for your party.
                </p>
                <button onClick={onClose} className={styles.submitButton}>Okay</button>
            </div>
        )}
         {step === 'error' && !isLoading && (
             <div>
                <button onClick={onClose} className={styles.submitButton}>Close</button>
            </div>
         )}
      </div>
    </div>
  );
}