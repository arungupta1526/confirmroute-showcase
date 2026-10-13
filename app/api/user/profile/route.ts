import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/src/lib/auth/serverAuth";
import {
  GUEST_DAILY_LIMIT,
  LOGGED_IN_DAILY_LIMIT,
  getIdentityKey,
  getUsageCount,
} from "@/src/lib/quota/showcaseQuota";

export const runtime = "nodejs";

/**
 * Showcase User Profile API
 * Enforces:
 * - Guest: 15 searches / day
 * - Logged-in User: 50 searches / day
 * Respects x-dev-unlimited header if explicitly toggled by developer.
 */
export async function GET(req: Request) {
  try {
    const isDevUnlimited = req.headers.get("x-dev-unlimited") === "true";
    const user = await getAuthenticatedUser(req);
    const identityKey = getIdentityKey(req, user?.id);
    const used = getUsageCount(identityKey);

    if (user) {
      const limit = isDevUnlimited ? 999999 : LOGGED_IN_DAILY_LIMIT;
      const remaining = isDevUnlimited ? 999999 : Math.max(0, limit - used);

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "Traveler",
        },
        planId: "traveler_free",
        planName: "Registered Traveler (50/day)",
        dailySearchesUsed: used,
        dailyLimit: limit,
        remainingSearches: remaining,
        isDevUnlimited,
        resetAt: isDevUnlimited ? "Unlimited (Dev Mode)" : "00:00 IST (Daily)",
      });
    }

    const limit = isDevUnlimited ? 999999 : GUEST_DAILY_LIMIT;
    const remaining = isDevUnlimited ? 999999 : Math.max(0, limit - used);

    return NextResponse.json({
      authenticated: false,
      user: null,
      planId: "guest",
      planName: "Guest Traveler (15/day)",
      dailySearchesUsed: used,
      dailyLimit: limit,
      remainingSearches: remaining,
      isDevUnlimited,
      resetAt: isDevUnlimited ? "Unlimited (Dev Mode)" : "00:00 IST (Daily)",
    });
  } catch (err: unknown) {
    console.error("[Profile API] Error fetching user profile:", err);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        planId: "guest",
        planName: "Guest Traveler (15/day)",
        dailySearchesUsed: 0,
        dailyLimit: GUEST_DAILY_LIMIT,
        remainingSearches: GUEST_DAILY_LIMIT,
        isDevUnlimited: false,
        resetAt: "00:00 IST (Daily)",
      },
      { status: 200 }
    );
  }
}
