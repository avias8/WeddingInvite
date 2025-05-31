// app/api/guest-uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage, StorageOptions } from "@google-cloud/storage";
import { randomUUID } from "crypto"; // For generating unique filenames

// --- Google Cloud Storage Client Initialization ---
let storage: Storage; // Declare storage variable
const gcsBucketName = process.env.GCS_BUCKET_NAME;
const serviceAccountJsonString = process.env.GOOGLE_SERVICE_ACCOUNT;
const gcsCredentialsFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Primary: Try to use the JSON string from GOOGLE_SERVICE_ACCOUNT
if (serviceAccountJsonString) {
  try {
    const serviceAccountCredentials = JSON.parse(serviceAccountJsonString);
    // Basic validation of the parsed credentials object
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
    console.log("Guest Uploads: Initialized Google Cloud Storage with credentials from GOOGLE_SERVICE_ACCOUNT environment variable.");
  } catch (error) {
    console.error(
      "Guest Uploads: Failed to parse or use GOOGLE_SERVICE_ACCOUNT environment variable:",
      error instanceof Error ? error.message : String(error)
    );
    // Fall through to allow other initialization methods if this one fails
  }
}

// Secondary: Fallback to GOOGLE_APPLICATION_CREDENTIALS file path if storage not yet initialized
if (!storage && gcsCredentialsFilePath) {
  try {
    storage = new Storage(); // Uses GOOGLE_APPLICATION_CREDENTIALS by default if set
    console.log("Guest Uploads: Initialized Google Cloud Storage using GOOGLE_APPLICATION_CREDENTIALS file path.");
  } catch (error) {
     console.error(
      "Guest Uploads: Failed to initialize Storage with GOOGLE_APPLICATION_CREDENTIALS:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Tertiary: Attempt default ADC if storage still not initialized
if (!storage) {
  try {
    storage = new Storage();
    console.warn(
      "Guest Uploads: GOOGLE_SERVICE_ACCOUNT and GOOGLE_APPLICATION_CREDENTIALS not set or failed. Attempting default ADC for Storage."
    );
  } catch (error) {
    console.error(
      "Guest Uploads: Failed to initialize Storage with default ADC:",
      error instanceof Error ? error.message : String(error)
    );
    // At this point, storage is likely uninitialized, and POST requests will fail.
  }
}
// --- End of GCS Client Initialization ---


export async function POST(req: NextRequest) {
  // Check if the bucket name is configured
  if (!gcsBucketName) {
    console.error(
      "Guest Uploads: GCS_BUCKET_NAME environment variable is not set. File uploads will fail."
    );
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
    const files = formData.getAll("files") as File[]; // "files" should match your FormData key

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files were uploaded." },
        { status: 400 }
      );
    }

    const uploadedFileDetails: { fileName: string; gcsPath: string; contentType: string }[] = [];
    let filesProcessed = 0;

    for (const file of files) {
      filesProcessed++;
      if (!file.name || !file.type || file.size === 0) {
        console.warn(`Guest Uploads: Skipping an invalid or empty file (File ${filesProcessed}/${files.length}): ${file.name || 'N/A'}`);
        continue;
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      // Sanitize filename and make it unique
      const originalFileName = file.name.replace(/[^\w.-]/g, '_'); // Replace non-alphanumeric chars (except . -) with _
      const uniqueFileName = `${randomUUID()}-${originalFileName}`;
      const gcsFile = storage.bucket(gcsBucketName).file(uniqueFileName);

      const stream = gcsFile.createWriteStream({
        metadata: {
          contentType: file.type,
        },
        resumable: false, // Consider true for large files if you implement retry logic
      });

      // Using a Promise to handle stream events
      await new Promise<void>((resolve, reject) => {
        stream.on("error", (err) => {
          console.error(
            `Guest Uploads: Error uploading ${uniqueFileName} to GCS:`,
            err
          );
          reject(new Error(`Failed to upload ${file.name}. Error: ${err.message}`));
        });
        stream.on("finish", () => {
          uploadedFileDetails.push({
            fileName: file.name, // Original name for reference
            gcsPath: `gs://${gcsBucketName}/${uniqueFileName}`,
            contentType: file.type,
          });
          console.log(`Guest Uploads: Successfully uploaded ${uniqueFileName} to GCS.`);
          resolve();
        });
        stream.end(fileBuffer);
      });
    }

    if (uploadedFileDetails.length === 0 && files.length > 0) {
        return NextResponse.json(
            { success: false, error: "No valid files were processed for upload. Please check the file types or sizes." },
            { status: 400 }
        );
    }
    if (uploadedFileDetails.length === 0 && files.length === 0) {
        // This case is already handled by the initial check, but as a safeguard
         return NextResponse.json(
            { success: false, error: "No files were provided in the upload request." },
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
    //         // guestIdentifier: "some_guest_id_if_you_collect_it",
    //       })),
    //     });
    //     console.log("Guest Uploads: Successfully saved media metadata to database.");
    //   } catch (dbError) {
    //     console.error("Guest Uploads: Database error saving media metadata:", dbError);
    //     // Decide if this should be a critical error for the user.
    //     // For now, we'll just log it and let the GCS upload be considered successful.
    //     // You might want to return a partial success or a warning.
    //   }
    // }
    // --- End Optional Database Save ---

    return NextResponse.json({
      success: true,
      message: `${uploadedFileDetails.length} file(s) uploaded successfully to GCS!`,
      uploadedFiles: uploadedFileDetails,
    });

  } catch (error) {
    console.error("Guest Uploads: Overall file upload process error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during file upload.";
    // Provide more specific error messages if possible
    if (error instanceof Error && error.message.includes("socket hang up")) {
        return NextResponse.json(
          { success: false, error: `Network error during upload. Please try again. Details: ${errorMessage}` },
          { status: 500 }
        );
    }
    return NextResponse.json(
      { success: false, error: `Failed to upload files. ${errorMessage}` },
      { status: 500 }
    );
  }
}