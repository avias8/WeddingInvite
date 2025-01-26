// app/management/components/AdminTiles.tsx

"use client";

import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import EditInviteeForm from "./EditInviteeForm";
import { Invitee, EditFormInvitee } from "@/app/types"; 

// Import the external CSS file
import "./AdminTiles.css";

export default function AdminTiles() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We'll store the "editing invitee" as the form type (EditFormInvitee), 
  // since the form omits createdAt
  const [editingInvitee, setEditingInvitee] = useState<EditFormInvitee | null>(null);

  useEffect(() => {
    const fetchInvitees = async () => {
      try {
        const res = await fetch("/api/invitees");
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data: Invitee[] = await res.json();
        setInvitees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitees();
  }, []);

  const handleRemovePerson = async (id: number, index: number) => {
    if (!window.confirm("Are you sure you want to delete this invitee?")) return;

    try {
      const response = await fetch("/api/invitees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // remove from local state
      const updated = invitees.filter((_, i) => i !== index);
      setInvitees(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invitee.");
    }
  };

  /**
   * The user wants to edit a full Invitee (with createdAt),
   * but the form expects an EditFormInvitee (omitting createdAt).
   */
  const handleEditClick = (fullInvitee: Invitee) => {
    // Destructure out 'createdAt' so the form doesn't see it
    const { createdAt, ...formSafe } = fullInvitee;
    setEditingInvitee(formSafe);
  };

  /**
   * The form calls onSubmit(updatedInvitee),
   * which is an EditFormInvitee (missing createdAt).
   */
  const handleEditSubmit = async (updatedInvitee: EditFormInvitee) => {
    try {
      // 1. Merge back the 'createdAt' from our local array if we want to keep it
      const original = invitees.find((iv) => iv.id === updatedInvitee.id);
      if (!original) {
        throw new Error("Invitee not found in local state.");
      }
      // Combine them to get a full object that matches 'Invitee'
      const merged: Invitee = { ...original, ...updatedInvitee };

      // 2. PUT to the dynamic route with the full object
      const response = await fetch(`/api/invitees/${merged.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Optionally, read the updated record from the response
      const updatedFromServer: Invitee = await response.json();

      // 3. Update local state
      const updatedData = invitees.map((iv) =>
        iv.id === updatedFromServer.id ? updatedFromServer : iv
      );
      setInvitees(updatedData);

      setEditingInvitee(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit invitee.");
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin View - Invitees</h1>

      {invitees.length === 0 ? (
        <p className="text-center text-gray-500">No invitees found.</p>
      ) : (
        <div className="grid-container">
          {invitees.map((invitee, index) => (
            <div key={invitee.id} className="tile">
              <div className="tile-header">
                <strong>{invitee.name}</strong>
                <div className="actions">
                  <FaEdit
                    className="edit-icon"
                    onClick={() => handleEditClick(invitee)}
                  />
                  <FaTrash
                    className="trash-icon"
                    onClick={() => handleRemovePerson(invitee.id, index)}
                  />
                </div>
              </div>
              <p>
                <strong>Email:</strong> {invitee.email}
              </p>
              <p>
                <strong>Attending:</strong>{" "}
                {invitee.isAttending === null
                  ? "No Response"
                  : invitee.isAttending
                  ? "Yes"
                  : "No"}
              </p>
              <p>
                <strong>Guests:</strong> {invitee.guests}/{invitee.maxInvites}
              </p>
              <p>
                <strong>Dietary Restrictions:</strong>{" "}
                {invitee.dietaryRestrictions || "None"}
              </p>
              <p>
                <strong>Accessibility Info:</strong>{" "}
                {invitee.accessibilityInfo || "None"}
              </p>
              <p>
                <strong>Song Requests:</strong> {invitee.songRequests || "None"}
              </p>
              <p>
                <strong>Comments:</strong> {invitee.comments || "None"}
              </p>
              <p>
                <strong>Token:</strong> {invitee.token}
              </p>
              <p>
                <strong>Invite Link:</strong>{" "}
                <a
                  href={`${window.location.origin}/invited#${invitee.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Invite
                </a>
              </p>
            </div>
          ))}
        </div>
      )}

      {editingInvitee && (
        <EditInviteeForm
          invitee={editingInvitee} // type: EditFormInvitee
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingInvitee(null)}
        />
      )}
    </div>
  );
}
