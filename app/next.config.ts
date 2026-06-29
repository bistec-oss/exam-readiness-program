import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^\/api\/exams/,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "exam-catalog" },
      },
      {
        urlPattern: /^\/api\/challenges/,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "challenge-questions" },
      },
    ],
  },
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
