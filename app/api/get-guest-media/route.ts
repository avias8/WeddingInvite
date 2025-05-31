// app/api/get-guest-media/route.ts
import { NextResponse } from "next/server";
import { Storage, StorageOptions, File, GetFilesResponse } from "@google-cloud/storage"; // Added GetFilesResponse for clarity

// --- Google Cloud Storage Client Initialization ---
let storage: Storage | null = null; // Initialize to null
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonString = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsCredentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Define a type for expected GCS error structure
interface GcsApiError extends Error {
  code?: number | string;
  // You can add other common properties if needed, e.g., errors?: Array<{ message: string; reason: string; }>;
}

// Primary: Try to use the JSON string from GOOGLE_SERVICE_ACCOUNT
if (storage === null && serviceAccountJsonString) {
  try {
    const serviceAccountCredentials = JSON.parse(serviceAccountJsonString);
    if (!serviceAccountCredentials.project_id || !serviceAccountCredentials.client_email || !serviceAccountCredentials.private_key) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT JSON is missing required fields (project_id, client_email, private_key).");
    }
    const storageConfig: StorageOptions = {
      projectId: serviceAccountCredentials.project_id,
      credentials: {
        client_email: serviceAccountCredentials.client_email,
        private_key: serviceAccountCredentials.private_key.replace(/\\n/g, "\n"),
      },
    };
    storage = new Storage(storageConfig);
    console.log("Get Media: Initialized Google Cloud Storage with credentials from GOOGLE_SERVICE_ACCOUNT environment variable.");
  } catch (e: unknown) {
    const initError = e as Error; // Assume it's at least an Error
    console.error(
      "Get Media: Failed to parse or use GOOGLE_SERVICE_ACCOUNT environment variable:",
      initError.message
    );
  }
}

// Secondary: Fallback to GOOGLE_APPLICATION_CREDENTIALS file path if storage not yet initialized
if (storage === null && gcsCredentialsFilePath) {
  try {
    storage = new Storage();
    console.log("Get Media: Initialized Google Cloud Storage using GOOGLE_APPLICATION_CREDENTIALS file path.");
  } catch (e: unknown) {
    const initError = e as Error;
    console.error(
      "Get Media: Failed to initialize Storage with GOOGLE_APPLICATION_CREDENTIALS:",
      initError.message
    );
  }
}

// Tertiary: Attempt default ADC if storage still not initialized
if (storage === null) {
  try {
    storage = new Storage();
    console.warn(
      "Get Media: GOOGLE_SERVICE_ACCOUNT and GOOGLE_APPLICATION_CREDENTIALS not set or failed. Attempting default ADC for Storage."
    );
  } catch (e: unknown) {
    const initError = e as Error;
    console.error(
      "Get Media: Failed to initialize Storage with default ADC:",
      initError.message
    );
    // If all attempts fail, storage will remain null.
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
  if (!gcsBucketName) {
    console.error(
      "Get Media: GCS_BUCKET_NAME environment variable is not set. Cannot fetch media."
    );
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS_BUCKET_NAME missing." },
      { status: 500 }
    );
  }

  // Check if storage was successfully initialized. If storage is null, !storage is true.
  if (!storage || typeof storage.bucket !== 'function') {
    console.error("Get Media: Google Cloud Storage client not initialized properly. Check credentials configuration.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS client failed to initialize." },
      { status: 500 }
    );
  }

  try {
    // Correctly destructure the GetFilesResponse. We are interested in the first element (File[]).
    const [files]: GetFilesResponse = await storage.bucket(gcsBucketName).getFiles();

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
      if (file.name.endsWith('/')) { // Skip "folders" if any exist
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
      } catch (e: unknown) {
        const signedUrlError = e as Error;
        console.error(`Get Media: Failed to get signed URL for ${file.name}:`, signedUrlError.message);
      }
    }

    mediaItems.sort((a, b) => {
      const timeA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const timeB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      media: mediaItems,
    });

  } catch (e: unknown) { // Catch error as unknown
    const error = e as GcsApiError; // Assert to our GcsApiError type

    console.error("Get Media: Error fetching media from GCS:", error.message, error.stack);
    const errorMessage = error.message || "An unknown error occurred while fetching media.";

    // Now we can safely access error.code
    if (error.code === 403) {
        return NextResponse.json(
          { success: false, error: `Permission denied when accessing GCS bucket. Check service account permissions. Original error: ${errorMessage}` },
          { status: 500 }
        );
    }
     if (error.code === 404) {
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
