import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://digitalassets.tesla.com https://mediapool.bmwgroup.com https://www.polestar.com https://media.crystallize.com https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.algolia.net https://*.algolianet.com https://api.openai.com https://vitals.vercel-insights.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  compress: true,
  ...(process.env.NEXT_OUTPUT_STANDALONE === "false" || isVercel
    ? {}
    : { output: "standalone" as const }),
  typedRoutes: true,
  transpilePackages: ["@nordicdrive/database", "@nordicdrive/types"],
  images: {
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000,
    qualities: [75, 82, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "digitalassets.tesla.com",
      },
      {
        protocol: "https",
        hostname: "mediapool.bmwgroup.com",
      },
      {
        protocol: "https",
        hostname: "www.polestar.com",
      },
      {
        protocol: "https",
        hostname: "media.crystallize.com",
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy,
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
    ];

    return [
      {
        headers: securityHeaders,
        source: "/(.*)",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=3600",
          },
        ],
        source: "/api/home",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=600",
          },
        ],
        source: "/api/cars/search",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=1800",
          },
        ],
        source: "/api/compare",
      },
    ];
  },
};

export default nextConfig;
