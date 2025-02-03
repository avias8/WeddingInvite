// app/api/tables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure the path is correct

/**
 * GET /api/tables
 * Fetch all tables with their related guests and assignments.
 */
export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: { 
        guests: true, 
        assignments: true,
      },
    });
    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return new NextResponse("Error fetching tables", { status: 500 });
  }
}

/**
 * POST /api/tables
 * Create a new table.
 *
 * Expected JSON body:
 * {
 *   "name": "Table Name",
 *   "capacity": 8
 * }
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
    console.error("Error creating table:", error);
    return new NextResponse("Error creating table", { status: 500 });
  }
}
