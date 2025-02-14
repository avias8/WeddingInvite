// app/types.ts

export type Invitee = {
  id: number;
  name: string;
  email: string;
  /**
   * Prisma: Boolean? => can be true, false, or null
   */
  isAttending: boolean | null;
  /**
   * Prisma: Int @default(1) => always a number
   */
  guests: number;
  /**
   * Prisma: DateTime @default(now())
   * Typically sent to the client as a string in ISO format.
   */
  createdAt: string;
  /**
   * Prisma: String @unique @default(uuid())
   */
  token: string;
  /**
   * Prisma: Int (required) => always a number
   */
  maxInvites: number;
  /**
   * Prisma: DateTime? => can be null, or an ISO datetime string
   */
  respondedAt: string | null;
  /**
   * Prisma: String?
   */
  dietaryRestrictions: string | null;
  accessibilityInfo: string | null;
  comments: string | null;
  songRequests: string | null;
  /**
   * Prisma: DateTime? => can be null, or an ISO datetime string
   */
  emailOpenedAt: string | null;
  /**
   * Prisma: DateTime? => can be null, or an ISO datetime string
   */
  emailSentAt: string | null;
};

export interface Guest {
  id: number;
  name: string;
  tableId: number | null; // null if unassigned
  inviteeId?: number; // Make this optional
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
}
