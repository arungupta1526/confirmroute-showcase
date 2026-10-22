/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss: https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "0.1.0",
    ConfirmRoute_TM:
      process.env.ConfirmRoute_TM ||
      process.env.CONFIRMROUTE_TM ||
      process.env.NEXT_PUBLIC_CONFIRMROUTE_TM ||
      "",
    ConfirmRoute_R:
      process.env.ConfirmRoute_R ||
      process.env.CONFIRMROUTE_R ||
      process.env.NEXT_PUBLIC_CONFIRMROUTE_R ||
      "",
    CONFIRMROUTE_TM:
      process.env.CONFIRMROUTE_TM ||
      process.env.ConfirmRoute_TM ||
      process.env.NEXT_PUBLIC_CONFIRMROUTE_TM ||
      "",
    CONFIRMROUTE_R:
      process.env.CONFIRMROUTE_R ||
      process.env.ConfirmRoute_R ||
      process.env.NEXT_PUBLIC_CONFIRMROUTE_R ||
      "",
    ConfirmRoute_SYMBOL:
      process.env.ConfirmRoute_SYMBOL ||
      process.env.BRAND_TRADEMARK_SYMBOL ||
      process.env.NEXT_PUBLIC_BRAND_TRADEMARK_SYMBOL ||
      "",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const backendUrl = (
      process.env.RAILWAY_GATEWAY_URL ||
      process.env.BACKEND_API_URL ||
      "http://localhost:3000"
    )
      .trim()
      .replace(/\/+$/, "");

    return [
      {
        source: "/api/auth/check-user-exists",
        destination: `${backendUrl}/api/auth/check-user-exists`,
      },
      {
        source: "/api/auth/validate-email",
        destination: `${backendUrl}/api/auth/validate-email`,
      },
      {
        source: "/api/auth/log-event",
        destination: `${backendUrl}/api/auth/log-event`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/support",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
  // Webpack is retained (--webpack in npm scripts) because @modelcontextprotocol/sdk
  // uses ESM imports with '.js' extensions that map to local '.ts' source files.
  turbopack: {},
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
