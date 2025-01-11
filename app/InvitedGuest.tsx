"use client";

import { useState, useEffect } from "react";

export default function InvitedGuest() {
  const [token, setToken] = useState<string | null>(null);
  const [invitee, setInvitee] = useState<{
    name: string;
    maxInvites: number;
    guests: number;
    isAttending: boolean;
    dietaryRestrictions: string | null;
    accessibilityInfo: string | null;
    comments: string | null;
    songRequests: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track local states for the RSVP form
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [guests, setGuests] = useState<number>(0); // Default to 0 until maxInvites is known
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
  const [accessibilityInfo, setAccessibilityInfo] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [songRequests, setSongRequests] = useState<string>("");

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
        const response = await fetch(`/api/invitees/${token}`);
        if (!response.ok) {
          throw new Error("Invalid token. Please check your invitation link.");
        }
        const data = await response.json();
        setInvitee(data);

        // Initialize form fields from server
        setIsAttending(data.isAttending);
        setGuests(data.guests || data.maxInvites); // Default to maxInvites if guests are not set
        setDietaryRestrictions(data.dietaryRestrictions || "");
        setAccessibilityInfo(data.accessibilityInfo || "");
        setComments(data.comments || "");
        setSongRequests(data.songRequests || "");
      } catch (err) {
        console.error("Error fetching invitee:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred. Please try again.");
        }
      }
    };

    const tokenFromHash = extractTokenFromHash();
    if (tokenFromHash) {
      setToken(tokenFromHash);
      fetchInvitee(tokenFromHash);
    } else {
      setError("No token found in the URL. Please ensure you are using the correct invitation link.");
    }
  }, []);

  const handleAttendance = (attending: boolean) => {
    setIsAttending(attending);
    if (attending && invitee) {
      // Default guests to maxInvites if switching to "Yes"
      setGuests(invitee.maxInvites);
    } else {
      // Reset guests to 0 if not attending
      setGuests(0);
    }
  };

  const handleGuestsChange = (value: number) => {
    // Ensure guests are always between 1 and maxInvites
    if (invitee) {
      const validGuests = Math.max(1, Math.min(value, invitee.maxInvites));
      setGuests(validGuests);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      setError("Token is missing.");
      return;
    }

    try {
      const response = await fetch(`/api/invitees/${token}`, {
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
      {token ? (
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
                <strong>Max Guests Allowed:</strong> {invitee.maxInvites}
              </p>

              {/* Attendance selection */}
              <div className="mt-4">
                <label className="block font-semibold mb-2">
                  Will you be attending?
                </label>
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

              {/* Conditionally show the rest if attending */}
              {isAttending && (
                <div>
                  <div className="mt-4">
                    <label className="block font-semibold mb-2">
                      Guests Attending:
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={invitee.maxInvites}
                      value={guests}
                      onChange={(e) => handleGuestsChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center mt-2">{guests}</div>
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">
                      Dietary Restrictions:
                    </label>
                    <textarea
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="e.g., Vegan, Nut Allergy"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">
                      Accessibility Info:
                    </label>
                    <textarea
                      value={accessibilityInfo}
                      onChange={(e) => setAccessibilityInfo(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="e.g., Wheelchair access required"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">
                      Comments:
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full border px-2 py-1 rounded bg-white text-black"
                      placeholder="Any additional comments"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block font-semibold mb-2">
                      Song Requests:
                    </label>
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
            </div>
          ) : (
            <p className="text-blue-500 text-center">Validating your token...</p>
          )}
        </div>
      ) : (
        <p className="text-red-600 text-center font-semibold">{error}</p>
      )}
    </div>
  );
}
