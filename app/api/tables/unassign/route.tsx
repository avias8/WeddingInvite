import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ DELETE: Remove a guest from a table
 */
export async function DELETE(req: NextRequest) {
  try {
    const { guestId } = await req.json();

    if (!guestId) {
      return new NextResponse("Missing guest ID", { status: 400 });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: { tableId: null },
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("❌ DELETE unassign guest error:", error);
    return new NextResponse("Error removing guest from table", { status: 500 });
  }
}