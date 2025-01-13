import { useState } from "react";
import "./EditInviteeForm.css"; // Import the CSS file

type Invitee = {
  id: number;
  name: string;
  email: string;
  guests: number;
  isAttending: boolean;
  maxInvites?: number;
  dietaryRestrictions?: string | null;
  accessibilityInfo?: string | null;
  songRequests?: string | null;
  comments?: string | null;
  token: string;
  respondedAt: string | null;
};

interface EditInviteeFormProps {
  invitee: {
    id: number;
    name: string;
    email: string;
    isAttending: boolean;
    guests: number;
    token: string;
    maxInvites: number;
    respondedAt: string | null;
    dietaryRestrictions: string | null;
    accessibilityInfo: string | null;
    comments: string | null;
    songRequests: string | null;
  };
  onSubmit: (updatedInvitee: {
    id: number;
    name: string;
    email: string;
    isAttending: boolean;
    guests: number;
    token: string;
    maxInvites: number;
    respondedAt: string | null;
    dietaryRestrictions: string | null;
    accessibilityInfo: string | null;
    comments: string | null;
    songRequests: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function EditInviteeForm({ invitee, onSubmit, onCancel }: EditInviteeFormProps) {
  const [formData, setFormData] = useState<Invitee>({ ...invitee });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "guests" || name === "maxInvites" ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email) {
      setError("Name and email are required.");
      return;
    }

    onSubmit({
      ...formData,
      maxInvites: formData.maxInvites || 0,
      dietaryRestrictions: formData.dietaryRestrictions || null,
      accessibilityInfo: formData.accessibilityInfo || null,
      songRequests: formData.songRequests || null,
      comments: formData.comments || null,
    });
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
            value={formData.isAttending ? "Yes" : "No"}
            onChange={handleChange}
            required
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
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
            value={formData.dietaryRestrictions || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Accessibility Info:</label>
          <input
            type="text"
            name="accessibilityInfo"
            value={formData.accessibilityInfo || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Song Requests:</label>
          <input
            type="text"
            name="songRequests"
            value={formData.songRequests || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Comments:</label>
          <input
            type="text"
            name="comments"
            value={formData.comments || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">Save</button>
          <button type="button" onClick={onCancel} className="btn-cancel">Cancel</button>
        </div>
      </form>
    </div>
  );
}