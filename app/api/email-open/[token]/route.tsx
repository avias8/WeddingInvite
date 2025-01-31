import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ API Route: Track Email Opens via an Invisible 1x1 Pixel Image.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> } // 🔥 Fix: Await `params`
) {
  try {
    const { token } = await context.params; // 🔥 Fix: Await params

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    console.log(`📩 Tracking email open for token: ${token}`);

    // Attempt to update the `emailOpenedAt` timestamp
    const updatedInvitee = await prisma.invitee.update({
      where: { token },
      data: { emailOpenedAt: new Date() },
    });

    if (!updatedInvitee) {
      console.warn(`⚠️ No invitee found with token: ${token}`);
      return NextResponse.json({ error: "Invitee not found" }, { status: 404 });
    }

    console.log(`✅ Email open recorded for: ${updatedInvitee.email}`);

    // Return a transparent 1x1 pixel image
    const pixelBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epxTKIAAAAASUVORK5CYII=",
      "base64"
    );

    return new NextResponse(pixelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixelBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ Error tracking email open:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}