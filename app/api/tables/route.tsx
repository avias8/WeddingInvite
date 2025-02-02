import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET: Fetch all tables with seating assignments
 */
export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: { guests: true },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("❌ GET tables error:", error);
    return new NextResponse("Error fetching tables", { status: 500 });
  }
}

/**
 * ✅ POST: Create a new table
 */
export async function POST(req: NextRequest) {
  try {
    const { name, capacity } = await req.json();

    if (!name || !capacity) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newTable = await prisma.table.create({
      data: { name, capacity },
    });

    return NextResponse.json(newTable);
  } catch (error) {
    console.error("❌ POST table error:", error);
    return new NextResponse("Error creating table", { status: 500 });
  }
}