import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: { token: string } }
) {
  const { params } = context;
  const { token } = await params; // Await the params

  if (!token) {
    return new NextResponse("Token is required", { status: 400 });
  }

  try {
    const invitee = await prisma.invitee.findUnique({
      where: { token },
    });

    if (!invitee) {
      return new NextResponse("Invitee not found", { status: 404 });
    }

    return NextResponse.json(invitee);
  } catch (error) {
    console.error("Error fetching invitee:", error);
    return new NextResponse("Error fetching invitee", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { token: string } }
) {
  const { params } = context;
  const { token } = await params; // Await the params

  if (!token) {
    return new NextResponse("Token is required", { status: 400 });
  }

  try {
    const {
      isAttending,
      guests,
      dietaryRestrictions,
      accessibilityInfo,
      comments,
      songRequests,
    } = await req.json();

    if (isAttending === undefined || guests === undefined) {
      return new NextResponse("isAttending and guests are required", {
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
