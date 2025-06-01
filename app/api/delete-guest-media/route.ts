// app/api/delete-guest-media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";

// --- Google Cloud Storage Client Initialization ---
// (This is similar to your other GCS API routes, ensure it's robust)
let storage: Storage | null = null;
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonStringEnv = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsApplicationCredentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

interface ServiceAccountCredentials {
  project_id: string;
  client_email: string;
  private_key: string;
}

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

export async function POST(req: NextRequest) {
  if (!gcsBucketName) {
    return NextResponse.json({ success: false, error: "GCS_BUCKET_NAME not set." }, { status: 500 });
  }
  if (!storage) {
    return NextResponse.json({ success: false, error: "GCS client not initialized." }, { status: 500 });
  }

  try {
    const { gcsObjectName, password } = await req.json();

    // --- Authentication Check ---
    // This is a simple password check, mirroring your management page.
    // For production, a more robust authentication mechanism (e.g., tokens) is recommended for APIs.
    const correctPassword = process.env.NEXT_PUBLIC_MANAGEMENT_PASSWORD || "eW9zZGZlZGJhcg=="; // Fallback
    if (password !== correctPassword) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }
    // --- End Authentication Check ---

    if (!gcsObjectName || typeof gcsObjectName !== 'string') {
      return NextResponse.json({ success: false, error: "gcsObjectName is required and must be a string." }, { status: 400 });
    }

    console.log(`Attempting to delete GCS object: ${gcsObjectName} from bucket: ${gcsBucketName}`);

    const file = storage.bucket(gcsBucketName).file(gcsObjectName);
    await file.delete();

    console.log(`Successfully deleted GCS object: ${gcsObjectName}`);
    return NextResponse.json({ success: true, message: `Successfully deleted ${gcsObjectName}` });

  } catch (error) {
    console.error("Error deleting GCS object:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // Check for specific GCS errors, e.g., object not found
    if (error instanceof Error && (error as any).code === 404) {
        return NextResponse.json({ success: false, error: `File not found: ${errorMessage}` }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: `Failed to delete object: ${errorMessage}` }, { status: 500 });
  }
}
