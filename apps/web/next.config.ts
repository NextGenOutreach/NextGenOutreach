import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
