/**
 * Application & Service Endpoints Configuration
 */

// Site Public URL
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://confirmroute.in"
).replace(/\/+$/, "");

export const DEFAULT_SITE_URL = SITE_URL;

// Railway Intelligence Microservice Gateway (Private Core Backend)
export const RAILWAY_GATEWAY_URL = (
  process.env.RAILWAY_GATEWAY_URL ||
  process.env.BACKEND_API_URL ||
  "https://www.confirmroute.com"
).trim().replace(/\/+$/, "");

// Social & Sharing Endpoints
export const WHATSAPP_SHARE_URL = "https://api.whatsapp.com/send";
