// app/api/send-custom-email/route.tsx
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Force dynamic execution
export const dynamic = "force-dynamic";

// Nodemailer transporter setup (ensure your .env variables are set)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * POST /api/send-custom-email
 * Sends a custom email to a list of recipients.
 *
 * Expected JSON body:
 * {
 * "recipients": ["email1@example.com", "email2@example.com"],
 * "subject": "Your Custom Subject",
 * "htmlContent": "<p>Your HTML email body here.</p>"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { recipients, subject, htmlContent } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "Recipients array is required and cannot be empty." }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!htmlContent || typeof htmlContent !== 'string') {
      return NextResponse.json({ error: "HTML content is required." }, { status: 400 });
    }

    // Sending email to each recipient
    // Note: For a large number of recipients, consider sending in batches or using a dedicated email service.
    const sendPromises = recipients.map(async (recipientEmail) => {
      try {
        const info = await transporter.sendMail({
          from: `"Avi & Shakthi" <${process.env.GMAIL_USER}>`,
          to: recipientEmail,
          subject: subject,
          html: htmlContent,
        });
        console.log(`✅ Custom email sent to ${recipientEmail}: ${info.messageId}`);
        return { email: recipientEmail, success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`❌ Error sending custom email to ${recipientEmail}:`, error);
        return { email: recipientEmail, success: false, error: (error as Error).message };
      }
    });

    const results = await Promise.all(sendPromises);
    const allSuccessful = results.every(r => r.success);

    if (allSuccessful) {
      return NextResponse.json({ success: true, message: "Custom emails sent successfully to all recipients.", results });
    } else {
      // If some emails failed, you might want to return a mixed success/failure response
      return NextResponse.json({ success: false, message: "Some custom emails could not be sent.", results }, { status: 207 }); // 207 Multi-Status
    }

  } catch (error) {
    console.error("❌ Error processing custom email request:", error);
    return NextResponse.json({ error: "Failed to process custom email request.", details: (error as Error).message }, { status: 500 });
  }
}