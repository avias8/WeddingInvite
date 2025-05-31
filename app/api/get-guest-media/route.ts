// app/api/get-guest-media/route.ts
import { NextResponse } from "next/server";
import { Storage, StorageOptions, File } from "@google-cloud/storage"; // Added File for explicit typing

// --- Google Cloud Storage Client Initialization ---
let storage: Storage;
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonString = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsCredentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Primary: Try to use the JSON string from GOOGLE_SERVICE_ACCOUNT
if (serviceAccountJsonString) {
  try {
    const serviceAccountCredentials = JSON.parse(serviceAccountJsonString);
    if (!serviceAccountCredentials.project_id || !serviceAccountCredentials.client_email || !serviceAccountCredentials.private_key) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT JSON is missing required fields (project_id, client_email, private_key).");
    }
    const storageConfig: StorageOptions = {
      projectId: serviceAccountCredentials.project_id,
      credentials: {
        client_email: serviceAccountCredentials.client_email,
        // Ensure newline characters in the private key are correctly formatted
        private_key: serviceAccountCredentials.private_key.replace(/\\n/g, "\n"),
      },
    };
    storage = new Storage(storageConfig);
    console.log("Initialized Google Cloud Storage with credentials from GOOGLE_SERVICE_ACCOUNT environment variable.");
  } catch (error) {
    console.error(
      "Failed to parse or use GOOGLE_SERVICE_ACCOUNT environment variable:",
      error instanceof Error ? error.message : String(error)
    );
    // If parsing fails, we might want to prevent the app from starting or fall back.
    // For now, we'll let it fall through to see if other methods work,
    // but an explicit error response in GET might be needed if storage remains uninitialized.
  }
} else if (gcsCredentialsFilePath) {
  // Secondary: Fallback to GOOGLE_APPLICATION_CREDENTIALS file path
  try {
    storage = new Storage(); // Uses GOOGLE_APPLICATION_CREDENTIALS by default if set
    console.log("Initialized Google Cloud Storage using GOOGLE_APPLICATION_CREDENTIALS file path.");
  } catch (error) {
     console.error(
      "Failed to initialize Storage with GOOGLE_APPLICATION_CREDENTIALS:",
      error instanceof Error ? error.message : String(error)
    );
  }
} else {
  // Tertiary: Attempt default ADC (e.g., for GCP environments or gcloud CLI auth)
  try {
    storage = new Storage();
    console.warn(
      "GOOGLE_SERVICE_ACCOUNT and GOOGLE_APPLICATION_CREDENTIALS not set. Attempting default ADC for Storage."
    );
  } catch (error) {
    console.error(
      "Failed to initialize Storage with default ADC:",
      error instanceof Error ? error.message : String(error)
    );
    // At this point, storage is likely uninitialized.
  }
}
// --- End of GCS Client Initialization ---

interface MediaItem {
  name: string;
  url: string;
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
}

export async function GET() {
  // Check if GCS_BUCKET_NAME is set
  if (!gcsBucketName) {
    console.error(
      "GCS_BUCKET_NAME environment variable is not set. Cannot fetch media."
    );
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS_BUCKET_NAME missing." },
      { status: 500 }
    );
  }

  // Check if storage client was successfully initialized
  // The `storage.bucket` check is a good way to see if it's a usable instance.
  if (!storage || typeof storage.bucket !== 'function') {
    console.error("Google Cloud Storage client not initialized properly. Check credentials configuration (GOOGLE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS).");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS client failed to initialize." },
      { status: 500 }
    );
  }

  try {
    const [files]: [File[]] = await storage.bucket(gcsBucketName).getFiles();

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No media found yet.",
        media: [],
      });
    }

    const mediaItems: MediaItem[] = [];
    const oneHourInMs = 60 * 60 * 1000;

    for (const file of files) {
      // Skip common placeholder files or directories if necessary
      if (file.name.endsWith('/')) { // Example: skip "folders"
          continue;
      }

      const signedUrlOptions = {
        version: "v4" as const,
        action: "read" as const,
        expires: Date.now() + oneHourInMs,
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
        // For example, you could push an item with an error message or a placeholder URL
      }
    }

    // Sort by creation time, newest first (if timeCreated is available)
    mediaItems.sort((a, b) => {
      const timeA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const timeB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return timeB - timeA; // Sort descending
    });

    return NextResponse.json({
      success: true,
      media: mediaItems,
    });

  } catch (error) {
    console.error("Error fetching media from GCS:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching media.";
    // Check for specific GCS errors if needed, e.g., bucket not found, permissions issues
    if (error instanceof Error && 'code' in error && (error as any).code === 403) {
        return NextResponse.json(
          { success: false, error: `Permission denied when accessing GCS bucket. Check service account permissions. Original error: ${errorMessage}` },
          { status: 500 }
        );
    }
     if (error instanceof Error && 'code' in error && (error as any).code === 404) {
        return NextResponse.json(
          { success: false, error: `GCS bucket '${gcsBucketName}' not found. Original error: ${errorMessage}` },
          { status: 500 }
        );
    }
    return NextResponse.json(
      { success: false, error: `Failed to fetch media. ${errorMessage}` },
      { status: 500 }
    );
  }
}