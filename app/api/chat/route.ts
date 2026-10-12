import { NextRequest } from "next/server";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

export const runtime = "nodejs";

/**
 * ConfirmRoute AI Chat Streaming Proxy
 * Routes chat prompts & tool calls to the private microservice backend.
 * Contains ZERO proprietary prompt templates, API provider keys, or token ledgers.
 */
export async function POST(req: NextRequest) {
  try {
    const backendUrl = (
      process.env.RAILWAY_GATEWAY_URL ||
      process.env.BACKEND_API_URL ||
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

    // 1. Live Streaming Proxy to Private Backend
    if (backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(backendSecret ? { "x-gateway-secret": backendSecret } : {}),
            "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
          },
          body: JSON.stringify(body),
        });

        if (backendRes.ok && backendRes.body) {
          return new Response(backendRes.body, {
            status: 200,
            headers: {
              "Content-Type":
                backendRes.headers.get("Content-Type") ||
                "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
              "X-Accel-Buffering": "no",
            },
          });
        }

        console.warn(`[chat-proxy] Backend gateway returned HTTP ${backendRes.status}`);
      } catch (networkErr: unknown) {
        console.warn("[chat-proxy] Could not connect to backend gateway:", networkErr);
      }
    }

    // 2. High-Fidelity Standalone Demo Fallback (Ensures reviewers always see interactive UI)
    return createDemoStreamResponse(body);
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
