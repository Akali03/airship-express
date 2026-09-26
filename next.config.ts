import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.5"],
  typescript: {
    ignoreBuildErrors: true,
  },

  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "qpdf-wasm",
  ],

  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/qpdf-wasm/dist/**/*",
    ],
  },
};

export default nextConfig;
