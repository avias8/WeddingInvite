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

    if (!name || !email || guests === undefined) {
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    const {
      isAttending,
      guests,
      dietaryRestrictions,
      accessibilityInfo,
      comments,
      songRequests,
    } = await req.json();

    if (isAttending === undefined && guests === undefined) {
      return new NextResponse("isAttending or guests are required", {
        status: 400,
      });
    }
    

    const updatedInvitee = await prisma.invitee.update({
      where: { token },
      data: {
        isAttending,
        guests,
        dietaryRestrictions: dietaryRestrictions || null,
        accessibilityInfo: accessibilityInfo || null,
        comments: comments || null,
        songRequests: songRequests || null,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json(updatedInvitee);
  } catch (error) {
    console.error("Error updating invitee:", error);

    if (error instanceof Error && error.message.includes("No record found")) {
      return new NextResponse("Invitee not found", { status: 404 });
    }

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