// app/api/guests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/guests/[id]
 * Fetch a single guest by ID.
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { invitee: true, table: true },
    });
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    return NextResponse.json(guest);
  } catch (error) {
    console.error("Error fetching guest:", error);
    return new NextResponse("Error fetching guest", { status: 500 });
  }
}

/**
 * PUT /api/guests/[id]
 * Update guest details by ID.
 *
 * Expected JSON body (example):
 * {
 *   "name": "New Guest Name"
 * }
 */
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    const { name } = await req.json();
    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json({ error: "Error updating guest" }, { status: 500 });
  }
}

/**
 * DELETE /api/guests/[id]
 * Delete a guest by ID.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    await prisma.guest.delete({
      where: { id },
    });
    return new NextResponse("Guest deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json({ error: "Error deleting guest" }, { status: 500 });
  }
}