"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import "./EditInviteeForm.css"; // Import the CSS file
import { Invitee } from "@/app/types";

interface EditInviteeFormProps {
  invitee: Invitee;
  onSubmit: (updatedInvitee: Invitee) => Promise<void>;
  onCancel: () => void;
}

export default function EditInviteeForm({
  invitee,
  onSubmit,
  onCancel,
}: EditInviteeFormProps) {
  const [formData, setFormData] = useState<Invitee>({ ...invitee });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "guests" || name === "maxInvites") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
      return;
    }

    if (name === "isAttending") {
      setFormData((prev) => ({
        ...prev,
        isAttending:
          value === "true" ? true : value === "false" ? false : null,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        dietaryRestrictions: formData.dietaryRestrictions ?? null,
        accessibilityInfo: formData.accessibilityInfo ?? null,
        songRequests: formData.songRequests ?? null,
        comments: formData.comments ?? null,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="modal-form">
        <h2>Edit Invitee</h2>
        {error && <p className="text-red-500">{error}</p>}

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

        <div className="form-group">
          <label>Attending:</label>
          <select
            name="isAttending"
            value={
              formData.isAttending == null
                ? "null"
                : formData.isAttending
                ? "true"
                : "false"
            }
            onChange={handleChange}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
            <option value="null">No Response</option>
          </select>
        </div>

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

        <div className="form-group">
          <label>Dietary Restrictions:</label>
          <input
            type="text"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Accessibility Info:</label>
          <input
            type="text"
            name="accessibilityInfo"
            value={formData.accessibilityInfo ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Song Requests:</label>
          <input
            type="text"
            name="songRequests"
            value={formData.songRequests ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Comments:</label>
          <input
            type="text"
            name="comments"
            value={formData.comments ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Created At:</label>
          <input
            type="text"
            name="createdAt"
            value={formData.createdAt}
            readOnly
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Save
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
