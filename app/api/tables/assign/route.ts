// app/api/tables/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { guestId, tableId } = await req.json();

    if (!guestId || !tableId) {
      return NextResponse.json(
        { error: "Missing guestId or tableId" },
        { status: 400 }
      );
    }

    // Ensure the table exists and check its current capacity.
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { guests: true },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    if (table.guests.length >= table.capacity) {
      return NextResponse.json(
        { error: "Table is full" },
        { status: 400 }
      );
    }

    // Update the guest's record to assign the table.
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: { tableId },
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Error assigning guest to table:", error);
    return NextResponse.json(
      { error: "Error assigning guest to table" },
      { status: 500 }
    );
  }
}
