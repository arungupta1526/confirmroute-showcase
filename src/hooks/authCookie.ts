"use client";

export interface UserProfileData {
  authenticated: boolean;
  user: {
    id: string;
    email?: string;
    displayName?: string;
  } | null;
  planId: string;
  planName: string;
  dailySearchesUsed: number;
  dailyLimit: number;
  remainingSearches: number;
  resetAt: string;
  isDevUnlimited?: boolean;
}

/**
 * Synchronizes client session tokens across document cookies and HttpOnly endpoint.
 */
export function syncAuthCookie(accessToken?: string, refreshToken?: string) {
  if (typeof document === "undefined") return;
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isHttps || process.env.NODE_ENV === "production" ? "; Secure" : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const match = url.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  const projectRef = match ? match[1] : "default";
  const cookieName = `sb-${projectRef}-auth-token`;
  if (accessToken) {
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify([accessToken]))}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    document.cookie = `confirmroute_auth_token=${encodeURIComponent(accessToken)}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    if (refreshToken) {
      document.cookie = `confirmroute_refresh_token=${encodeURIComponent(refreshToken)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
    }
  } else {
    document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    document.cookie = `confirmroute_auth_token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    document.cookie = `confirmroute_refresh_token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
  }

  // Also sync to server HttpOnly cookie endpoint for defense-in-depth against XSS token extraction
  if (typeof window !== "undefined") {
    fetch("/api/auth/cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        accessToken ? { accessToken, refreshToken } : { clear: true }
      ),
    }).catch(() => {});
  }
}
