import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET: Fetch all guests
 */
export async function GET() {
  try {
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
 * ✅ POST: Add a new guest under an invitee
 */
export async function POST(req: NextRequest) {
  try {
    const { name, inviteeId, dietaryRestrictions, accessibilityInfo, isAttending } = await req.json();

    if (!name || !inviteeId) {
      return new NextResponse("Missing required fields", { status: 400 });
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