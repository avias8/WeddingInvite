// app/api/guest-uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { randomUUID } from "crypto"; // For generating unique filenames

// --- Google Cloud Storage Client Initialization ---
let storage: Storage | null = null; // Initialize storage to null
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonString = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsCredentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Define a type for expected GCS error structure (can be shared if used in multiple files)
interface GcsApiError extends Error {
  code?: number | string;
  errors?: Array<{ message: string; reason: string }>; // Common in GCS errors
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
    console.log("Guest Uploads: Initialized Google Cloud Storage with credentials from GOOGLE_SERVICE_ACCOUNT environment variable.");
  } catch (e: unknown) {
    const initError = e as Error;
    console.error(
      "Guest Uploads: Failed to parse or use GOOGLE_SERVICE_ACCOUNT environment variable:",
      initError.message
    );
  }
}

// Secondary: Fallback to GOOGLE_APPLICATION_CREDENTIALS file path if storage not yet initialized
if (storage === null && gcsCredentialsFilePath) {
  try {
    storage = new Storage();
    console.log("Guest Uploads: Initialized Google Cloud Storage using GOOGLE_APPLICATION_CREDENTIALS file path.");
  } catch (e: unknown) {
    const initError = e as Error;
    console.error(
      "Guest Uploads: Failed to initialize Storage with GOOGLE_APPLICATION_CREDENTIALS:",
      initError.message
    );
  }
}

// Tertiary: Attempt default ADC if storage still not initialized
if (storage === null) {
  try {
    storage = new Storage();
    console.warn(
      "Guest Uploads: GOOGLE_SERVICE_ACCOUNT and GOOGLE_APPLICATION_CREDENTIALS not set or failed. Attempting default ADC for Storage."
    );
  } catch (e: unknown) {
    const initError = e as Error;
    console.error(
      "Guest Uploads: Failed to initialize Storage with default ADC:",
      initError.message
    );
  }
}
// --- End of GCS Client Initialization ---


export async function POST(req: NextRequest) {
  if (!gcsBucketName) {
    console.error("Guest Uploads: GCS_BUCKET_NAME environment variable is not set.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS_BUCKET_NAME missing." },
      { status: 500 }
    );
  }

  if (!storage || typeof storage.bucket !== 'function') {
    console.error("Guest Uploads: Google Cloud Storage client not initialized properly.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS client failed to initialize." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files were uploaded." }, { status: 400 });
    }

    const uploadedFileDetails: { fileName: string; gcsPath: string; contentType: string }[] = [];
    let filesProcessed = 0;

    for (const file of files) {
      filesProcessed++;
      if (!file.name || !file.type || file.size === 0) {
        console.warn(`Guest Uploads: Skipping invalid/empty file (${filesProcessed}/${files.length}): ${file.name || 'N/A'}`);
        continue;
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const originalFileName = file.name.replace(/[^\w.-]/g, '_');
      const uniqueFileName = `${randomUUID()}-${originalFileName}`;
      const gcsFile = storage.bucket(gcsBucketName).file(uniqueFileName);

      console.log(`Guest Uploads: Attempting to upload ${uniqueFileName} (Size: ${fileBuffer.length} bytes)`);

      try {
        await new Promise<void>((resolve, reject) => {
          const stream = gcsFile.createWriteStream({
            metadata: { contentType: file.type },
            resumable: false, // Keep false for simplicity unless large file issues persist
          });

          let streamClosed = false; // Flag to prevent operations on a closed stream

          stream.on("error", (err: GcsApiError) => {
            if (streamClosed) return;
            streamClosed = true;
            console.error(`Guest Uploads: GCS stream error for ${uniqueFileName}:`, err);
            // Log more detailed GCS errors if available
            if (err.errors && err.errors.length > 0) {
              err.errors.forEach(e => console.error(` - GCS specific error: ${e.reason} - ${e.message}`));
            }
            reject(new Error(`GCS stream error for ${file.name}: ${err.message}`));
          });

          stream.on("finish", () => {
            if (streamClosed) return; // Should not happen if 'error' fired and rejected
            streamClosed = true;
            uploadedFileDetails.push({
              fileName: file.name,
              gcsPath: `gs://${gcsBucketName}/${uniqueFileName}`,
              contentType: file.type,
            });
            console.log(`Guest Uploads: Successfully uploaded ${uniqueFileName} to GCS.`);
            resolve();
          });

          // Important: Call end() only once and ensure stream is not already closed
          // The 'error' event should lead to rejection before 'end' could cause issues
          // if the stream was already destroyed.
          try {
            stream.end(fileBuffer);
          } catch (endError: unknown) {
            // This catch is for synchronous errors from stream.end() itself
            if (!streamClosed) {
                streamClosed = true;
                console.error(`Guest Uploads: Synchronous error on stream.end() for ${uniqueFileName}:`, endError);
                reject(new Error(`Error ending stream for ${file.name}: ${(endError as Error).message}`));
            }
          }
        });
      } catch (uploadError: unknown) {
        // This catches rejections from the new Promise (e.g., from stream.on('error'))
        // or synchronous errors if createWriteStream failed badly (though less likely to be "cannot write")
        console.error(`Guest Uploads: Failed to process upload for ${file.name}:`, (uploadError as Error).message);
        // We will not add this file to uploadedFileDetails and let the loop continue for other files.
        // The function will later respond based on how many files were *successfully* uploaded.
        // You could collect these errors to return to the client if needed.
        // For now, just ensuring it doesn't stop other uploads.
      }
    }

    if (uploadedFileDetails.length === 0 && files.length > 0) {
      return NextResponse.json(
        { success: false, error: "No files were successfully uploaded. Check server logs for details." },
        { status: 400 }
      );
    }
    if (uploadedFileDetails.length === 0 && files.length === 0) {
      // Should be caught by earlier check, but for safety
      return NextResponse.json({ success: false, error: "No files were provided." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFileDetails.length} of ${files.length} file(s) processed successfully.`,
      uploadedFiles: uploadedFileDetails,
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
