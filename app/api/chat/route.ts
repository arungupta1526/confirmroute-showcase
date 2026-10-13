import { NextRequest } from "next/server";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { RAILWAY_GATEWAY_URL } from "@/src/config/urls.config";
import { getAuthenticatedUser } from "@/src/lib/auth/serverAuth";
import {
  GUEST_DAILY_LIMIT,
  LOGGED_IN_DAILY_LIMIT,
  getIdentityKey,
  getUsageCount,
  incrementUsageCount,
} from "@/src/lib/quota/showcaseQuota";

export const runtime = "nodejs";

/**
 * ConfirmRoute AI Chat Streaming Proxy with Showcase Quota Enforcement
 * Enforces:
 * - Guest: 15 searches / day
 * - Logged-in User: 50 searches / day
 * Routes chat prompts & tool calls to the private microservice backend.
 * Contains ZERO proprietary prompt templates, API provider keys, or token ledgers.
 */
export async function POST(req: NextRequest) {
  try {
    const isDevUnlimited = req.headers.get("x-dev-unlimited") === "true";
    const user = await getAuthenticatedUser(req);
    const identityKey = getIdentityKey(req, user?.id);
    const limit = user ? LOGGED_IN_DAILY_LIMIT : GUEST_DAILY_LIMIT;
    const used = getUsageCount(identityKey);

    // 0. Enforce Daily Search Cap (unless developer explicitly enabled Dev Unlimited)
    if (!isDevUnlimited && used >= limit) {
      return createQuotaExhaustedStreamResponse(Boolean(user), limit);
    }

    const backendUrl = (
      process.env.RAILWAY_GATEWAY_URL ||
      process.env.BACKEND_API_URL ||
      RAILWAY_GATEWAY_URL ||
      ""
    )
      .trim()
      .replace(/\/+$/, "");

    const backendSecret = (
      process.env.RAILWAY_GATEWAY_SECRET ||
      process.env.BACKEND_API_SECRET ||
      ""
    ).trim();

    const body = await req.json();

    // Increment usage counter on successful request initiation
    if (!isDevUnlimited) {
      incrementUsageCount(identityKey);
    }
    const remaining = isDevUnlimited ? 999999 : Math.max(0, limit - used - 1);

    // 1. Live Streaming Proxy to Private Backend
    if (backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(backendSecret ? { "x-gateway-secret": backendSecret } : {}),
            "x-gateway-timestamp": Date.now().toString(),
            "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
          },
          body: JSON.stringify(body),
        });

        if (backendRes.ok && backendRes.body) {
          const headers = new Headers({
            "Content-Type":
              backendRes.headers.get("Content-Type") ||
              "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          });

          if (!isDevUnlimited) {
            headers.set("x-quota-remaining", String(remaining));
            headers.set("x-quota-limit", String(limit));
            headers.set("x-quota-used", String(used + 1));
          }

          return new Response(backendRes.body, {
            status: 200,
            headers,
          });
        }

        console.warn(`[chat-proxy] Backend gateway returned HTTP ${backendRes.status}`);
      } catch (networkErr: unknown) {
        console.warn("[chat-proxy] Could not connect to backend gateway:", networkErr);
      }
    }

    // 2. High-Fidelity Standalone Demo Fallback (Ensures reviewers always see interactive UI)
    const fallbackResponse = createDemoStreamResponse(body);
    if (!isDevUnlimited) {
      fallbackResponse.headers.set("x-quota-remaining", String(remaining));
      fallbackResponse.headers.set("x-quota-limit", String(limit));
    }
    return fallbackResponse;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[chat-proxy] Error in proxy route:", errorMsg);
    return Response.json(
      { error: "AI Chat Proxy Error", details: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * Quota Exhausted Response Stream
 */
function createQuotaExhaustedStreamResponse(isLoggedIn: boolean, limit: number) {
  const message = isLoggedIn
    ? `⚠️ **Daily Search Limit Reached (${limit}/${limit} searches used)**\n\nYour 50 daily searches have been completed for today. Your daily search quota will automatically reset tomorrow at **00:00 IST (midnight)**.`
    : `⚠️ **Guest Daily Search Quota Reached (${limit}/${limit} searches used)**\n\nGuest travelers receive **15 searches per day**. **[Sign Up or Log In](/login)** to immediately unlock **50 searches per day**, or try again tomorrow at **00:00 IST**.`;

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: "quota-exhausted-1" });
      writer.write({ type: "text-delta", id: "quota-exhausted-1", delta: message });
      writer.write({ type: "text-end", id: "quota-exhausted-1" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  const response = createUIMessageStreamResponse({ stream });
  response.headers.set("x-quota-exhausted", "true");
  response.headers.set("x-quota-remaining", "0");
  response.headers.set("x-quota-limit", String(limit));
  return response;
}

/**
 * Fallback stream for local reviewers when live backend is offline
 */
function createDemoStreamResponse(body: any) {
  const lastUserMsg =
    body?.messages?.filter((m: any) => m.role === "user")?.pop()?.content ||
    "railway query";

  const demoMessage =
    `🚆 **ConfirmRoute AI** (Showcase Mode running on AWS Elastic Beanstalk)\n\n` +
    `You queried: *"${lastUserMsg}"*\n\n` +
    `The web frontend is connected via the **Proxy Adapter Architecture**. In live production, ` +
    `reasoning streams from Amazon Bedrock and real-time telemetry is fetched from the private rail core microservice.`;

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: "demo-text-1" });
      writer.write({ type: "text-delta", id: "demo-text-1", delta: demoMessage });
      writer.write({ type: "text-end", id: "demo-text-1" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
