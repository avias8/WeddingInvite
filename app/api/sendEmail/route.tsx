import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Ensure this runs **only on the server**
export const dynamic = "force-dynamic"; 

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
 * API Route to send an email.
 */
export async function POST(req: Request) {
  try {
    const { to, subject, htmlContent } = await req.json();

    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const info = await transporter.sendMail({
      from: `"Avi & Shakthi" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}