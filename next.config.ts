import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@types/multer"],
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
