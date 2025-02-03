// app/api/invitees/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path if needed

// GET all invitees (including their guest records)
export async function GET() {
  try {
    // Update the query to include guestsList
    const invitees = await prisma.invitee.findMany({
      include: { guestsList: true },
    });
    return NextResponse.json(invitees);
  } catch (error) {
    console.error("GET invitees error:", error);
    return new NextResponse("Error fetching invitees", { status: 500 });
  }
}

// Create a new invitee
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      guests,
      isAttending,
      maxInvites,
      dietaryRestrictions,
      accessibilityInfo,
      comments,
      songRequests,
    } = await req.json();

    // Basic checks for required fields
    if (!name || !email || guests === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let validMaxInvites = 0;
    if (typeof maxInvites === "number") {
      validMaxInvites = maxInvites;
    } else if (maxInvites === undefined) {
      validMaxInvites = 0;
    } else {
      return new NextResponse("Invalid 'maxInvites' field", { status: 400 });
    }

    const newInvitee = await prisma.invitee.create({
      data: {
        name,
        email,
        guests,
        isAttending,
        maxInvites: validMaxInvites,
        dietaryRestrictions: dietaryRestrictions ?? null,
        accessibilityInfo: accessibilityInfo ?? null,
        comments: comments ?? null,
        songRequests: songRequests ?? null,
      },
    });

    return NextResponse.json(newInvitee);
  } catch (error) {
    console.error("POST invitees error:", error);
    return new NextResponse("Error creating invitee", { status: 500 });
  }
}

// Delete an invitee by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id || typeof id !== "number") {
      return new NextResponse("Invalid or missing ID", { status: 400 });
    }

    await prisma.invitee.delete({ where: { id } });

    return new NextResponse("Invitee deleted successfully", { status: 200 });
  } catch (error) {
    console.error("DELETE invitee error:", error);
    return new NextResponse("Error deleting invitee", { status: 500 });
  }
}
