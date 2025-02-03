// app/api/guests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Using our centralized prisma instance
import type { Prisma } from "@prisma/client"; // Importing types if needed

// (Optional) Log the keys of the Prisma client for debugging purposes.
console.log("Prisma client keys:", Object.keys(prisma));

/**
 * GET: Fetch all guests with their related invitee and table details.
 */
export async function GET() {
  try {
    // Fetch guests along with their associated invitee and table data.
    const guests = await prisma.guest.findMany({
      include: { invitee: true, table: true },
    });
    return NextResponse.json(guests);
  } catch (error) {
    console.error("❌ GET guests error:", error);
    return new NextResponse("Error fetching guests", { status: 500 });
  }
}

/**
 * POST: Create a new guest record.
 *
 * Expected JSON body:
 * {
 *   "name": "Guest Name",
 *   "inviteeId": 1,
 *   "dietaryRestrictions": "None",
 *   "accessibilityInfo": "N/A",
 *   "isAttending": true
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      inviteeId,
      dietaryRestrictions,
      accessibilityInfo,
      isAttending,
    } = await req.json();

    // Validate required fields: `name` and `inviteeId` must be provided.
    if (!name || !inviteeId) {
      return new NextResponse(
        "Missing required fields: name and inviteeId are required.",
        { status: 400 }
      );
    }

    // Create a new guest record in the database.
    const newGuest = await prisma.guest.create({
      data: {
        name,
        inviteeId,
        dietaryRestrictions: dietaryRestrictions ?? null,
        accessibilityInfo: accessibilityInfo ?? null,
        isAttending: isAttending ?? null,
      },
    });

    return NextResponse.json(newGuest);
  } catch (error) {
    console.error("❌ POST guest error:", error);
    return new NextResponse("Error creating guest", { status: 500 });
  }
}
