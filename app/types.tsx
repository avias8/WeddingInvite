// app/types.ts

/**
 * Represents an invitation entity, often corresponding to a household or primary invitee.
 */
export type Invitee = {
  id: number; // Unique database ID for the invitee record
  name: string; // Name of the primary invitee or group
  email: string; // Contact email address
  /**
   * RSVP status: true (Attending), false (Not Attending), null (No Response).
   * Corresponds to Prisma: Boolean?
   */
  isAttending: boolean | null;
  /**
   * Number of guests confirmed attending under this invitation.
   * Corresponds to Prisma: Int @default(1)
   */
  guests: number;
  /**
   * Timestamp when the invitee record was created.
   * Typically sent from server as an ISO string.
   * Corresponds to Prisma: DateTime @default(now())
   */
  createdAt: string;
  /**
   * Unique token associated with this invitation for RSVP links.
   * Corresponds to Prisma: String @unique @default(uuid())
   */
  token: string;
  /**
   * Maximum number of people allowed in this invitation party.
   * Corresponds to Prisma: Int (required)
   */
  maxInvites: number;
  /**
   * Timestamp when the invitee last submitted/updated their RSVP.
   * Can be null if no response yet. Typically an ISO string.
   * Corresponds to Prisma: DateTime?
   */
  respondedAt: string | null;
  /**
   * Dietary restrictions noted by the invitee party.
   * Corresponds to Prisma: String?
   */
  dietaryRestrictions: string | null;
  /**
   * Accessibility information noted by the invitee party.
   * Corresponds to Prisma: String?
   */
  accessibilityInfo: string | null;
  /**
   * General comments from the invitee party.
   * Corresponds to Prisma: String?
   */
  comments: string | null;
  /**
   * Song requests from the invitee party.
   * Corresponds to Prisma: String?
   */
  songRequests: string | null;
  /**
   * Timestamp when the invitation email was first opened (tracked via pixel).
   * Can be null. Typically an ISO string.
   * Corresponds to Prisma: DateTime?
   */
  emailOpenedAt: string | null;
  /**
   * Timestamp when the invitation email was sent.
   * Can be null. Typically an ISO string.
   * Corresponds to Prisma: DateTime?
   */
  emailSentAt: string | null;
};

/**
* Represents an individual guest attending under an Invitee record.
* Includes optional fields for details provided during RSVP or assignment.
*/
export interface Guest {
  id: number; // Unique database ID for the guest record
  name: string; // Name of the individual guest
  tableId: number | null; // DB ID of the table assigned (null if unassigned)
  inviteeId: number; // DB ID of the Invitee this guest belongs to (Required based on schema)

  // *** ADDED Optional fields to match Prisma Schema & fix tooltip errors ***
  dietaryRestrictions?: string | null; // Optional dietary notes for this guest
  accessibilityInfo?: string | null; // Optional accessibility notes for this guest
  isAttending?: boolean | null;      // Guest-specific attendance (if tracked separately, otherwise use Invitee's)
}

/**
* Represents a table at the venue.
*/
export interface Table {
  id: number; // Unique database ID for the table record
  name: string; // Display name of the table (e.g., "Table 1", "Head Table")
  capacity: number; // Maximum number of seats at the table
}
