"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie"; // For managing cookies on the client side

export default function InvitedGuest() {
  const [token, setToken] = useState<string | null>(null);
  const [lookupValue, setLookupValue] = useState<string>("");
  const [invitee, setInvitee] = useState<{
    name: string;
    email: string; // Added email field
    maxInvites: number;
    guests: number;
    isAttending: boolean;
    dietaryRestrictions: string | null;
    accessibilityInfo: string | null;
    comments: string | null;
    songRequests: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
  const [accessibilityInfo, setAccessibilityInfo] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [songRequests, setSongRequests] = useState<string>("");

  // Extract token from URL hash
  const extractTokenFromHash = () => {
    const hash = window.location.hash;
    if (hash.startsWith("#")) {
      return hash.substring(1); // Remove "#" and return the token
    }
    return null;
  };

  // Save the token to cookies
  const saveTokenToCookies = (token: string) => {
    Cookies.set("inviteToken", token, { expires: 7 }); // Expires in 7 days
  };

  // Clear the token from cookies
  const clearTokenFromCookies = () => {
    Cookies.remove("inviteToken");
    setToken(null);
    setInvitee(null);
    setError("Token cache cleared. Please re-enter your token.");
  };

  // Fetch invitee data
  const fetchInvitee = async (lookupToken: string) => {
    try {
      const response = await fetch(`/api/invitees/${lookupToken}`);
      if (!response.ok) {
        throw new Error("No invitation found for the provided token.");
      }
      const data = await response.json();
      setInvitee(data);

      // Set invitee details
      setIsAttending(data.isAttending);
      setGuests(data.guests || data.maxInvites);
      setDietaryRestrictions(data.dietaryRestrictions || "");
      setAccessibilityInfo(data.accessibilityInfo || "");
      setComments(data.comments || "");
      setSongRequests(data.songRequests || "");

      // Save token to cookies
      saveTokenToCookies(lookupToken);
    } catch (err) {
      console.error("Error fetching invitee:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  // Initialize token and fetch data
  useEffect(() => {
    const tokenFromHash = extractTokenFromHash();
    const cachedToken = Cookies.get("inviteToken");

    if (tokenFromHash) {
      setToken(tokenFromHash);
      fetchInvitee(tokenFromHash);
    } else if (cachedToken) {
      setToken(cachedToken);
      fetchInvitee(cachedToken);
    }
  }, []);

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      setError("Please enter your Invitation Token.");
      return;
    }
    setError(null);
    await fetchInvitee(lookupValue.trim());
  };

  const handleAttendance = (attending: boolean) => {
    setIsAttending(attending);
    if (attending && invitee) {
      setGuests(invitee.maxInvites);
    } else {
      setGuests(0);
    }
  };

  const handleGuestsChange = (value: number) => {
    if (invitee) {
      const validGuests = Math.max(1, Math.min(value, invitee.maxInvites));
      setGuests(validGuests);
    }
  };

  const handleSubmit = async () => {
    if (!token && !lookupValue) {
      setError("Invitation Token is missing.");
      return;
    }

    try {
      const response = await fetch(`/api/invitees/${token || lookupValue}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAttending,
          guests,
          dietaryRestrictions,
          accessibilityInfo,
          comments,
          songRequests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update RSVP. Please try again.");
      }

      alert("RSVP updated successfully!");
    } catch (err) {
      console.error("Error updating RSVP:", err);
      setError("An error occurred while updating your RSVP.");
    }
  };

  return (
    <div className="p-6 border rounded shadow-lg max-w-md mx-auto bg-white">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Welcome to the Event!
      </h1>

      {!token && !invitee && (
        <div className="mb-6">
          <p className="text-gray-600 text-center mb-4">
            Enter your <strong>Invitation Token</strong> to access your RSVP details.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              placeholder="Enter your Invitation Token"
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleLookup}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Lookup
            </button>
          </div>
          {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
        </div>
      )}

      {token || invitee ? (
        <div>
          {error ? (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          ) : invitee ? (
            <div>
              <p className="text-lg font-semibold text-green-700 mb-4">
                Invitation Validated!
              </p>
              <p className="text-gray-800">
                <strong>Name:</strong> {invitee.name}
              </p>
              <p className="text-gray-800">
                <strong>Email:</strong> {invitee.email}
              </p>
              <p className="text-gray-800">
                <strong>Max Guests Allowed:</strong> {invitee.maxInvites}
              </p>

              <div className="mt-4">
                <label className="block font-semibold mb-2">Will you be attending?</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAttendance(true)}
                    className={`px-4 py-2 font-semibold rounded ${
                      isAttending === true ? "bg-green-600 text-white" : "bg-gray-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleAttendance(false)}
                    className={`px-4 py-2 font-semibold rounded ${
                      isAttending === false ? "bg-red-600 text-white" : "bg-gray-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {isAttending && (
                <div>
                  <div className="mt-4">
                    <label className="block font-semibold mb-2">Guests Attending:</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleGuestsChange(Math.max(1, guests - 1))}
                        className="px-3 py-1 bg-gray-300 rounded"
                        disabled={guests <= 1}
                      >
                        -
                      </button>
                      <span className="text-lg">{guests}</span>
                      <button
                        onClick={() => handleGuestsChange(Math.min(invitee.maxInvites, guests + 1))}
                        className="px-3 py-1 bg-gray-300 rounded"
                        disabled={guests >= invitee.maxInvites}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">Dietary Restrictions:</label>
                    <textarea
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="e.g., Vegan, Nut Allergy"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">Accessibility Info:</label>
                    <textarea
                      value={accessibilityInfo}
                      onChange={(e) => setAccessibilityInfo(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="e.g., Wheelchair access required"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">Comments:</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="Any additional comments"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">Song Requests:</label>
                    <textarea
                      value={songRequests}
                      onChange={(e) => setSongRequests(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="e.g., Your favorite songs"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold"
              >
                Submit RSVP
              </button>
              <button
                onClick={clearTokenFromCookies}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full font-semibold"
              >
                This isn&apos;t the right person
              </button>
            </div>
          ) : (
            <p className="text-blue-500 text-center">Validating your token...</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
