import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the Next.js DevTools indicator in the corner
  devIndicators: false,
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xsgames.co",
        pathname: "/randomusers/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/**",
      },
    ],
  },
};

export default nextConfig;
