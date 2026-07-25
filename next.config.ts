import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.yallahsoot.com",
    "https://yallahsoot.com",
  ],

  // Allow Next.js <Image> to serve assets from the stream CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stream.yalashout.online",
      },
      {
        protocol: "https",
        hostname: "imagecache.365scores.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.yallahsoot.com",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
