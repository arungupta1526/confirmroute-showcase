import { NextResponse } from "next/server";
import {
  MAX_SESSION_USER_TURNS,
  WARNING_SESSION_USER_TURNS,
  BACKEND_MAX_CONTEXT_MESSAGES,
} from "@/src/config/chat-limits";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      maxUserTurns: MAX_SESSION_USER_TURNS,
      warningTurns: WARNING_SESSION_USER_TURNS,
      backendMaxMessages: BACKEND_MAX_CONTEXT_MESSAGES,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
