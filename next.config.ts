import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    {
      source: "/menu",
      destination: "/shop",
      permanent: true,
    },
  ],
};

export default nextConfig;
