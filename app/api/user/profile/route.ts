import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Showcase User Profile API
 * Returns lightweight guest traveler profile for hackathon evaluation
 */
export async function GET() {
  return NextResponse.json({
    authenticated: false,
    user: null,
    planId: "guest",
    planName: "Guest Traveler",
    dailySearchesUsed: 0,
    dailyLimit: 10,
    remainingSearches: 10,
    isDevUnlimited: true,
    resetAt: "00:00 IST",
  });
}
