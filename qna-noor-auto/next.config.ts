import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Identifix CSV imports (C.csv is ~3 MB) exceed the 1 MB default for
  // server-action bodies. 20 MB gives headroom for larger shop exports.
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
