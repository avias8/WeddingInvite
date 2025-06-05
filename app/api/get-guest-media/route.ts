// app/api/get-guest-media/route.ts
import { NextResponse } from "next/server";
// Removed 'File' from this import as it was unused
import { Storage, StorageOptions, GetFilesResponse } from "@google-cloud/storage";
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma client

// --- Google Cloud Storage Client Initialization (copied from existing, should be refactored to a shared lib) ---
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
    console.error(`Get Media API: ${sourceDescription} JSON is missing required fields.`);
    return null;
  }
  const storageConfig: StorageOptions = {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  };
  console.log(`Get Media API: Initialized GCS with credentials from ${sourceDescription}.`);
  return new Storage(storageConfig);
};

if (serviceAccountJsonStringEnv) {
  try {
    const credentials = JSON.parse(serviceAccountJsonStringEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_SERVICE_ACCOUNT (JSON string)");
  } catch (e: unknown) {
    console.error("Get Media API: Failed to parse GOOGLE_SERVICE_ACCOUNT as JSON:", (e as Error).message);
  }
}
if (storage === null && gcsApplicationCredentialsEnv) {
  let gcsAppCredsIsJson = false;
  try {
    const credentials = JSON.parse(gcsApplicationCredentialsEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_APPLICATION_CREDENTIALS (as JSON string)");
    if (storage) gcsAppCredsIsJson = true;
  } catch (jsonParseError) {
    console.warn("Get Media API: GOOGLE_APPLICATION_CREDENTIALS not valid JSON. Will try as path.", (jsonParseError as Error).message);
  }
  if (storage === null && !gcsAppCredsIsJson) {
    try {
      storage = new Storage();
      console.log("Get Media API: Initialized GCS using library's default discovery.");
    } catch (e: unknown) {
      console.error("Get Media API: Failed default GCS discovery:", (e as Error).message);
    }
  }
}
if (storage === null && !gcsApplicationCredentialsEnv && !serviceAccountJsonStringEnv) {
  try {
    storage = new Storage();
    console.warn("Get Media API: No explicit credentials. Attempting default ADC.");
  } catch (e: unknown) {
    console.error("Get Media API: Failed default ADC:", (e as Error).message);
  }
}
// --- End of GCS Client Initialization ---

// Define a type for expected GCS API error structure
interface GcsApiError extends Error {
  code?: number | string;
  errors?: Array<{ message: string; reason: string }>;
}

// Updated MediaItem interface for the API response
interface MediaItemResponse {
  id: string; // Using GCS file name as a unique ID for the item on the frontend
  name: string; // GCS object name
  url: string; // Signed URL
  contentType: string | undefined;
  timeCreated: string | undefined;
  updated: string | undefined;
  uploaderId?: number | null; // ID of the Guest who uploaded
  uploaderName?: string | null; // Name of the Guest who uploaded
  guestMediaDbId?: number; // The ID from the GuestMedia table in DB
}

export async function GET() {
  if (!gcsBucketName) {
    console.error("Get Media API: GCS_BUCKET_NAME environment variable is not set.");
    return NextResponse.json({ success: false, error: "Server configuration error: GCS_BUCKET_NAME missing." }, { status: 500 });
  }
  if (!storage) {
    console.error("Get Media API: Google Cloud Storage client not initialized properly.");
    return NextResponse.json({ success: false, error: "Server configuration error: GCS client failed to initialize." }, { status: 500 });
  }

  try {
    // 1. Fetch GuestMedia records from DB, including uploader (Guest) details
    const dbMediaRecords = await prisma.guestMedia.findMany({
      include: {
        uploader: { // This includes the Guest record related via uploaderId
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create a map for quick lookup: gcsObjectName -> uploader details
    const uploaderInfoMap = new Map<string, { uploaderId?: number | null; uploaderName?: string | null, guestMediaDbId: number }>();
    dbMediaRecords.forEach(record => {
      uploaderInfoMap.set(record.gcsPath, { // Assuming gcsPath stores the GCS object name
        uploaderId: record.uploader?.id,
        uploaderName: record.uploader?.name,
        guestMediaDbId: record.id,
      });
    });

    // 2. Fetch files from GCS
    const [gcsFiles]: GetFilesResponse = await storage.bucket(gcsBucketName).getFiles();

    if (!gcsFiles || gcsFiles.length === 0) {
      return NextResponse.json({ success: true, message: "No media found yet.", media: [] });
    }

    const mediaItems: MediaItemResponse[] = [];
    const oneHourInMs = 60 * 60 * 1000; // Signed URL expiry

    for (const gcsFile of gcsFiles) {
      if (gcsFile.name.endsWith('/')) { // Skip "folders"
        continue;
      }

      const signedUrlOptions = {
        version: "v4" as const,
        action: "read" as const,
        expires: Date.now() + oneHourInMs,
      };

      try {
        const [url] = await gcsFile.getSignedUrl(signedUrlOptions);
        const uploaderDetails = uploaderInfoMap.get(gcsFile.name);

        mediaItems.push({
          id: gcsFile.name, // Use GCS file name as the primary ID for the item being sent to client
          name: gcsFile.name,
          url: url,
          contentType: gcsFile.metadata.contentType,
          timeCreated: gcsFile.metadata.timeCreated as string | undefined,
          updated: gcsFile.metadata.updated as string | undefined,
          uploaderId: uploaderDetails?.uploaderId,
          uploaderName: uploaderDetails?.uploaderName,
          guestMediaDbId: uploaderDetails?.guestMediaDbId,
        });
      } catch (signedUrlError) {
        console.error(`Get Media API: Failed to get signed URL for ${gcsFile.name}:`, (signedUrlError as Error).message);
        // Optionally, decide if you want to include items with failed signed URLs
      }
    }

    // Sort by timeCreated in descending order (newest first)
    mediaItems.sort((a, b) => {
      const timeA = a.timeCreated ? new Date(a.timeCreated).getTime() : 0;
      const timeB = b.timeCreated ? new Date(b.timeCreated).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, media: mediaItems });

  } catch (error) {
    const gcsApiError = error as GcsApiError; // Type assertion
    console.error("Get Media API: Error fetching media:", gcsApiError.message, gcsApiError.stack);
    let errorMessage = gcsApiError.message || "An unknown error occurred while fetching media.";
    const statusCode = 500; // FIXED: Changed from let to const

    if (gcsApiError.code) { // Check if GCS specific error code exists
        if (gcsApiError.code === 403 || String(gcsApiError.code) === '403') {
            errorMessage = `Permission denied when accessing GCS bucket. Check service account permissions. Original error: ${errorMessage}`;
        } else if (gcsApiError.code === 404 || String(gcsApiError.code) === '404') {
            errorMessage = `GCS bucket '${gcsBucketName}' not found. Original error: ${errorMessage}`;
        }
    } else if (error instanceof Error && error.message.includes("PrismaClient")) { // Basic check for Prisma errors
        errorMessage = `Database error: ${error.message}`;
    }

    return NextResponse.json(
      { success: false, error: `Failed to fetch media. ${errorMessage}` },
      { status: statusCode }
    );
  }
}
