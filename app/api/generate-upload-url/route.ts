// app/api/generate-upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// --- Reuse GCS Client Initialization Logic ---
// (You can extract this to a shared lib/gcs.ts file or copy from your existing routes)
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
    console.error(`Generate Upload URL: ${sourceDescription} JSON is missing required fields.`);
    return null;
  }
  const storageConfig: StorageOptions = {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  };
  console.log(`Generate Upload URL: Initialized GCS with credentials from ${sourceDescription}.`);
  return new Storage(storageConfig);
};

if (serviceAccountJsonStringEnv) {
  try {
    const credentials = JSON.parse(serviceAccountJsonStringEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_SERVICE_ACCOUNT (JSON string)");
  } catch (e: unknown) {
    console.error("Generate Upload URL: Failed to parse GOOGLE_SERVICE_ACCOUNT as JSON:", (e as Error).message);
  }
}
if (storage === null && gcsApplicationCredentialsEnv) {
  let gcsAppCredsIsJson = false;
  try {
    const credentials = JSON.parse(gcsApplicationCredentialsEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_APPLICATION_CREDENTIALS (as JSON string)");
    if (storage) gcsAppCredsIsJson = true;
  } catch (jsonParseError) {
    console.warn("Generate Upload URL: GOOGLE_APPLICATION_CREDENTIALS not valid JSON. Will try as path.", (jsonParseError as Error).message);
  }
  if (storage === null && !gcsAppCredsIsJson) {
    try {
      storage = new Storage();
      console.log("Generate Upload URL: Initialized GCS using library's default discovery.");
    } catch (e: unknown) {
      console.error("Generate Upload URL: Failed default GCS discovery:", (e as Error).message);
    }
  }
}
if (storage === null && !gcsApplicationCredentialsEnv && !serviceAccountJsonStringEnv) {
  try {
    storage = new Storage();
    console.warn("Generate Upload URL: No explicit credentials. Attempting default ADC.");
  } catch (e: unknown) {
    console.error("Generate Upload URL: Failed default ADC:", (e as Error).message);
  }
}
// --- End of GCS Client Initialization ---

export async function POST(req: NextRequest) {
  if (!gcsBucketName) {
    return NextResponse.json({ error: "GCS_BUCKET_NAME not set." }, { status: 500 });
  }
  if (!storage) {
    return NextResponse.json({ error: "GCS client not initialized." }, { status: 500 });
  }

  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required." }, { status: 400 });
    }

    const originalFileNameClean = filename.replace(/[^\w.-]+/g, '_'); // Sanitize
    const uniqueFileName = `${randomUUID()}-${originalFileNameClean}`;

    const file = storage.bucket(gcsBucketName).file(uniqueFileName);

    const options = {
      version: "v4" as const,
      action: "write" as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    };

    const [signedUrl] = await file.getSignedUrl(options);

    return NextResponse.json({ success: true, signedUrl, gcsObjectName: uniqueFileName });

  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ success: false, error: "Failed to generate signed URL.", details: (error as Error).message }, { status: 500 });
  }
}