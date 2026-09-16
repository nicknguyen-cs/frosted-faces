import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project. Next otherwise infers the root
    // from the outermost lockfile it finds walking up the tree; a stray
    // ~/package-lock.json makes it pick the home directory, which breaks HMR
    // ("Next.js package not found") and puts `next dev` in a reload loop.
    root: path.join(__dirname),
  },
};

export default nextConfig;
