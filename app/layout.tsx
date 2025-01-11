import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Event Invite Manager",
  description: "Manage and RSVP for event invites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <header className="bg-blue-600 text-white py-4 shadow-lg">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-bold">Event Invite Manager</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">{children}</main>
        <footer className="bg-gray-800 text-white text-center py-4 mt-6">
          <p>© 2025 Event Manager. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
