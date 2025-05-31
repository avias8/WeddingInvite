// app/api/get-guest-media/route.ts
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

// Initialize Google Cloud Storage client
const storage = new Storage(); // Assumes GOOGLE_APPLICATION_CREDENTIALS is set
const bucketName = process.env.GCS_BUCKET_NAME;

interface MediaItem {
  name: string;
  url: string; // This will be the signed URL
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
}

export async function GET() {
  if (!bucketName) {
    console.error(
      "GCS_BUCKET_NAME environment variable is not set. Cannot fetch media."
    );
    return NextResponse.json(
      { success: false, error: "Server configuration error for media feed." },
      { status: 500 }
    );
  }

  try {
    const [files] = await storage.bucket(bucketName).getFiles();

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No media found yet.",
        media: [],
      });
    }

    const mediaItems: MediaItem[] = [];

    for (const file of files) {
      // Generate a signed URL for each file
      // URL expires in 1 hour. Adjust as needed.
      const signedUrlOptions = {
        version: "v4" as const, // Required for v4 signed URLs
        action: "read" as const,
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      };

      try {
        const [url] = await file.getSignedUrl(signedUrlOptions);
        mediaItems.push({
          name: file.name,
          url: url,
          contentType: file.metadata.contentType,
          timeCreated: file.metadata.timeCreated,
          updated: file.metadata.updated,
        });
      } catch (signedUrlError) {
        console.error(`Failed to get signed URL for ${file.name}:`, signedUrlError);
        // Optionally skip this file or handle error differently
      }
    }

    // Sort by creation time, newest first (if timeCreated is available)
    mediaItems.sort((a, b) => {
      const timeA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const timeB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      media: mediaItems,
    });

  } catch (error) {
    console.error("Error fetching media from GCS:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, error: `Failed to fetch media. ${errorMessage}` },
      { status: 500 }
    );
  }
}
