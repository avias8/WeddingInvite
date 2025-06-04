// app/api/tables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure the path is correct

/**
 * GET /api/tables
 * Fetch all tables with their related guests.
 */
export async function GET() {
  try {
    // Fetch all tables and include their associated guests.
    // The 'assignments' relation was removed as the SeatingAssignment model is no longer in use.
    const tables = await prisma.table.findMany({
      include: {
        guests: true, // Include guests assigned to each table
      },
    });
    // Return the fetched tables as a JSON response.
    return NextResponse.json(tables);
  } catch (error) {
    // Log the error for server-side debugging.
    console.error("Error fetching tables:", error);
    // Determine the error message.
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Return a JSON response with the error message and a 500 status code.
    return NextResponse.json({ message: "Error fetching tables", error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/tables
 * Create a new table.
 *
 * Expected JSON body:
 * {
 * "name": "Table Name",
 * "capacity": 8
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body from the request.
    const { name, capacity } = await req.json();

    // Validate that 'name' and 'capacity' are provided.
    if (!name || capacity === undefined) { // Check if capacity is undefined, as 0 could be a valid (though unusual) capacity.
      return NextResponse.json({ message: "Missing required fields: name and capacity are required." }, { status: 400 });
    }

    // Validate that capacity is a number.
    if (typeof capacity !== 'number') {
      return NextResponse.json({ message: "Invalid field type: capacity must be a number." }, { status: 400 });
    }

    // Create a new table record in the database.
    const newTable = await prisma.table.create({
      data: { name, capacity },
    });

    // Return the newly created table as a JSON response with a 201 status code (Created).
    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    // Log the error for server-side debugging.
    console.error("Error creating table:", error);
    // Determine the error message.
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Return a JSON response with the error message and a 500 status code.
    return NextResponse.json({ message: "Error creating table", error: errorMessage }, { status: 500 });
  }
}
