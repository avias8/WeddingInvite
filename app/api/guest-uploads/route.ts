// app/api/guest-uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { randomUUID } from "crypto"; // For generating unique filenames

// --- Google Cloud Storage Client Initialization ---
let storage: Storage | null = null; // Initialize storage to null
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonString = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsCredentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Define a type for expected GCS error structure
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
    storage = new Storage(); // Uses GOOGLE_APPLICATION_CREDENTIALS by default if set
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
    // At this point, storage is likely uninitialized, and POST requests will fail.
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
    console.error("Guest Uploads: Google Cloud Storage client not initialized properly. Check credentials configuration.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: GCS client failed to initialize." },
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
