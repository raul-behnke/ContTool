import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/blog",
  output: "standalone",
  images: { remotePatterns: [] },
};

export default nextConfig;
