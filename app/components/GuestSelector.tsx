// app/components/GuestSelector.tsx
"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import styles from './GuestSelector.module.css'; // Using the existing CSS module
import type { Invitee, Guest } from '@/app/types'; // Adjust path if necessary

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestIdentified: (guest: { id: number; name: string; inviteeId: number }) => void;
  context?: 'upload' | 'photoFeed'; // Optional: to slightly change messaging
}

interface InviteeWithGuests extends Invitee {
  guestsList?: Guest[]; // Expect this from the API: GET /api/invitees
}

export default function GuestSelector({
  isOpen,
  onClose,
  onGuestIdentified,
  context = 'photoFeed',
}: GuestSelectorProps) {
  const [step, setStep] = useState<'inviteeSelect' | 'guestSelect' | 'errorState' | 'infoState'>('inviteeSelect');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const [allInvitees, setAllInvitees] = useState<InviteeWithGuests[]>([]);
  const [selectedInviteeId, setSelectedInviteeId] = useState<string>('');
  const [selectedInvitee, setSelectedInvitee] = useState<InviteeWithGuests | null>(null);
  const [guestsOfSelectedInvitee, setGuestsOfSelectedInvitee] = useState<Guest[]>([]);
  const [finalSelectedGuestId, setFinalSelectedGuestId] = useState<string>('');

  // State for custom name input
  const [isUsingCustomName, setIsUsingCustomName] = useState<boolean>(false);
  const [customNameValue, setCustomNameValue] = useState<string>('');

  // Fetch all invitees when the modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setMessage(null);
      setStep('inviteeSelect');
      setSelectedInviteeId('');
      setSelectedInvitee(null);
      setGuestsOfSelectedInvitee([]);
      setFinalSelectedGuestId('');
      setIsUsingCustomName(false); // Reset custom name state
      setCustomNameValue('');    // Reset custom name state

      fetch('/api/invitees') 
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch invitee list. Please try again.');
          }
          return res.json();
        })
        .then((data: InviteeWithGuests[]) => {
          const attendingInvitees = data.filter(inv => inv.isAttending === true || inv.isAttending === null);
          if (attendingInvitees.length === 0) {
            setMessage("No attending or pending invitees found to select from.");
            setStep('infoState');
            setAllInvitees([]);
          } else {
            setAllInvitees(attendingInvitees);
          }
        })
        .catch(err => {
          setMessage(err instanceof Error ? err.message : "An unknown error occurred.");
          setStep('errorState');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  // Handle Invitee (Family) Selection
  const handleInviteeSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const inviteeId = e.target.value;
    setSelectedInviteeId(inviteeId);
    setMessage(null);
    setIsUsingCustomName(false); // Reset custom name when family changes
    setCustomNameValue('');

    if (inviteeId) {
      const foundInvitee = allInvitees.find(inv => inv.id.toString() === inviteeId);
      if (foundInvitee) {
        setSelectedInvitee(foundInvitee);
        const guests = foundInvitee.guestsList || [];
        setGuestsOfSelectedInvitee(guests);

        if (guests.length === 0) {
          if (foundInvitee.guests === 1) {
             setMessage(`No specific guest names found for ${foundInvitee.name}'s party. We'll assume you are ${foundInvitee.name}.`);
             setStep('infoState');
             onGuestIdentified({ id: foundInvitee.id, name: foundInvitee.name, inviteeId: foundInvitee.id });
             onClose();
             return;
          } else {
            setMessage(`No guest names are currently listed for ${foundInvitee.name}'s party. Please contact the hosts to update details.`);
            setStep('infoState');
            setFinalSelectedGuestId('');
            return;
          }
        } else if (guests.length === 1) {
          setFinalSelectedGuestId(guests[0].id.toString());
          setCustomNameValue(guests[0].name); // Pre-fill custom name input
          // Do not auto-submit here, let them confirm or customize name
          setStep('guestSelect');
        } else {
          setFinalSelectedGuestId(guests.length > 0 ? guests[0].id.toString() : '');
          if (guests.length > 0) {
            setCustomNameValue(guests.find(g => g.id.toString() === (guests[0].id.toString()))?.name || '');
          }
          setStep('guestSelect');
        }
      } else {
        setSelectedInvitee(null);
        setGuestsOfSelectedInvitee([]);
        setStep('inviteeSelect');
      }
    } else {
      setSelectedInvitee(null);
      setGuestsOfSelectedInvitee([]);
      setFinalSelectedGuestId('');
      setStep('inviteeSelect');
    }
  };

  // Update customNameValue when finalSelectedGuestId changes and not using custom name
  useEffect(() => {
    if (finalSelectedGuestId && !isUsingCustomName) {
      const guest = guestsOfSelectedInvitee.find(g => g.id.toString() === finalSelectedGuestId);
      if (guest) {
        setCustomNameValue(guest.name);
      }
    }
  }, [finalSelectedGuestId, guestsOfSelectedInvitee, isUsingCustomName]);


  // Handle Final Guest Selection and Submission
  const handleGuestConfirmation = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInvitee || !finalSelectedGuestId) {
      setMessage("Please select your family and then your name.");
      setStep('errorState');
      return;
    }
    
    const originalGuest = guestsOfSelectedInvitee.find(g => g.id.toString() === finalSelectedGuestId);
    if (!originalGuest) {
      setMessage("Selected guest not found. Please try again.");
      setStep('errorState');
      return;
    }

    const nameToUse = (isUsingCustomName && customNameValue.trim()) ? customNameValue.trim() : originalGuest.name;

    if (!nameToUse) {
        setMessage("Name cannot be empty.");
        // Optionally keep them on guestSelect step if custom name was attempted and failed
        setStep('guestSelect'); 
        return;
    }

    onGuestIdentified({ id: originalGuest.id, name: nameToUse, inviteeId: selectedInvitee.id });
    onClose();
  };
  
  const getActionText = () => {
    return context === 'upload' ? "upload photos" : "like and comment";
  };

  if (!isOpen) {
    return null;
  }

  const selectedGuestForDisplay = guestsOfSelectedInvitee.find(g => g.id.toString() === finalSelectedGuestId);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          &times;
        </button>

        {isLoading && <div className={styles.loadingSpinnerContainer}><div className={styles.loadingSpinner}></div><p>Loading details...</p></div>}
        
        {!isLoading && (
          <form onSubmit={handleGuestConfirmation} className={styles.form}>
            <h3 className={styles.modalTitle}>Identify Yourself to {getActionText()}</h3>
            
            {message && <p className={`${styles.messageBox} ${step === 'errorState' ? styles.errorText : styles.infoText}`}>{message}</p>}

            {step === 'inviteeSelect' || step === 'guestSelect' ? (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="inviteeSelector" className={styles.label}>Select Your Family / Party Name:</label>
                  <select
                    id="inviteeSelector"
                    value={selectedInviteeId}
                    onChange={handleInviteeSelectionChange}
                    className={styles.select}
                    required={step === 'inviteeSelect'}
                    disabled={allInvitees.length === 0}
                  >
                    <option value="">-- Select Family/Party --</option>
                    {allInvitees.map((inv) => (
                      <option key={inv.id} value={inv.id.toString()}>
                        {inv.name} (Party of {inv.maxInvites})
                      </option>
                    ))}
                  </select>
                </div>

                {step === 'guestSelect' && selectedInvitee && guestsOfSelectedInvitee.length > 0 && (
                  <>
                    <div className={styles.formGroup}>
                      <label htmlFor="guestSelector" className={styles.label}>Select Your Name:</label>
                      <select
                        id="guestSelector"
                        value={finalSelectedGuestId}
                        onChange={(e) => {
                            setFinalSelectedGuestId(e.target.value);
                            // If not using custom name, prefill with selected guest's name
                            if (!isUsingCustomName) {
                                const guest = guestsOfSelectedInvitee.find(g => g.id.toString() === e.target.value);
                                setCustomNameValue(guest ? guest.name : '');
                            }
                        }}
                        className={styles.select}
                        required
                      >
                        <option value="">-- Select Your Name --</option>
                        {guestsOfSelectedInvitee.map((guest) => (
                          <option key={guest.id} value={guest.id.toString()}>
                            {guest.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {finalSelectedGuestId && (
                      <div className={styles.formGroup}>
                        <div className={styles.customNameToggle}>
                          <input
                            type="checkbox"
                            id="useCustomName"
                            checked={isUsingCustomName}
                            onChange={(e) => {
                              setIsUsingCustomName(e.target.checked);
                              if (!e.target.checked && selectedGuestForDisplay) {
                                // If unchecking, revert customNameValue to the selected guest's actual name
                                setCustomNameValue(selectedGuestForDisplay.name);
                              } else if (e.target.checked && selectedGuestForDisplay && !customNameValue) {
                                // If checking and customNameValue is empty, prefill from selected guest
                                setCustomNameValue(selectedGuestForDisplay.name);
                              }
                            }}
                            className={styles.checkbox}
                          />
                          <label htmlFor="useCustomName" className={styles.checkboxLabel}>
                            Use a different name for this session?
                          </label>
                        </div>
                      </div>
                    )}

                    {isUsingCustomName && finalSelectedGuestId && (
                      <div className={styles.formGroup}>
                        <label htmlFor="customNameInput" className={styles.label}>Preferred Name:</label>
                        <input
                          type="text"
                          id="customNameInput"
                          value={customNameValue}
                          onChange={(e) => setCustomNameValue(e.target.value)}
                          className={styles.input}
                          placeholder="Enter your preferred name"
                        />
                      </div>
                    )}
                  </>
                )}
                
                {step === 'guestSelect' && guestsOfSelectedInvitee.length > 0 && (
                   <button type="submit" className={styles.submitButton} disabled={!finalSelectedGuestId || (isUsingCustomName && !customNameValue.trim())}>
                     Confirm Identity
                   </button>
                )}
              </>
            ) : null}

            {(step === 'errorState' || step === 'infoState') && !message && (
                 <p className={styles.modalInstructions}>
                    {step === 'errorState' ? "An error occurred. Please try again or contact the hosts." : "Please follow the instructions above."}
                 </p>
            )}
             {(step === 'errorState' || step === 'infoState') && (
                <button type="button" onClick={onClose} className={styles.submitButton} style={{marginTop: '1rem', backgroundColor: 'var(--color-text-secondary)'}}>
                  Close
                </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
