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
};

export default nextConfig;
