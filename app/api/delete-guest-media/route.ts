// app/api/delete-guest-media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";

// --- Google Cloud Storage Client Initialization ---
let storage: Storage | null = null;
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonStringEnv = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsApplicationCredentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

interface ServiceAccountCredentials {
  project_id: string;
  client_email: string;
  private_key: string;
}

// Helper function to create Storage instance
const createStorageInstance = (credentials: ServiceAccountCredentials, sourceDescription: string): Storage | null => {
  if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
    console.error(`Delete Media API: ${sourceDescription} JSON is missing required fields.`);
    return null;
  }
  const storageConfig: StorageOptions = {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  };
  console.log(`Delete Media API: Initialized GCS with credentials from ${sourceDescription}.`);
  return new Storage(storageConfig);
};

// Attempt to initialize storage client from environment variables
if (serviceAccountJsonStringEnv) {
  try {
    const credentials = JSON.parse(serviceAccountJsonStringEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_SERVICE_ACCOUNT (JSON string)");
  } catch (e: unknown) {
    console.error("Delete Media API: Failed to parse GOOGLE_SERVICE_ACCOUNT as JSON:", (e as Error).message);
  }
}
if (storage === null && gcsApplicationCredentialsEnv) {
  let gcsAppCredsIsJson = false;
  try {
    const credentials = JSON.parse(gcsApplicationCredentialsEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_APPLICATION_CREDENTIALS (as JSON string)");
    if (storage) gcsAppCredsIsJson = true;
  } catch (jsonParseError) {
    console.warn("Delete Media API: GOOGLE_APPLICATION_CREDENTIALS not valid JSON. Will try as path.", (jsonParseError as Error).message);
  }
  if (storage === null && !gcsAppCredsIsJson) {
    try {
      storage = new Storage(); // Uses GOOGLE_APPLICATION_CREDENTIALS as path or ADC
      console.log("Delete Media API: Initialized GCS using library's default discovery.");
    } catch (e: unknown) {
      console.error("Delete Media API: Failed default GCS discovery:", (e as Error).message);
    }
  }
}
if (storage === null && !gcsApplicationCredentialsEnv && !serviceAccountJsonStringEnv) {
  try {
    storage = new Storage(); // Default ADC
    console.warn("Delete Media API: No explicit credentials. Attempting default ADC.");
  } catch (e: unknown) {
    console.error("Delete Media API: Failed default ADC:", (e as Error).message);
  }
}
// --- End of GCS Client Initialization ---

// Define a more specific error type for GCS API errors
interface GcsApiError extends Error {
    code?: number | string; // GCS errors might have a numeric or string code
    // You could add other common GCS error properties if needed, e.g.:
    // errors?: Array<{ message: string; reason: string }>;
}

export async function POST(req: NextRequest) {
  // Check if GCS bucket name is configured
  if (!gcsBucketName) {
    return NextResponse.json({ success: false, error: "GCS_BUCKET_NAME not set." }, { status: 500 });
  }
  // Check if GCS client is initialized
  if (!storage) {
    return NextResponse.json({ success: false, error: "GCS client not initialized." }, { status: 500 });
  }

  try {
    // Parse request body to get gcsObjectName and password
    const { gcsObjectName, password } = await req.json();

    // --- Authentication Check ---
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg=="; // Fallback
    if (password !== correctPassword) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }
    // --- End Authentication Check ---

    // Validate gcsObjectName
    if (!gcsObjectName || typeof gcsObjectName !== 'string') {
      return NextResponse.json({ success: false, error: "gcsObjectName is required and must be a string." }, { status: 400 });
    }

    console.log(`Attempting to delete GCS object: ${gcsObjectName} from bucket: ${gcsBucketName}`);

    // Get a reference to the file and delete it
    const file = storage.bucket(gcsBucketName).file(gcsObjectName);
    await file.delete();

    console.log(`Successfully deleted GCS object: ${gcsObjectName}`);
    return NextResponse.json({ success: true, message: `Successfully deleted ${gcsObjectName}` });

  } catch (error: unknown) { // Catch block now explicitly types error as unknown
    console.error("Error deleting GCS object:", error);

    let displayErrorMessage = "An unknown error occurred while deleting the object.";
    let statusCode = 500;

    if (error instanceof Error) {
      // Now 'error' is typed as 'Error'
      displayErrorMessage = error.message;

      // Check for GCS-like error structure with a 'code' property
      // We cast to 'GcsApiError' to safely access 'code'
      const potentialGcsError = error as GcsApiError;
      if (potentialGcsError.code !== undefined) {
        if (potentialGcsError.code === 404 || String(potentialGcsError.code) === '404') {
          displayErrorMessage = `File not found in GCS bucket: ${ (req.json as any).gcsObjectName || 'unknown object'}`; // Safely access gcsObjectName if possible
          statusCode = 404;
        }
        // You can add more specific GCS error code handling here if needed
        // else if (potentialGcsError.code === 403) { /* ... */ }
      }
    }
    // For the specific case where gcsObjectName might not be available if req.json() failed earlier,
    // it's better to handle it this way, or ensure gcsObjectName is captured before this point.
    // However, the primary error being handled here is the GCS delete operation itself.

    return NextResponse.json({ success: false, error: displayErrorMessage }, { status: statusCode });
  }
}
