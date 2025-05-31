// app/api/guest-uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { randomUUID } from "crypto"; // For generating unique filenames

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
    console.error(`Guest Uploads: ${sourceDescription} JSON is missing required fields (project_id, client_email, private_key).`);
    return null;
  }
  const storageConfig: StorageOptions = {
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  };
  console.log(`Guest Uploads: Initialized Google Cloud Storage with credentials from ${sourceDescription}.`);
  return new Storage(storageConfig);
};

// Attempt 1: Use GOOGLE_SERVICE_ACCOUNT if it contains the JSON string
if (serviceAccountJsonStringEnv) {
  try {
    const credentials = JSON.parse(serviceAccountJsonStringEnv) as ServiceAccountCredentials;
    storage = createStorageInstance(credentials, "GOOGLE_SERVICE_ACCOUNT (JSON string)");
  } catch (e: unknown) {
    console.error(
      "Guest Uploads: Failed to parse GOOGLE_SERVICE_ACCOUNT as JSON:",
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
      "Guest Uploads: GOOGLE_APPLICATION_CREDENTIALS was set, but failed to parse as JSON. Will attempt to use it as a file path if applicable. Parse error:",
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
      console.log("Guest Uploads: Initialized Google Cloud Storage using library's default credential discovery (e.g., GOOGLE_APPLICATION_CREDENTIALS as file path, or ADC).");
    } catch (e: unknown) {
      console.error(
        "Guest Uploads: Failed to initialize Storage using library's default credential discovery:",
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
      "Guest Uploads: No explicit credential environment variables (GOOGLE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS) were set. Attempting default ADC for Storage."
    );
  } catch (e: unknown) {
    console.error(
      "Guest Uploads: Failed to initialize Storage with default ADC (no explicit env vars set):",
      (e as Error).message
    );
  }
}
// --- End of GCS Client Initialization ---


export async function POST(req: NextRequest) {
  // Check if the bucket name is configured
  if (!gcsBucketName) {
    console.error("Guest Uploads: GCS_BUCKET_NAME environment variable is not set. File uploads will fail.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS_BUCKET_NAME missing." },
      { status: 500 }
    );
  }

  // Check if storage client was successfully initialized
  if (!storage || typeof storage.bucket !== 'function') {
    console.error("Guest Uploads: Google Cloud Storage client not initialized properly. Check credentials configuration and server logs for details.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS client failed to initialize. Review server logs for credential issues." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[]; // "files" should match your FormData key on the client

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files were uploaded. Please select one or more files." },
        { status: 400 }
      );
    }

    const uploadedFileDetails: { fileName: string; gcsPath: string; contentType: string }[] = [];
    const individualFileErrors: string[] = [];
    let filesAttempted = 0;

    for (const file of files) {
      filesAttempted++;
      if (!file.name || !file.type || file.size === 0) {
        console.warn(`Guest Uploads: Skipping an invalid or empty file (File ${filesAttempted}/${files.length}): ${file.name || 'Unnamed file'}`);
        individualFileErrors.push(`File ${file.name || 'Unnamed file'} is invalid or empty.`);
        continue;
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const originalFileNameClean = file.name.replace(/[^\w.-]+/g, '_'); // Sanitize filename
      const uniqueFileName = `${randomUUID()}-${originalFileNameClean}`;
      const gcsFile = storage.bucket(gcsBucketName).file(uniqueFileName);

      console.log(`Guest Uploads: Attempting to upload ${uniqueFileName} (Type: ${file.type}, Size: ${fileBuffer.length} bytes)`);

      try {
        await new Promise<void>((resolve, reject) => {
          const stream = gcsFile.createWriteStream({
            metadata: { contentType: file.type },
            resumable: false,
          });

          let streamClosed = false;

          stream.on("error", (err: GcsApiError) => {
            if (streamClosed) return;
            streamClosed = true;
            console.error(`Guest Uploads: GCS stream error for ${uniqueFileName}:`, err.message, err.stack);
            if (err.errors && err.errors.length > 0) {
              err.errors.forEach(e => console.error(` - GCS specific error detail: ${e.reason} - ${e.message}`));
            }
            reject(new Error(`Upload failed for ${file.name}: ${err.message}`));
          });

          stream.on("finish", () => {
            if (streamClosed) return;
            streamClosed = true;
            uploadedFileDetails.push({
              fileName: file.name,
              gcsPath: `gs://${gcsBucketName}/${uniqueFileName}`,
              contentType: file.type,
            });
            console.log(`Guest Uploads: Successfully uploaded ${uniqueFileName} to GCS.`);
            resolve();
          });

          try {
            stream.end(fileBuffer);
          } catch (endError: unknown) {
            if (!streamClosed) {
                streamClosed = true;
                const e = endError as Error;
                console.error(`Guest Uploads: Synchronous error on stream.end() for ${uniqueFileName}:`, e.message, e.stack);
                reject(new Error(`Error ending stream for ${file.name}: ${e.message}`));
            }
          }
        });
      } catch (uploadError: unknown) {
        const e = uploadError as Error;
        console.error(`Guest Uploads: Failed to process upload for ${file.name}:`, e.message, e.stack);
        individualFileErrors.push(`Failed to upload ${file.name}: ${e.message}`);
        // Continue to the next file
      }
    } // End of for...of loop for files

    if (uploadedFileDetails.length === 0 && files.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No files were successfully uploaded. Check server logs for details.",
          individualErrors: individualFileErrors
        },
        { status: 400 }
      );
    }

    // --- Optional: Save file metadata to your Prisma database ---
    // if (uploadedFileDetails.length > 0 && typeof prisma !== 'undefined') {
    //   try {
    //     await prisma.guestMedia.createMany({
    //       data: uploadedFileDetails.map(detail => ({
    //         originalFileName: detail.fileName,
    //         gcsPath: detail.gcsPath,
    //         contentType: detail.contentType,
    //         uploadedAt: new Date(),
    //       })),
    //     });
    //     console.log("Guest Uploads: Successfully saved media metadata to database.");
    //   } catch (dbError: unknown) {
    //     const e = dbError as Error;
    //     console.error("Guest Uploads: Database error saving media metadata:", e.message, e.stack);
    //   }
    // }
    // --- End Optional Database Save ---

    return NextResponse.json({
      success: true,
      message: `${uploadedFileDetails.length} of ${files.length} file(s) uploaded successfully.`,
      uploadedFiles: uploadedFileDetails,
      errors: individualFileErrors.length > 0 ? individualFileErrors : undefined,
    });

  } catch (e: unknown) {
    const error = e as GcsApiError;
    console.error("Guest Uploads: Overall file upload process error:", error.message, error.stack);
    const errorMessage = error.message || "An unknown error occurred during file upload.";
    return NextResponse.json(
      { success: false, error: `Upload process failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
