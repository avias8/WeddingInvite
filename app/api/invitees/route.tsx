import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const invitees = await prisma.invitee.findMany();
    return NextResponse.json(invitees);
  } catch (error) {
    console.error("GET invitees error:", error);
    return new NextResponse("Error fetching invitees", { status: 500 });
  }
}

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
      songRequests
    } = await req.json();

    // Validate required fields
    if (!name || !email || guests === undefined || isAttending === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure `maxInvites` is a positive number
    if (maxInvites !== undefined && (typeof maxInvites !== "number" || maxInvites < 0)) {
      return new NextResponse("Invalid value for maxInvites", { status: 400 });
    }

    if (songRequests && typeof songRequests !== "string") {
      return new NextResponse("Invalid songRequests format", { status: 400 });
    }

    const newInvitee = await prisma.invitee.create({
      data: {
        name,
        email,
        guests,
        isAttending,
        maxInvites: maxInvites || 0,
        dietaryRestrictions: dietaryRestrictions || null,
        accessibilityInfo: accessibilityInfo || null,
        comments: comments || null,
        songRequests: songRequests || null, // Include the songRequests field
      },
    });
    

    return NextResponse.json(newInvitee);
  } catch (error) {
    console.error("POST invitees error:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return new NextResponse("Email or token already exists", { status: 409 });
    }

    return new NextResponse("Error creating invitee", { status: 500 });
  }
}
