"use client"; // Marks this file as a client component

import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import EditInviteeForm from "../EditInviteeForm"; // Correct path for EditInviteeForm component

// Define the Invitee type
type Invitee = {
  id: number;
  name: string;
  email: string;
  isAttending: boolean;
  guests: number;
  token: string;
  maxInvites: number;
  respondedAt: string | null; // Optional field
  dietaryRestrictions: string | null; // Optional field
  accessibilityInfo: string | null; // Optional field
  comments: string | null; // Optional field
  songRequests: string | null; // Optional field
};

export default function AdminPage() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);

  useEffect(() => {
    const fetchInvitees = async () => {
      try {
        const response = await fetch("/api/invitees");
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data: Invitee[] = await response.json();
        setInvitees(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
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

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      // Update the UI by removing the invitee
      const updatedInvitees = invitees.filter((_, i) => i !== index);
      setInvitees(updatedInvitees);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invitee.");
    }
  };

  const handleEditClick = (invitee: Invitee) => {
    setEditingInvitee(invitee); // Open the editing form with the selected invitee
  };

  const handleEditSubmit = async (updatedInvitee: Invitee) => {
    try {
      const response = await fetch("/api/invitees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvitee),
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      // Update the invitee list in the UI
      const updatedInvitees = invitees.map((i) =>
        i.id === updatedInvitee.id ? updatedInvitee : i
      );
      setInvitees(updatedInvitees);
      setEditingInvitee(null); // Close the editing form
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit invitee.");
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6">Admin View - Invitees</h1>
      {invitees.length === 0 ? (
        <p className="text-center text-gray-500">No invitees found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitees.map((i, index) => (
            <div key={i.id} className="bg-white p-4 rounded shadow">
              <div className="tile-header">
                <span>{i.name}</span>
                <div className="actions">
                  <FaEdit
                    className="edit-icon"
                    onClick={() => handleEditClick(i)}
                  />
                  <FaTrash
                    className="trash-icon"
                    onClick={() => handleRemovePerson(i.id, index)}
                  />
                </div>
              </div>
              <p>
                <strong>Email:</strong> {i.email}
              </p>
              <p>
                <strong>Attending:</strong> {i.isAttending ? "Yes" : "No"}
              </p>
              <p>
                <strong>Guests:</strong> {i.guests}/{i.maxInvites}
              </p>
              <p>
                <strong>Dietary Restrictions:</strong>{" "}
                {i.dietaryRestrictions || "None"}
              </p>
              <p>
                <strong>Accessibility Info:</strong>{" "}
                {i.accessibilityInfo || "None"}
              </p>
              <p>
                <strong>Song Requests:</strong> {i.songRequests || "None"}
              </p>
              <p>
                <strong>Comments:</strong> {i.comments || "None"}
              </p>
              <p>
                <strong>Token:</strong> {i.token || "None"}
              </p>
              <p>
                <strong>Invite Link:</strong>{" "}
                <a
                  href={`${window.location.origin}/invited#${i.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
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
          invitee={editingInvitee}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingInvitee(null)}
        />
      )}

      <style jsx>{`
        .tile {
          position: relative;
        }
        .tile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .trash-icon,
        .edit-icon {
          cursor: pointer;
        }
        .trash-icon {
          color: red;
        }
        .edit-icon {
          color: blue;
        }
      `}</style>
    </div>
  );
}