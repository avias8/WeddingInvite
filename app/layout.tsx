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

const title = "Avi & Shakthi's Wedding - June 29, 2025";
const description = "You're invited to the wedding of Avi Varma and Shakthi Ganesh on June 29, 2025 in Sylvan Lake, Alberta. Find all the details and RSVP here!";
const imageUrl = "Images/wedding-banner.png"; 
const url = "https://wedding.avivarma.ca";

export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: url,
    images: [
      {
        url: imageUrl,
        width: 1200, // Adjust as needed
        height: 630, // Adjust as needed
        alt: 'Avi & Shakthi Wedding Banner',
      },
    ],
    type: 'website',
    locale: 'en_CA',
  },
  // Optional: Add Twitter card information
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [imageUrl],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        id="__next" // Required by react-modal
        className={`${geistSans.variable} ${geistMono.variable} text-gray-900 antialiased`}
        style={{ backgroundColor: "#fef8f5" }} // Apply your custom color
      >
        {children}
        <footer className="bg-gray-800 text-white text-center py-4 mt-6">
          <p>© 2025 Avi Varma & Family. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}