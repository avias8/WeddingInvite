"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import "./EditInviteeForm.css"; // Import the CSS file
import { EditFormInvitee } from "@/app/types";

interface EditInviteeFormProps {
  invitee: EditFormInvitee;
  onSubmit: (updatedInvitee: EditFormInvitee) => Promise<void>;
  onCancel: () => void;
}

export default function EditInviteeForm({
  invitee,
  onSubmit,
  onCancel,
}: EditInviteeFormProps) {
  const [formData, setFormData] = useState<EditFormInvitee>({ ...invitee });
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle changes for various fields.
   * We handle numeric fields (guests, maxInvites) by parseInt,
   * and isAttending with a tri-state approach if needed.
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // If the field is numeric
    if (name === "guests" || name === "maxInvites") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
      return;
    }

    // If the field isAttending (boolean | null)
    if (name === "isAttending") {
      setFormData((prev) => ({
        ...prev,
        isAttending:
          value === "true" ? true : value === "false" ? false : null,
      }));
      return;
    }

    // Otherwise store string directly
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Validate and submit the form
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    try {
      // We call the parent prop onSubmit — it returns a Promise<void>
      await onSubmit({
        ...formData,
        maxInvites: formData.maxInvites || 0,
        dietaryRestrictions: formData.dietaryRestrictions ?? null,
        accessibilityInfo: formData.accessibilityInfo ?? null,
        songRequests: formData.songRequests ?? null,
        comments: formData.comments ?? null,
      });
    } catch (err: any) {
      setError(err.message || "Error updating invitee.");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="modal-form">
        <h2>Edit Invitee</h2>
        {error && <p className="text-red-500">{error}</p>}

        {/* Name */}
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Attending */}
        <div className="form-group">
          <label>Attending:</label>
          <select
            name="isAttending"
            value={
              formData.isAttending == null
                ? "false" // default to "No" if null
                : formData.isAttending
                ? "true"
                : "false"
            }
            onChange={handleChange}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
            {/* If you wanted a true tri-state: 
                <option value="null">No Response</option> 
               then handle that in the code above */}
          </select>
        </div>

        {/* Guests */}
        <div className="form-group">
          <label>Guests:</label>
          <input
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            required
          />
        </div>

        {/* Max Invites */}
        <div className="form-group">
          <label>Max Invites:</label>
          <input
            type="number"
            name="maxInvites"
            value={formData.maxInvites}
            onChange={handleChange}
            required
          />
        </div>

        {/* Dietary Restrictions */}
        <div className="form-group">
          <label>Dietary Restrictions:</label>
          <input
            type="text"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* Accessibility Info */}
        <div className="form-group">
          <label>Accessibility Info:</label>
          <input
            type="text"
            name="accessibilityInfo"
            value={formData.accessibilityInfo ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* Song Requests */}
        <div className="form-group">
          <label>Song Requests:</label>
          <input
            type="text"
            name="songRequests"
            value={formData.songRequests ?? ""}
            onChange={handleChange}
          />
        </div>

        {/* Comments */}
        <div className="form-group">
          <label>Comments:</label>
          <input
            type="text"
            name="comments"
            value={formData.comments ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="sectionButton btn-save">
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="sectionButton btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
