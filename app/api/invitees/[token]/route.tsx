import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token) {
    return new NextResponse("Token is required", { status: 400 });
  }

  try {
    console.log(`Looking up invitee with token: ${token}`);
    const invitee = await prisma.invitee.findUnique({
      where: { token },
    });

    if (!invitee) {
      console.warn(`No invitee found for token: ${token}`);
      return new NextResponse("Invitee not found", { status: 404 });
    }

    return NextResponse.json({
      id: invitee.id,
      name: invitee.name,
      guests: invitee.guests,
      isAttending: invitee.isAttending,
    });
  } catch (error) {
    console.error("Error retrieving invitee by token:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
