// app/api/media/finalize-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma client
import { Prisma } from '@prisma/client'; // Import Prisma for error types

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gcsObjectName, // The unique name of the object in GCS
      originalFileName, // The original name of the file
      contentType, // MIME type of the file
      uploaderId, // The ID of the Guest who uploaded the file
      caption, // New optional field for the caption
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
    if (caption && (typeof caption !== 'string' || caption.length > 150)) {
      return NextResponse.json(
        { success: false, error: "Caption must be a string and no more than 150 characters." },
        { status: 400 }
      );
    }

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
    const newGuestMedia = await prisma.guestMedia.create({
      data: {
        gcsPath: gcsObjectName,
        originalFileName: originalFileName || null,
        contentType: contentType,
        uploaderId: uploaderId,
        caption: caption || null, // Save the caption, or null if not provided
        // uploadedAt is handled by @default(now()) in your schema
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Media record created successfully.",
        guestMediaId: newGuestMedia.id,
        guestMedia: newGuestMedia,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in finalize-upload endpoint:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors, e.g., unique constraint violation
      if (error.code === 'P2002') {
        // Check if the target includes 'gcsPath' for a more specific message
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes('gcsPath')) {
          return NextResponse.json(
            { success: false, error: "A media record for this GCS object already exists (gcsPath duplicate)." },
            { status: 409 } // Conflict
          );
        }
        // Generic unique constraint error
        return NextResponse.json(
            { success: false, error: `Database unique constraint failed: ${error.message}` },
            { status: 409 } // Conflict
          );
      }
      errorMessage = `Database error: ${error.message} (Code: ${error.code})`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: `Failed to finalize upload: ${errorMessage}` },
      { status: 500 }
    );
  }
}
