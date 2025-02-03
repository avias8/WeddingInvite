"use client";

import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import styles from "./ConfirmedInviteeGuests.module.css";
import AddGuestForm from "./AddGuestForm";
import type { Invitee, Guest } from "@/app/types";

// Extend the Invitee type to include guestsList
interface ExtendedInvitee extends Invitee {
  guestsList?: Guest[];
}

export default function ConfirmedInviteeGuests() {
  const [confirmedInvitees, setConfirmedInvitees] = useState<ExtendedInvitee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInvitee, setActiveInvitee] = useState<ExtendedInvitee | null>(null);

  useEffect(() => {
    async function fetchInvitees() {
      try {
        const res = await fetch("/api/invitees");
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data: Invitee[] = await res.json();
        // Cast fetched data to ExtendedInvitee[]
        const extendedData = data as ExtendedInvitee[];
        const confirmed: ExtendedInvitee[] = extendedData
          .filter((invitee) => invitee.isAttending === true)
          .map((invitee) => ({
            ...invitee,
            guestsList: invitee.guestsList
              ? invitee.guestsList.map((guest: any) => ({
                  id: guest.id,
                  name: guest.name,
                  tableId: guest.tableId,
                  inviteeId: invitee.id,
                }))
              : [],
          }));
        
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
            const currentGuestCount = invitee.guestsList ? invitee.guestsList.length : 0;
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
                                  const fixedGuest: Guest = { ...updatedGuest, inviteeId: invitee.id };
                                  setConfirmedInvitees((prev) =>
                                    prev.map((inv) => {
                                      if (inv.id === invitee.id && inv.guestsList) {
                                        return {
                                          ...inv,
                                          guestsList: inv.guestsList.map((g) =>
                                            g.id === guest.id ? fixedGuest : g
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
                                setConfirmedInvitees((prev) =>
                                  prev.map((inv) => {
                                    if (inv.id === invitee.id) {
                                      return {
                                        ...inv,
                                        guestsList: inv.guestsList?.filter((g) => g.id !== guest.id),
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

      {activeInvitee && (
        <AddGuestForm
          inviteeId={activeInvitee.id}
          inviteeName={activeInvitee.name}
          onClose={() => setActiveInvitee(null)}
          onGuestAdded={(newGuest) => {
            const guestWithInviteeId: Guest = { ...newGuest, inviteeId: activeInvitee.id };
            setConfirmedInvitees((prev) =>
              prev.map((inv) => {
                if (inv.id === activeInvitee.id) {
                  return {
                    ...inv,
                    guestsList: inv.guestsList ? [...inv.guestsList, guestWithInviteeId] : [guestWithInviteeId],
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