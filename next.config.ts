import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/menu",
      destination: "/shop",
      permanent: true,
    },
  ],
};

export default nextConfig;
