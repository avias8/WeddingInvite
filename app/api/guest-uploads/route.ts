// app/api/guest-uploads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto"; // For generating unique filenames

// Initialize Google Cloud Storage client
// The client automatically uses GOOGLE_APPLICATION_CREDENTIALS environment variable
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

export async function POST(req: NextRequest) {
  // Check if the bucket name is configured
  if (!bucketName) {
    console.error(
      "GCS_BUCKET_NAME environment variable is not set. File uploads will fail."
    );
    return NextResponse.json(
      { success: false, error: "Server configuration error for file uploads." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[]; // "files" should match your FormData key on the client

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files were uploaded." },
        { status: 400 }
      );
    }

    const uploadedFileDetails: { fileName: string; gcsPath: string }[] = [];

    // Process each file
    for (const file of files) {
      if (!file.name || !file.type || file.size === 0) {
        console.warn("Skipping an invalid or empty file:", file);
        continue; // Skip this file and proceed with others
      }

      // Convert the file stream (from file.stream()) to a Buffer
      // Next.js Edge runtime might provide file.arrayBuffer() directly
      // For Node.js runtime, req.formData() gives File objects with arrayBuffer method
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Create a unique filename to prevent overwrites in GCS
      const uniqueFileName = `${randomUUID()}-${file.name.replace(/\s+/g, '_')}`; // Replace spaces for safety
      const gcsFile = storage.bucket(bucketName).file(uniqueFileName);

      // Create a writable stream to GCS
      const stream = gcsFile.createWriteStream({
        metadata: {
          contentType: file.type, // Set the content type for the uploaded file
        },
        resumable: false, // Use false for simpler uploads, true for large files with retries
      });

      // Create a promise to handle stream events
      await new Promise<void>((resolve, reject) => {
        stream.on("error", (err) => {
          console.error(
            `Error uploading ${uniqueFileName} to GCS:`,
            err
          );
          reject(new Error(`Failed to upload ${file.name}.`));
        });
        stream.on("finish", () => {
          // File uploaded successfully as a private object
          uploadedFileDetails.push({
            fileName: file.name,
            gcsPath: `gs://${bucketName}/${uniqueFileName}`, // Standard GCS URI
          });
          resolve();
        });
        stream.end(fileBuffer); // Write the buffer to the stream
      });
    }

    if (uploadedFileDetails.length === 0 && files.length > 0) {
        return NextResponse.json(
            { success: false, error: "No valid files were processed for upload." },
            { status: 400 }
        );
    }

    // --- Optional: Save file metadata to your Prisma database ---
    // Example:
    // if (uploadedFileDetails.length > 0 && prisma) { // Check if prisma is initialized
    //   try {
    //     await prisma.guestMedia.createMany({
    //       data: uploadedFileDetails.map(detail => ({
    //         originalFileName: detail.fileName,
    //         gcsPath: detail.gcsPath,
    //         uploadedAt: new Date(),
    //         // guestIdentifier: "some_guest_id_if_you_collect_it", // If you track who uploaded
    //       })),
    //     });
    //   } catch (dbError) {
    //     console.error("Database error saving media metadata:", dbError);
    //     // Decide if this should be a critical error for the user
    //     // For now, we'll just log it and let the upload be successful
    //   }
    // }
    // --- End Optional Database Save ---

    return NextResponse.json({
      success: true,
      message: `${uploadedFileDetails.length} file(s) uploaded successfully!`,
      uploadedFiles: uploadedFileDetails,
    });
  } catch (error) {
    console.error("Overall file upload process error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during file upload.";
    return NextResponse.json(
      { success: false, error: `Failed to upload files. ${errorMessage}` },
      { status: 500 }
    );
  }
}
