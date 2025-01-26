"use client";

import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import EditInviteeForm from "./EditInviteeForm";
import { Invitee } from "@/app/types";

export default function AdminTiles() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);

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

      const updated = invitees.filter((_, i) => i !== index);
      setInvitees(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invitee.");
    }
  };

  const handleEditClick = (invitee: Invitee) => {
    setEditingInvitee(invitee); // Use the full Invitee object, including createdAt
  };

  const handleEditSubmit = async (updatedInvitee: Invitee) => {
    try {
      const response = await fetch(`/api/invitees/${updatedInvitee.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInvitee),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const updatedFromServer: Invitee = await response.json();

      const updatedData = invitees.map((iv) =>
        iv.id === updatedFromServer.id ? updatedFromServer : iv
      );
      setInvitees(updatedData);
      setEditingInvitee(null);
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
          {invitees.map((invitee, index) => (
            <div key={invitee.id} className="bg-white p-4 rounded shadow">
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
