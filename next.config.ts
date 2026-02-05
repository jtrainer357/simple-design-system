/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration to resolve root issues
  experimental: {
    turbo: {
      root: ".",
    },
  },
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
