import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pour build normal: "standalone"
  // Pour APK: changer à "export"
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
