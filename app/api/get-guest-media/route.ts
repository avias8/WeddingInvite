// app/api/get-guest-media/route.ts
import { NextResponse } from "next/server";
import { Storage, StorageOptions, GetFilesResponse } from "@google-cloud/storage";

// --- Google Cloud Storage Client Initialization ---
let storage: Storage | null = null; // Initialize storage to null
const gcsBucketName = process.env.GCS_BUCKET_NAME;

// Environment variables for credentials
const serviceAccountJsonStringEnv = process.env.GOOGLE_SERVICE_ACCOUNT; // Preferred for JSON string
const gcsApplicationCredentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS; // User's Vercel setup (JSON string) OR library default (file path)

// Define a type for expected GCS error structure
interface GcsApiError extends Error {
  code?: number | string;
  errors?: Array<{ message: string; reason: string }>; // Common in GCS errors
}

// Define an interface for Service Account Credentials
interface ServiceAccountCredentials {
  project_id: string;
  client_email: string;
  private_key: string;
  // Add other fields if necessary, e.g., type, private_key_id, client_id, etc.
}

// Helper function to create Storage instance from parsed credentials
const createStorageInstance = (credentials: ServiceAccountCredentials, sourceDescription: string): Storage | null => {
  if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
    console.error(`Get Media: ${sourceDescription} JSON is missing required fields (project_id, client_email, private_key).`);
    return null;
  }
  const storageConfig: StorageOptions = {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  };
  console.log(`Get Media: Initialized Google Cloud Storage with credentials from ${sourceDescription}.`);
  return new Storage(storageConfig);
};

// Attempt 1: Use GOOGLE_SERVICE_ACCOUNT if it contains the JSON string
if (serviceAccountJsonStringEnv) {
  try {
    const credentials = JSON.parse(serviceAccountJsonStringEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_SERVICE_ACCOUNT (JSON string)");
  } catch (e: unknown) {
    console.error(
      "Get Media: Failed to parse GOOGLE_SERVICE_ACCOUNT as JSON:",
      (e as Error).message
    );
  }
}

// Attempt 2: If not initialized by GOOGLE_SERVICE_ACCOUNT, and GOOGLE_APPLICATION_CREDENTIALS is set,
// try to parse IT as a JSON string (as per user's Vercel setup).
if (storage === null && gcsApplicationCredentialsEnv) {
  let gcsAppCredsIsJson = false;
  try {
    const credentials = JSON.parse(gcsApplicationCredentialsEnv) as ServiceAccountCredentials;
    // If parsing succeeds, it's a JSON string.
    storage = createStorageInstance(credentials, "GOOGLE_APPLICATION_CREDENTIALS (as JSON string)");
    if (storage) {
        gcsAppCredsIsJson = true; // Mark that it was successfully used as JSON
    }
  } catch (jsonParseError) {
    // JSON.parse failed. This means gcsApplicationCredentialsEnv is NOT a valid JSON string.
    // It MIGHT be a file path, or it's just malformed.
    // Log this, and then proceed to Attempt 3 where the library will try it as a path.
    console.warn(
      "Get Media: GOOGLE_APPLICATION_CREDENTIALS was set, but failed to parse as JSON. Will attempt to use it as a file path if applicable. Parse error:",
      (jsonParseError as Error).message
    );
  }

  // Attempt 3: If GOOGLE_APPLICATION_CREDENTIALS was set but NOT successfully used as JSON (i.e., gcsAppCredsIsJson is false),
  // let the GCS library try to use it as a file path.
  // This also covers the case where GOOGLE_APPLICATION_CREDENTIALS was intended as a path from the start.
  if (storage === null && !gcsAppCredsIsJson) {
    // The GCS library will automatically look at process.env.GOOGLE_APPLICATION_CREDENTIALS if it's set
    // and no credentials were provided to the constructor.
    try {
      storage = new Storage();
      // If new Storage() succeeds here, it means it found credentials,
      // likely via GOOGLE_APPLICATION_CREDENTIALS as a file path or another ADC mechanism.
      console.log("Get Media: Initialized Google Cloud Storage using library's default credential discovery (e.g., GOOGLE_APPLICATION_CREDENTIALS as file path, or ADC).");
    } catch (e: unknown) {
      console.error(
        "Get Media: Failed to initialize Storage using library's default credential discovery:",
        (e as Error).message
      );
    }
  }
}

// Attempt 4: If storage is STILL null (neither env var provided usable JSON,
// and GOOGLE_APPLICATION_CREDENTIALS wasn't set or wasn't a usable path for the library),
// try default ADC one last time (for environments with implicit ADC or local gcloud auth)
if (storage === null && !gcsApplicationCredentialsEnv && !serviceAccountJsonStringEnv) {
  // This condition ensures we only try this if no explicit credential env vars were even set.
  try {
    storage = new Storage(); // Default ADC
    console.warn(
      "Get Media: No explicit credential environment variables (GOOGLE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS) were set. Attempting default ADC for Storage."
    );
  } catch (e: unknown) {
    console.error(
      "Get Media: Failed to initialize Storage with default ADC (no explicit env vars set):",
      (e as Error).message
    );
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

  if (!storage || typeof storage.bucket !== 'function') {
    console.error("Get Media: Google Cloud Storage client not initialized properly. Check credentials configuration and server logs for details.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS client failed to initialize. Review server logs for credential issues." },
      { status: 500 }
    );
  }

  try {
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
        // Optionally, you could push a placeholder or skip this item
      }
    }

    mediaItems.sort((a, b) => {
      const timeA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const timeB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return timeB - timeA; // Sort descending (newest first)
    });

    return NextResponse.json({
      success: true,
      media: mediaItems,
    });

  } catch (e: unknown) {
    const error = e as GcsApiError;

    console.error("Get Media: Error fetching media from GCS:", error.message, error.stack);
    let errorMessage = error.message || "An unknown error occurred while fetching media.";
    const statusCode = 500; // Changed from let to const

    if (error.code === 403) {
        errorMessage = `Permission denied when accessing GCS bucket. Check service account permissions. Original error: ${errorMessage}`;
        // statusCode remains 500 as it's a server-side config issue
    } else if (error.code === 404) {
        errorMessage = `GCS bucket '${gcsBucketName}' not found. Original error: ${errorMessage}`;
        // statusCode remains 500
    }
    // Add more specific GCS error code handling if needed

    return NextResponse.json(
      { success: false, error: `Failed to fetch media. ${errorMessage}` },
      { status: statusCode }
    );
  }
}
