"use client"; // Marks this file as a client component

import { useEffect, useState } from "react";

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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6">Admin - Invitees</h1>
      {invitees.length === 0 ? (
        <p className="text-center text-gray-500">No invitees found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitees.map((i) => (
            <div key={i.id} className="bg-white p-4 rounded shadow">
              <p>
                <strong>Name:</strong> {i.name}
              </p>
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
                <strong>Dietary Restrictions:</strong> {i.dietaryRestrictions || "None"}
              </p>
              <p>
                <strong>Accessibility Info:</strong> {i.accessibilityInfo || "None"}
              </p>
              <p>
                <strong>Song Requests:</strong> {i.songRequests || "None"}
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
    </div>
  );
}
