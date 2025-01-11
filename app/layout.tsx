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
  title: "Avi & Shakthi's Wedding",
  description: "Manage and RSVP for wedding invites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        id="__next" // Added id for react-modal to function properly
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <main>
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center py-4 mt-6">
          <p>© 2025 Avi Varma & Family. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
