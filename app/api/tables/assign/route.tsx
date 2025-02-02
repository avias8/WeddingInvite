import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ POST: Assign a guest to a table
 */
export async function POST(req: NextRequest) {
  try {
    const { guestId, tableId } = await req.json();

    if (!guestId || !tableId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { guests: true },
    });

    if (!table) {
      return new NextResponse("Table not found", { status: 404 });
    }

    if (table.guests.length >= table.capacity) {
      return new NextResponse("Table is full", { status: 400 });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: { tableId },
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("❌ POST assign guest error:", error);
    return new NextResponse("Error assigning guest to table", { status: 500 });
  }
}