"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, useMemo, useRef } from 'react';
import styles from './GuestSelector.module.css'; // Using the existing CSS module
import type { Invitee, Guest } from '@/app/types'; // Adjust path if necessary

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestIdentified: (guest: { id: number; name: string; inviteeId: number }) => void;
  context?: 'upload' | 'photoFeed'; // Optional: to slightly change messaging
}

interface InviteeWithGuests extends Invitee {
  guestsList?: Guest[];
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
  const [selectedInvitee, setSelectedInvitee] = useState<InviteeWithGuests | null>(null);
  const [guestsOfSelectedInvitee, setGuestsOfSelectedInvitee] = useState<Guest[]>([]);
  const [finalSelectedGuestId, setFinalSelectedGuestId] = useState<string>('');

  const [isUsingCustomName, setIsUsingCustomName] = useState<boolean>(false);
  const [customNameValue, setCustomNameValue] = useState<string>('');

  // For the combobox-like family input
  const [familySearchTerm, setFamilySearchTerm] = useState<string>('');
  const [isFamilyListVisible, setIsFamilyListVisible] = useState<boolean>(false);
  const familyInputRef = useRef<HTMLInputElement>(null);
  const familyListRef = useRef<HTMLDivElement>(null);


  // Fetch all invitees when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all states
      setIsLoading(true);
      setMessage(null);
      setStep('inviteeSelect');
      setSelectedInvitee(null);
      setGuestsOfSelectedInvitee([]);
      setFinalSelectedGuestId('');
      setIsUsingCustomName(false);
      setCustomNameValue('');
      setFamilySearchTerm('');
      setIsFamilyListVisible(false);

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
            const sortedInvitees = [...attendingInvitees].sort((a, b) => 
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
            setAllInvitees(sortedInvitees);
          }
        })
        .catch(err => {
          setMessage(err instanceof Error ? err.message : "An unknown error occurred.");
          setStep('errorState');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  // Filter invitees based on search term for the combobox
  const filteredInvitees = useMemo(() => {
    if (!familySearchTerm && !isFamilyListVisible) { // Don't show all if input is empty and not focused
        return [];
    }
    if (!familySearchTerm) { // Show all if input is empty but focused/visible
        return allInvitees;
    }
    return allInvitees.filter(invitee =>
      invitee.name.toLowerCase().includes(familySearchTerm.toLowerCase())
    );
  }, [allInvitees, familySearchTerm, isFamilyListVisible]);

  // Handle clicking outside the custom family combobox to close the list
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        familyInputRef.current && !familyInputRef.current.contains(event.target as Node) &&
        familyListRef.current && !familyListRef.current.contains(event.target as Node)
      ) {
        setIsFamilyListVisible(false);
      }
    }
    if (isFamilyListVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFamilyListVisible]);


  // Function to handle selecting an invitee (family/party)
  const selectInvitee = (inviteeToSelect: InviteeWithGuests | null) => {
    if (inviteeToSelect) {
      setSelectedInvitee(inviteeToSelect);
      setFamilySearchTerm(inviteeToSelect.name); // Update input to show selected family
      setIsFamilyListVisible(false); // Hide the list
      setMessage(null);
      setIsUsingCustomName(false);
      setCustomNameValue('');
      setFinalSelectedGuestId('');

      const guests = inviteeToSelect.guestsList || [];
      setGuestsOfSelectedInvitee(guests);

      if (guests.length === 0) {
        if (inviteeToSelect.maxInvites === 1) {
          onGuestIdentified({ id: inviteeToSelect.id, name: inviteeToSelect.name, inviteeId: inviteeToSelect.id });
          onClose();
          return;
        } else {
          setMessage(`No guest names are currently listed for ${inviteeToSelect.name}'s party. You can enter your name below, or contact the hosts.`);
          setStep('guestSelect');
          setIsUsingCustomName(true);
          setFinalSelectedGuestId(inviteeToSelect.id.toString()); // Placeholder
          return;
        }
      } else if (guests.length === 1) {
        setFinalSelectedGuestId(guests[0].id.toString());
        setCustomNameValue(guests[0].name);
        setStep('guestSelect');
      } else {
        setStep('guestSelect');
      }
    } else { // Deselecting
      setSelectedInvitee(null);
      setGuestsOfSelectedInvitee([]);
      setFinalSelectedGuestId('');
      setStep('inviteeSelect');
    }
  };
  
  const handleFamilySearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setFamilySearchTerm(term);
    setIsFamilyListVisible(true); // Show list when typing
    // If user clears input, deselect current family
    if (term === '') {
      setSelectedInvitee(null);
      setGuestsOfSelectedInvitee([]);
      setFinalSelectedGuestId('');
      setStep('inviteeSelect'); // Go back to family selection step UI
    } else {
        // If typing again after a selection, clear previous selection to force re-selection from list
        if (selectedInvitee && term !== selectedInvitee.name) {
            setSelectedInvitee(null);
            setGuestsOfSelectedInvitee([]);
            setFinalSelectedGuestId('');
            setStep('inviteeSelect');
        }
    }
  };


  useEffect(() => {
    if (finalSelectedGuestId && !isUsingCustomName && guestsOfSelectedInvitee.length > 0) {
      const guest = guestsOfSelectedInvitee.find(g => g.id.toString() === finalSelectedGuestId);
      if (guest) {
        setCustomNameValue(guest.name);
      }
    } else if (!finalSelectedGuestId && !isUsingCustomName) {
        setCustomNameValue('');
    }
  }, [finalSelectedGuestId, guestsOfSelectedInvitee, isUsingCustomName]);


  const handleGuestConfirmation = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null); 

    if (!selectedInvitee) { // This check should be based on selectedInvitee, not just selectedInviteeId
        setMessage("Please select your family/party first.");
        setStep('inviteeSelect'); // Or highlight the family input
        if(familyInputRef.current) familyInputRef.current.focus();
        return;
    }

    if (guestsOfSelectedInvitee.length === 0 && isUsingCustomName && customNameValue.trim()) {
        onGuestIdentified({ 
            id: selectedInvitee.id, 
            name: customNameValue.trim(), 
            inviteeId: selectedInvitee.id 
        });
        onClose();
        return;
    }
    
    if (!isUsingCustomName && !finalSelectedGuestId) {
        setMessage("Please select your name from the list.");
        setStep('guestSelect');
        return;
    }

    if (isUsingCustomName && !customNameValue.trim()) {
        setMessage("Please enter your preferred name.");
        setStep('guestSelect'); 
        return;
    }

    const originalGuest = guestsOfSelectedInvitee.find(g => g.id.toString() === finalSelectedGuestId);
    let nameToUse = '';
    let guestIdToUse = 0;

    if (isUsingCustomName) {
        nameToUse = customNameValue.trim();
        guestIdToUse = originalGuest ? originalGuest.id : selectedInvitee.id; 
    } else {
        if (!originalGuest) {
            setMessage("Selected guest not found. Please try again or select your family again.");
            setStep('errorState'); 
            return;
        }
        nameToUse = originalGuest.name;
        guestIdToUse = originalGuest.id;
    }

    if (!nameToUse) { 
      setMessage("Name cannot be empty.");
      setStep('guestSelect');
      return;
    }

    onGuestIdentified({ id: guestIdToUse, name: nameToUse, inviteeId: selectedInvitee.id });
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

            {(step === 'inviteeSelect' || step === 'guestSelect') && allInvitees.length > 0 ? (
              <>
                {/* Combined Family Search Input and Dropdown */}
                <div className={styles.formGroup} style={{ position: 'relative' }}>
                  <label htmlFor="familySearchInput" className={styles.label}>
                    {selectedInvitee ? "Selected Family / Party:" : "Search & Select Your Family / Party Name:"}
                  </label>
                  <input
                    type="text"
                    id="familySearchInput"
                    ref={familyInputRef}
                    value={familySearchTerm}
                    onChange={handleFamilySearchChange}
                    onFocus={() => setIsFamilyListVisible(true)}
                    placeholder="Type your family/party name..."
                    className={styles.input}
                    autoComplete="off"
                    disabled={step === 'guestSelect' && !!selectedInvitee} // Disable if family selected and on guest step
                  />
                  {isFamilyListVisible && filteredInvitees.length > 0 && !selectedInvitee && ( // Only show list if no family is firmly selected yet
                    <div ref={familyListRef} className={styles.familyListDropdown}>
                      {filteredInvitees.map((inv) => (
                        <div
                          key={inv.id}
                          className={styles.familyListItem}
                          onClick={() => selectInvitee(inv)}
                          onMouseDown={(e) => e.preventDefault()} // Prevents input blur before click
                        >
                          {inv.name} (Party of {inv.maxInvites})
                        </div>
                      ))}
                    </div>
                  )}
                   {isFamilyListVisible && familySearchTerm && filteredInvitees.length === 0 && !selectedInvitee && (
                     <div ref={familyListRef} className={styles.familyListDropdown}>
                        <div className={styles.familyListItemDisabled}>No families match your search.</div>
                     </div>
                   )}
                </div>
                {selectedInvitee && step === 'inviteeSelect' && ( /* User selected a family, prompt to move to guest */
                     <button type="button" onClick={() => setStep('guestSelect')} className={styles.secondaryButton}>
                        Next: Select Guest Name
                    </button>
                )}


                {/* Guest Selection Section - only if a family has been selected */}
                {selectedInvitee && step === 'guestSelect' && (
                  <>
                    {guestsOfSelectedInvitee.length > 0 && (
                      <div className={styles.formGroup}>
                        <label htmlFor="guestSelector" className={styles.label}>Select Your Name:</label>
                        <select
                          id="guestSelector"
                          value={finalSelectedGuestId}
                          onChange={(e) => {
                              setFinalSelectedGuestId(e.target.value);
                              if (!isUsingCustomName) {
                                  const guest = guestsOfSelectedInvitee.find(g => g.id.toString() === e.target.value);
                                  setCustomNameValue(guest ? guest.name : '');
                              }
                          }}
                          className={styles.select}
                          required={!isUsingCustomName}
                        >
                          <option value="">-- Select Your Name --</option>
                          {guestsOfSelectedInvitee.map((guest) => (
                            <option key={guest.id} value={guest.id.toString()}>
                              {guest.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {(guestsOfSelectedInvitee.length > 0 || (guestsOfSelectedInvitee.length === 0 && selectedInvitee)) && (
                         <div className={styles.formGroup}>
                            <div className={styles.customNameToggle}>
                            <input
                                type="checkbox"
                                id="useCustomName"
                                checked={isUsingCustomName}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setIsUsingCustomName(checked);
                                    if (!checked && selectedGuestForDisplay) {
                                        setCustomNameValue(selectedGuestForDisplay.name);
                                    } else if (checked && selectedGuestForDisplay && !customNameValue) {
                                        setCustomNameValue(selectedGuestForDisplay.name);
                                    } else if (checked && !selectedGuestForDisplay && guestsOfSelectedInvitee.length === 0 && selectedInvitee) {
                                        setCustomNameValue(''); 
                                    } else if (!checked && !selectedGuestForDisplay){
                                        setCustomNameValue('');
                                    }
                                }}
                                className={styles.checkbox}
                            />
                            <label htmlFor="useCustomName" className={styles.checkboxLabel}>
                                {guestsOfSelectedInvitee.length > 0 ? "Use a different name / My name isn't listed correctly" : "Enter your name"}
                            </label>
                            </div>
                        </div>
                    )}

                    {isUsingCustomName && ( 
                      <div className={styles.formGroup}>
                        <label htmlFor="customNameInput" className={styles.label}>Your Name:</label>
                        <input
                          type="text"
                          id="customNameInput"
                          value={customNameValue}
                          onChange={(e) => setCustomNameValue(e.target.value)}
                          className={styles.input}
                          placeholder="Enter your full name"
                          required={isUsingCustomName}
                        />
                      </div>
                    )}
                  </>
                )}
                
                {selectedInvitee && step === 'guestSelect' && (finalSelectedGuestId || (isUsingCustomName && customNameValue.trim())) && (
                    <button 
                        type="submit" 
                        className={styles.submitButton} 
                        disabled={
                            (!finalSelectedGuestId && !isUsingCustomName) || 
                            (isUsingCustomName && !customNameValue.trim()) 
                        }
                    >
                    Confirm Identity
                    </button>
                )}
                 {selectedInvitee && (
                    <button 
                        type="button" 
                        onClick={() => {
                            setFamilySearchTerm('');
                            selectInvitee(null); // This will reset family selection states
                        }}
                        className={styles.secondaryButton}
                        style={{marginTop: '0.5rem'}}
                    >
                        Change Family/Party
                    </button>
                )}
              </>
            ) : null}

            {!isLoading && allInvitees.length === 0 && step !== 'errorState' && step !== 'infoState' && (
                 <p className={styles.modalInstructions}>No invitee data found. Please contact the event hosts.</p>
            )}

            {(step === 'errorState' || step === 'infoState') && !message && (
                 <p className={styles.modalInstructions}>
                    {step === 'errorState' ? "An error occurred. Please try again or contact the hosts." : "Please follow the instructions above or contact the hosts if you have trouble."}
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