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
  const [invitees, setInvitees] = useState<Invitee[]>([]); // Properly typed state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchInvitees = async () => {
      try {
        const response = await fetch("/api/invitees"); // API endpoint
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data: Invitee[] = await response.json(); // Specify the expected response type
        setInvitees(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        setLoading(false);
      }
    };

    fetchInvitees();
  }, []); // Empty dependency array to fetch data on component mount

  // Render loading state, error message, or invitees list
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin - All Invitees</h1>
      {invitees.length === 0 ? (
        <p>No invitees found.</p>
      ) : (
        invitees.map((i) => (
          <div key={i.id} className="mb-4 border-b pb-2">
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
              <strong>Number of Guests:</strong> {i.guests}
            </p>
            <p>
              <strong>Max Invites:</strong> {i.maxInvites}
            </p>
            <p>
              <strong>Responded At:</strong>{" "}
              {i.respondedAt ? new Date(i.respondedAt).toLocaleString() : "Not Responded"}
            </p>
            <p>
              <strong>Dietary Restrictions:</strong> {i.dietaryRestrictions || "None"}
            </p>
            <p>
              <strong>Accessibility Info:</strong> {i.accessibilityInfo || "None"}
            </p>
            <p>
              <strong>Comments:</strong> {i.comments || "None"}
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
                className="text-blue-600 underline"
              >
                {window.location.origin}/invited#{i.token}
              </a>
            </p>
          </div>
        ))
      )}
    </div>
  );
}
