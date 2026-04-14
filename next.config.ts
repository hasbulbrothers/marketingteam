import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    resolveAlias: {
      "@clerk/shared": path.resolve("./node_modules/@clerk/shared"),
    },
  },
};

export default nextConfig;
