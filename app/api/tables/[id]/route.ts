// app/api/tables/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma for error types

/**
 * GET /api/tables/[id]
 * Fetch a single table by ID.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to extract the id.
    const { id } = await context.params;
    const tableId = parseInt(id, 10);

    // Validate if tableId is a number
    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID format." }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        guests: true,
        // assignments: true, // This line was causing the error and has been removed.
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }
    return NextResponse.json(table);
  } catch (error) {
    console.error("Error fetching table:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Error fetching table", error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/tables/[id]
 * Update table details by ID.
 *
 * Expected JSON body:
 * {
 * "name": "New Table Name",
 * "capacity": 10
 * }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tableId = parseInt(id, 10);

    // Validate if tableId is a number
    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID format." }, { status: 400 });
    }

    const { name, capacity } = await req.json();

    // Validate that 'name' and 'capacity' are provided and 'capacity' is a number.
    if (name === undefined || capacity === undefined) {
      return NextResponse.json({ message: "Missing required fields: name and capacity are required." }, { status: 400 });
    }
    if (typeof capacity !== 'number') {
      return NextResponse.json({ message: "Invalid field type: capacity must be a number." }, { status: 400 });
    }
    if (typeof name !== 'string' || name.trim() === "") {
      return NextResponse.json({ message: "Invalid field type: name must be a non-empty string." }, { status: 400 });
    }


    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { name, capacity },
    });

    return NextResponse.json(updatedTable);
  } catch (error: unknown) { // Changed error type from 'any' to 'unknown'
    console.error("Error updating table:", error);
    // Type check for Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // "Record to update not found"
        return NextResponse.json({ message: "Error updating table: Table not found.", error: error.message }, { status: 404 });
      }
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Error updating table", error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/tables/[id]
 * Delete a table by ID.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tableId = parseInt(id, 10);

    // Validate if tableId is a number
    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID format." }, { status: 400 });
    }

    // Optional: Check if the table has guests assigned and decide if deletion should be blocked.
    // For now, Prisma's default behavior (if guests have a relation to table) will apply.
    // If guests.tableId is nullable, it might be set to null. If not, deletion might be blocked by FK constraint.

    await prisma.table.delete({
      where: { id: tableId },
    });
    // Return a 204 No Content for successful deletion, or a JSON message.
    return NextResponse.json({ message: "Table deleted successfully" }, { status: 200 });
  } catch (error: unknown) { // Changed error type from 'any' to 'unknown'
    console.error("Error deleting table:", error);
    // Type check for Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // "Record to delete not found"
        return NextResponse.json({ message: "Error deleting table: Table not found.", error: error.message }, { status: 404 });
      }
      if (error.code === 'P2003') { // Foreign key constraint violation
          return NextResponse.json({ message: "Error deleting table: Cannot delete table with assigned guests. Please unassign guests first.", error: error.message }, { status: 409 }); // 409 Conflict
      }
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Error deleting table", error: errorMessage }, { status: 500 });
  }
}
