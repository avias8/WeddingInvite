// app/api/guests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path if needed
import type { Prisma } from "@prisma/client"; // Only import types if needed


// (Optional) Log the keys of the prisma client for debugging.
console.log("Prisma client keys:", Object.keys(prisma));

/**
 * GET: Fetch all guests with their related invitee and table details.
 */
export async function GET() {
  try {
    // Make sure to use `prisma.guest` (lowercase)
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

    // Validate required fields.
    if (!name || !inviteeId) {
      return new NextResponse(
        "Missing required fields: name and inviteeId are required.",
        { status: 400 }
      );
    }

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
