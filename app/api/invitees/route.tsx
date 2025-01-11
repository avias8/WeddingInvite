import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle GET (list invitees) or POST (create invitee)
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
    const data = await req.json(); // body: { name, email, guests, isAttending }
    const newInvitee = await prisma.invitee.create({
      data,
    });
    return NextResponse.json(newInvitee);
  } catch (error) {
    console.error("POST invitees error:", error);
    return new NextResponse("Error creating invitee", { status: 500 });
  }
}