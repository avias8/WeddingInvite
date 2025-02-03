// app/api/tables/unassign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const { guestId } = await req.json();

    if (!guestId) {
      return NextResponse.json(
        { error: "Missing guestId" },
        { status: 400 }
      );
    }

    // Update the guest's record to unassign it from any table.
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: { tableId: null },
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Error unassigning guest:", error);
    return NextResponse.json(
      { error: "Error unassigning guest" },
      { status: 500 }
    );
  }
}
