import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/invitees/[token]
 * Fetch a single invitee by token
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params; // lazy-loaded params

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invitee = await prisma.invitee.findUnique({
      where: { token },
    });

    if (!invitee) {
      return NextResponse.json({ error: "Invitee not found" }, { status: 404 });
    }

    return NextResponse.json(invitee);
  } catch (error) {
    console.error("Error fetching invitee by token:", error);
    return NextResponse.json(
      { error: "Error fetching invitee" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invitees/[token]
 * Update invitee fields by token
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Destructure the request body
    const {
      name,
      email,
      maxInvites,
      isAttending,
      guests,
      dietaryRestrictions,
      accessibilityInfo,
      comments,
      songRequests,
    } = await request.json();

    // Build an updateData object that only sets a property if it's provided
    const updateData: Prisma.InviteeUpdateInput = {};

    if (name !== undefined) {
      updateData.name = name;
    }
    if (email !== undefined) {
      updateData.email = email;
    }
    if (maxInvites !== undefined) {
      updateData.maxInvites = maxInvites;
    }
    if (isAttending !== undefined) {
      updateData.isAttending = isAttending;
    }
    if (guests !== undefined) {
      updateData.guests = guests;
    }
    if (dietaryRestrictions !== undefined) {
      updateData.dietaryRestrictions = dietaryRestrictions ?? null;
    }
    if (accessibilityInfo !== undefined) {
      updateData.accessibilityInfo = accessibilityInfo ?? null;
    }
    if (comments !== undefined) {
      updateData.comments = comments ?? null;
    }
    if (songRequests !== undefined) {
      updateData.songRequests = songRequests ?? null;
    }

    // Optionally update 'respondedAt' every time
    updateData.respondedAt = new Date();

    try {
      const updatedInvitee = await prisma.invitee.update({
        where: { token },
        data: updateData,
      });
      return NextResponse.json(updatedInvitee);
    } catch (error: unknown) {
      // If you want to handle 'not found' errors
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as any).code === "P2025"
      ) {
        return NextResponse.json({ error: "Invitee not found" }, {
          status: 404,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error updating invitee:", error);
    return NextResponse.json(
      { error: "Error updating invitee" },
      { status: 500 }
    );
  }
}
