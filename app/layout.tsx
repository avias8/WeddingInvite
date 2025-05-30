import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Assuming these are custom font configurations

const geistSans = Geist({ // Replace with your actual Geist configuration if different
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({ // Replace with your actual Geist Mono configuration
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteTitle = "Avi & Shakthi's Wedding - June 29, 2025";
const siteDescription = "You're invited to the wedding of Avi Varma and Shakthi Ganesh on June 29, 2025 in Sylvan Lake, Alberta. Find all the details and RSVP here!";
// Ensure this path is relative to the `public` folder or an absolute URL if hosted elsewhere.
const siteImageUrl = "/Images/wedding-banner.png"; // Example: if wedding-banner.png is in public/Images/
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Fallback for local dev

export const metadata: Metadata = {
  // Recommended: Set metadataBase for resolving social media image URLs
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    images: [
      {
        url: siteImageUrl, // Next.js will automatically prefix this with metadataBase
        width: 1200,
        height: 630,
        alt: 'Avi & Shakthi Wedding Banner',
      },
    ],
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [siteImageUrl], // Next.js will automatically prefix this with metadataBase
  },
  // Consider adding icons for apple-touch-icon etc.
  icons: {
    icon: '/favicon.ico', // Relative to public folder
    apple: '/apple-touch-icon.png', // Create this file in /public
    // You can also specify different sizes for apple-touch-icon
    // apple: [
    //   { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
    //   { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    // ],
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        id="__next" // Required by react-modal
        className={`${geistSans.variable} ${geistMono.variable} text-gray-900 antialiased`}
        style={{ backgroundColor: "var(--color-background)" }} // Using your CSS variable
      >
        {children}
        <footer className="bg-gray-800 text-white text-center py-4 mt-6">
          <p>© 2025 Avi Varma & Family. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
