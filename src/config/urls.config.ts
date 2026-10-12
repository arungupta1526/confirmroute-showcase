/**
 * Application & Service Endpoints Configuration
 */

// Site Public URL
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://confirmroute.in"
).replace(/\/+$/, "");

export const DEFAULT_SITE_URL = SITE_URL;

// Social & Sharing Endpoints
export const WHATSAPP_SHARE_URL = "https://api.whatsapp.com/send";
