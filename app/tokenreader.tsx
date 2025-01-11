"use client";

import { useState, useEffect } from "react";

export default function TokenReader() {
  const [token, setToken] = useState<string | null>(null);
  const [invitee, setInvitee] = useState<{ name: string; guests: number; isAttending: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractTokenFromHash = () => {
    const hash = window.location.hash;
    if (hash.startsWith("#")) {
      return hash.substring(1); // Remove "#" and return the token
    }
    return null;
  };

  useEffect(() => {
    const fetchInvitee = async (token: string) => {
      try {
        console.log(`Fetching invitee for token: ${token}`);
        const response = await fetch(`/api/invitees/${token}`);
        if (!response.ok) {
          throw new Error("Invalid token");
        }
        const data = await response.json();
        setInvitee(data);
      } catch (err) {
        console.error("Error fetching invitee:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };

    const tokenFromHash = extractTokenFromHash();
    if (tokenFromHash) {
      setToken(tokenFromHash);
      fetchInvitee(tokenFromHash);
    } else {
      setError("No token found in the URL.");
    }
  }, []);

  return (
    <div className="p-4 border rounded">
      <h1 className="text-2xl font-bold mb-4">Token Validation</h1>
      {token ? (
        <div>
          <p className="text-lg">
            <strong>Token:</strong> {token}
          </p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {invitee ? (
            <div className="mt-4">
              <p className="text-green-600 text-lg">Token is valid!</p>
              <p>
                <strong>Name:</strong> {invitee.name}
              </p>
              <p>
                <strong>Number of Guests:</strong> {invitee.guests}
              </p>
              <p>
                <strong>Attending:</strong> {invitee.isAttending ? "Yes" : "No"}
              </p>
            </div>
          ) : (
            !error && <p className="text-gray-500 mt-2">Validating token...</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500">No token found in the URL.</p>
      )}
    </div>
  );
}
