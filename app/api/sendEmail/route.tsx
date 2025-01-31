import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Force dynamic execution (not static caching)
export const dynamic = "force-dynamic";

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER as string,
    pass: process.env.GMAIL_PASS as string,
  },
});

/**
 * ✅ API Route to send an email.
 */
export async function POST(req: NextRequest) {
  try {
    const { to, subject, htmlContent, token } = await req.json();

    if (!to || !subject || !htmlContent || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"Avi & Shakthi" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);

    // ✅ Update the database to store `emailSentAt`
    await prisma.invitee.update({
      where: { token },
      data: { emailSentAt: new Date() },
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}