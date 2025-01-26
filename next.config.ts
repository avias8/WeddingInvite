import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React strict mode
  images: {
    domains: ["storage.googleapis.com"], // Add your external image domain here
  },
};

export default nextConfig;
