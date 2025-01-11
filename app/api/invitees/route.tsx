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
      songRequests,
    } = await req.json();

    if (!name || !email || guests === undefined || isAttending === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
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
        songRequests: songRequests || null,
      },
    });

    return NextResponse.json(newInvitee);
  } catch (error) {
    console.error("POST invitees error:", error);
    return new NextResponse("Error creating invitee", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      id,
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

    // Validate required fields
    if (!id || typeof id !== "number") {
      return new NextResponse("Invalid or missing ID", { status: 400 });
    }

    const updatedInvitee = await prisma.invitee.update({
      where: { id },
      data: {
        name,
        email,
        guests,
        isAttending,
        maxInvites: maxInvites || 0,
        dietaryRestrictions: dietaryRestrictions || null,
        accessibilityInfo: accessibilityInfo || null,
        comments: comments || null,
        songRequests: songRequests || null,
      },
    });

    return NextResponse.json(updatedInvitee);
  } catch (error) {
    console.error("PUT invitee error:", error);
    return new NextResponse("Error updating invitee", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // Validate the ID
    if (!id || typeof id !== "number") {
      return new NextResponse("Invalid or missing ID", { status: 400 });
    }

    // Delete the invitee by ID
    await prisma.invitee.delete({
      where: { id },
    });

    return new NextResponse("Invitee deleted successfully", { status: 200 });
  } catch (error) {
    console.error("DELETE invitee error:", error);
    return new NextResponse("Error deleting invitee", { status: 500 });
  }
}