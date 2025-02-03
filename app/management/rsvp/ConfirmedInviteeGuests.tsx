"use client";

import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import styles from "./ConfirmedInviteeGuests.module.css";
import AddGuestForm from "./AddGuestForm"; // Modal form for adding a guest

// Define the types for Invitee and Guest based on your Prisma schema.
interface Guest {
  id: number;
  name: string;
  inviteeId: number;
  // Additional fields if needed.
}

export interface Invitee {
  id: number;
  name: string;
  email: string;
  isAttending: boolean | null;
  guests: number; // Expected number of guest records for this invitee
  guestsList?: Guest[]; // The actual guest records (should be returned from your API)
}

export default function ConfirmedInviteeGuests() {
  const [confirmedInvitees, setConfirmedInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInvitee, setActiveInvitee] = useState<Invitee | null>(null);

  useEffect(() => {
    async function fetchInvitees() {
      try {
        const res = await fetch("/api/invitees"); // Ensure this endpoint includes guestsList
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data: Invitee[] = await res.json();
        // Filter to only include confirmed invitees (those with isAttending true)
        const confirmed = data.filter((invitee) => invitee.isAttending === true);
        setConfirmedInvitees(confirmed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchInvitees();
  }, []);

  if (loading) return <p className="text-center">Loading confirmed invitees...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className={styles.container}>
      <h2>Confirmed Invitee Guest Records</h2>
      {confirmedInvitees.length === 0 ? (
        <p>No confirmed invitees found.</p>
      ) : (
        <ul className={styles.inviteeList}>
          {confirmedInvitees.map((invitee) => {
            // Determine how many guest records currently exist.
            const currentGuestCount = invitee.guestsList ? invitee.guestsList.length : 0;
            // Calculate how many guest records are missing.
            const missingGuests = invitee.guests - currentGuestCount;

            return (
              <li key={invitee.id} className={styles.inviteeItem}>
                <div className={styles.inviteeInfo}>
                  <strong>{invitee.name}</strong> (<em>{invitee.email}</em>)
                </div>
                <div className={styles.guestSummary}>
                  <span>
                    Expected Guests: {invitee.guests} | Recorded: {currentGuestCount}
                  </span>
                  {missingGuests > 0 && (
                    <span className={styles.missing}>
                      {" "}
                      - Missing {missingGuests} guest{missingGuests > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {/* List out each guest with edit and delete icons */}
                {invitee.guestsList && invitee.guestsList.length > 0 && (
                  <ul className={styles.guestList}>
                    {invitee.guestsList.map((guest) => (
                      <li key={guest.id} className={styles.guestItem}>
                        <span>{guest.name}</span>
                        <FaEdit
                          className={styles.editIcon}
                          onClick={() => {
                            const newName = prompt("Edit guest name:", guest.name);
                            if (newName && newName !== guest.name) {
                              // Update guest logic: call API to update guest
                              fetch(`/api/guests/${guest.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: newName }),
                              })
                                .then((res) => {
                                  if (!res.ok) {
                                    throw new Error("Failed to update guest");
                                  }
                                  return res.json();
                                })
                                .then((updatedGuest) => {
                                  // Update local state
                                  setConfirmedInvitees((prev) =>
                                    prev.map((inv) => {
                                      if (inv.id === invitee.id && inv.guestsList) {
                                        return {
                                          ...inv,
                                          guestsList: inv.guestsList.map((g) =>
                                            g.id === guest.id ? updatedGuest : g
                                          ),
                                        };
                                      }
                                      return inv;
                                    })
                                  );
                                })
                                .catch((error) => {
                                  console.error("Error updating guest:", error);
                                  alert("Error updating guest");
                                });
                            }
                          }}
                          title="Edit Guest"
                        />
                        <FaTrash
                          className={styles.deleteIcon}
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${guest.name}?`)) {
                              try {
                                const res = await fetch(`/api/guests/${guest.id}`, {
                                  method: "DELETE",
                                });
                                if (!res.ok) {
                                  throw new Error("Failed to delete guest");
                                }
                                // Remove the guest from state
                                setConfirmedInvitees((prev) =>
                                  prev.map((inv) => {
                                    if (inv.id === invitee.id) {
                                      return {
                                        ...inv,
                                        guestsList: inv.guestsList?.filter(
                                          (g) => g.id !== guest.id
                                        ),
                                      };
                                    }
                                    return inv;
                                  })
                                );
                              } catch (error) {
                                console.error("Error deleting guest:", error);
                                alert("Error deleting guest");
                              }
                            }
                          }}
                          title="Delete Guest"
                        />
                      </li>
                    ))}
                  </ul>
                )}
                {missingGuests > 0 && (
                  <button
                    className={styles.addGuestButton}
                    onClick={() => setActiveInvitee(invitee)}
                  >
                    Add Guest
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Conditionally render the AddGuestForm modal */}
      {activeInvitee && (
        <AddGuestForm
          inviteeId={activeInvitee.id}
          inviteeName={activeInvitee.name}
          onClose={() => setActiveInvitee(null)}
          onGuestAdded={(newGuest) => {
            // Convert newGuest to type Guest by adding inviteeId from activeInvitee.
            const guestWithInviteeId = { ...newGuest, inviteeId: activeInvitee.id };
            // Update the confirmedInvitees state to reflect the added guest.
            setConfirmedInvitees((prev) =>
              prev.map((inv) => {
                if (inv.id === activeInvitee.id) {
                  return {
                    ...inv,
                    guestsList: inv.guestsList
                      ? [...inv.guestsList, guestWithInviteeId]
                      : [guestWithInviteeId],
                  };
                }
                return inv;
              })
            );
          }}
        />
      )}
    </div>
  );
}
