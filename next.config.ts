import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fjhohlgesdtglkdworhe.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'rmjwtruvfgddcubonjlz.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  serverExternalPackages: ['@remotion/renderer', '@remotion/lambda'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
