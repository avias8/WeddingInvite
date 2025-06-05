// app/api/media/finalize-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma client

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gcsObjectName, // The unique name of the object in GCS
      originalFileName, // The original name of the file
      contentType, // MIME type of the file
      uploaderId, // The ID of the Guest who uploaded the file
    } = body;

    // --- Input Validation ---
    if (!gcsObjectName || typeof gcsObjectName !== 'string') {
      return NextResponse.json(
        { success: false, error: "gcsObjectName is required and must be a string." },
        { status: 400 }
      );
    }
    if (!uploaderId || typeof uploaderId !== 'number') {
      return NextResponse.json(
        { success: false, error: "uploaderId is required and must be a number." },
        { status: 400 }
      );
    }
    if (!contentType || typeof contentType !== 'string') {
      return NextResponse.json(
        { success: false, error: "contentType is required and must be a string." },
        { status: 400 }
      );
    }
    // originalFileName can be optional, so no strict check here unless you make it mandatory

    // --- Check if Uploader (Guest) Exists ---
    const uploaderGuest = await prisma.guest.findUnique({
      where: { id: uploaderId },
    });

    if (!uploaderGuest) {
      return NextResponse.json(
        { success: false, error: `Uploader guest with ID ${uploaderId} not found.` },
        { status: 404 }
      );
    }

    // --- Create GuestMedia Record ---
    // Assuming gcsPath in your schema stores the GCS object name directly.
    // If it's meant to store the full gs:// path, adjust accordingly.
    const newGuestMedia = await prisma.guestMedia.create({
      data: {
        gcsPath: gcsObjectName, // This is the unique object name in GCS
        originalFileName: originalFileName || null, // Handle if optional
        contentType: contentType,
        uploaderId: uploaderId,
        // uploadedAt is handled by @default(now()) in your schema
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Media record created successfully.",
        guestMediaId: newGuestMedia.id,
        guestMedia: newGuestMedia, // Optionally return the created record
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in finalize-upload endpoint:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Check for specific Prisma errors if needed, e.g., unique constraint violation
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   if (error.code === 'P2002') { // Unique constraint failed
    //     return NextResponse.json({ success: false, error: "A media record for this GCS object already exists." }, { status: 409 });
    //   }
    // }
    return NextResponse.json(
      { success: false, error: `Failed to finalize upload: ${errorMessage}` },
      { status: 500 }
    );
  }
}
