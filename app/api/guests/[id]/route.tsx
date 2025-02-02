import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET: Fetch a single guest by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(context.params.id) },
      include: { table: true },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error("❌ GET guest error:", error);
    return new NextResponse("Error fetching guest", { status: 500 });
  }
}

/**
 * ✅ PUT: Update guest details
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { name, dietaryRestrictions, accessibilityInfo, isAttending } = await request.json();

    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(context.params.id) },
      data: {
        name,
        dietaryRestrictions: dietaryRestrictions ?? null,
        accessibilityInfo: accessibilityInfo ?? null,
        isAttending: isAttending ?? null,
      },
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("❌ PUT guest error:", error);
    return new NextResponse("Error updating guest", { status: 500 });
  }
}

/**
 * ✅ DELETE: Remove a guest
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await prisma.guest.delete({ where: { id: parseInt(context.params.id) } });
    return new NextResponse("Guest deleted successfully", { status: 200 });
  } catch (error) {
    console.error("❌ DELETE guest error:", error);
    return new NextResponse("Error deleting guest", { status: 500 });
  }
}