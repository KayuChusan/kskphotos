import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  experimental: {
    serverActions: {
      // RAW (ARW) ファイルのアップロードを許容
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
