// app/api/tables/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { guests: true, assignments: true },
    });
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }
    return NextResponse.json(table);
  } catch (error) {
    console.error("Error fetching table:", error);
    return new NextResponse("Error fetching table", { status: 500 });
  }
}

/**
 * PUT /api/tables/[id]
 * Update table details by ID.
 *
 * Expected JSON body:
 * {
 *   "name": "New Table Name",
 *   "capacity": 10
 * }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tableId = parseInt(id, 10);
    const { name, capacity } = await req.json();

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { name, capacity },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Error updating table:", error);
    return new NextResponse("Error updating table", { status: 500 });
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
    await prisma.table.delete({
      where: { id: tableId },
    });
    return new NextResponse("Table deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting table:", error);
    return new NextResponse("Error deleting table", { status: 500 });
  }
}
