"use client";

import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaEnvelope } from "react-icons/fa"; // Envelope icon for sending invites
import EditInviteeForm from "./EditInviteeForm";
import { Invitee } from "@/app/types";
import generateInviteHTML from "@/app/components/InviteTemplate"; // Import email template

export default function AdminTiles() {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);

  // New state for search and filter functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

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

  // Updated: Remove invitee by id rather than using the index
  const handleRemovePerson = async (id: number) => {
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

      // Remove by id from the original array
      setInvitees((prev) => prev.filter((iv) => iv.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invitee.");
    }
  };

  const handleEditClick = (invitee: Invitee) => {
    setEditingInvitee(invitee);
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

  /**
   * ✅ Send Invite Email
   * Calls the API to send an email to the invitee.
   */
  const handleSendInvite = async (invitee: Invitee) => {
    const inviteLink = `${window.location.origin}/invited#${invitee.token}`;
    const emailBody = generateInviteHTML(invitee.name, inviteLink, invitee.token);

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: invitee.email,
          subject: "You're Invited!",
          htmlContent: emailBody,
          token: invitee.token, // ✅ Pass token to update emailSentAt
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      alert(`✅ Invite sent to ${invitee.email}!`);

      // ✅ Update local state to reflect email sent time
      setInvitees((prev) =>
        prev.map((iv) =>
          iv.id === invitee.id ? { ...iv, emailSentAt: new Date().toISOString() } : iv
        )
      );
    } catch (err) {
      console.error("❌ Error sending invite:", err);
      alert("❌ Failed to send invite.");
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  // Filter invitees based on search query and selected filter option
  const filteredInvitees = invitees.filter((invitee) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      invitee.name.toLowerCase().includes(searchLower) ||
      invitee.email.toLowerCase().includes(searchLower);

    let matchesFilter = true;
    if (filter === "attending") {
      matchesFilter = invitee.isAttending === true;
    } else if (filter === "notAttending") {
      matchesFilter = invitee.isAttending === false;
    } else if (filter === "noResponse") {
      matchesFilter = invitee.isAttending === null;
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6">Admin View - Invitees</h1>
      
      {/* Search and Filter UI */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded mb-2 sm:mb-0 sm:mr-2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">All Invitees</option>
          <option value="attending">Attending</option>
          <option value="notAttending">Not Attending</option>
          <option value="noResponse">No Response</option>
        </select>
      </div>

      {filteredInvitees.length === 0 ? (
        <p className="text-center text-gray-500">No invitees found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvitees.map((invitee) => (
            <div key={invitee.id} className="bg-white p-4 rounded shadow">
              <div className="tile-header">
                <strong>{invitee.name}</strong>
                <div className="actions">
                  <FaEnvelope
                    className="invite-icon"
                    onClick={() => handleSendInvite(invitee)}
                    title="Send Invite"
                  />
                  <FaEdit
                    className="edit-icon"
                    onClick={() => handleEditClick(invitee)}
                  />
                  <FaTrash
                    className="trash-icon"
                    onClick={() => handleRemovePerson(invitee.id)}
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
              <p>
                <strong>Email Sent:</strong>{" "}
                {invitee.emailSentAt
                  ? new Date(invitee.emailSentAt).toLocaleString()
                  : "Not Sent"}
              </p>
              <p>
                <strong>Email Opened:</strong>{" "}
                {invitee.emailOpenedAt
                  ? new Date(invitee.emailOpenedAt).toLocaleString()
                  : "Not Opened"}
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
        .edit-icon,
        .invite-icon {
          cursor: pointer;
        }
        .trash-icon {
          color: red;
        }
        .edit-icon {
          color: blue;
        }
        .invite-icon {
          color: green;
        }
      `}</style>
    </div>
  );
}