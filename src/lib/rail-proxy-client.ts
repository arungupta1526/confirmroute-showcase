/**
 * ConfirmRoute Microservice Proxy Client
 * Routes railway intelligence queries from the public Elastic Beanstalk showcase
 * to the private ConfirmRoute core microservice gateway.
 * Contains ZERO proprietary scrapers, scraper tokens, or private curls.
 */

import { RAILWAY_GATEWAY_URL } from "@/src/config/urls.config";

export interface RailGatewayResponse<T = any> {
  success: boolean;
  tool: string;
  data?: T;
  error?: string;
  source?: string;
  timestamp?: string;
}

/**
 * Invoke a railway tool through the authenticated microservice gateway.
 */
export async function invokeRailGateway<T = any>(
  tool: string,
  args: Record<string, any> = {}
): Promise<RailGatewayResponse<T>> {
  const gatewayUrl = (
    process.env.RAILWAY_GATEWAY_URL ||
    process.env.BACKEND_API_URL ||
    RAILWAY_GATEWAY_URL ||
    ""
  ).trim().replace(/\/+$/, "");

  const gatewaySecret = (
    process.env.RAILWAY_GATEWAY_SECRET ||
    process.env.BACKEND_API_SECRET ||
    ""
  ).trim();

  if (!gatewayUrl) {
    return {
      success: false,
      tool,
      error: "RAILWAY_GATEWAY_URL is not configured in environment.",
    };
  }

  try {
    const res = await fetch(`${gatewayUrl}/api/rail-gateway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(gatewaySecret ? { "x-gateway-secret": gatewaySecret } : {}),
        "x-gateway-timestamp": Date.now().toString(),
      },
      body: JSON.stringify({ tool, args }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        tool,
        error: `Gateway returned HTTP ${res.status}: ${errText}`,
      };
    }

    const json = await res.json();
    return json;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      tool,
      error: `Network error reaching gateway: ${errorMsg}`,
    };
  }
}
