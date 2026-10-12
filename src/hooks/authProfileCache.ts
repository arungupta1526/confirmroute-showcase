import { Session, User } from "@supabase/supabase-js";
import { UserProfileData } from "./authCookie";
import { getClientDeviceId, getOrCreateAnonymousSessionId } from "@/src/lib/auth/deviceId";

// Module-level deduplication cache to prevent repetitive /api/user/profile requests
export let cachedProfile: UserProfileData | null = null;
export let lastProfileFetchTime = 0;
export let inflightProfilePromise: Promise<UserProfileData | null> | null = null;
export const PROFILE_CACHE_TTL_MS = 15_000; // 15s cache TTL
export const MAX_AUTH_LISTENERS = 100; // Cap listeners to prevent memory leaks

// Global shared auth state across all useAuth() instances (client-side only)
export const authState = {
  session: null as Session | null,
  user: null as User | null,
  profile: null as UserProfileData | null,
  isLoading: true,
  isInitialized: false,
};

export const authListeners = new Set<() => void>();

export function clearProfileCache() {
  cachedProfile = null;
  lastProfileFetchTime = 0;
  authState.session = null;
  authState.user = null;
  authState.profile = null;
}

export function notifyAuthListeners() {
  if (typeof window === "undefined") return;
  authListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

/**
 * Optimistically updates remaining searches in memory and notifies all subscriber components
 */
export function updateCachedProfileQuota(remainingSearches: number) {
  if (authState.profile) {
    const limit = authState.profile.dailyLimit || 5;
    authState.profile = {
      ...authState.profile,
      remainingSearches,
      dailySearchesUsed: Math.max(0, limit - remainingSearches),
    };
    if (cachedProfile) {
      cachedProfile = { ...authState.profile };
    }
    notifyAuthListeners();
  }
}

// Reactively listen for Dev Unlimited toggle to immediately update all subscribed components
if (typeof window !== "undefined") {
  window.addEventListener("confirmroute:dev-unlimited-changed", (e: any) => {
    cachedProfile = null;
    lastProfileFetchTime = 0;
    const enabled = Boolean(e?.detail?.enabled);
    if (authState.profile) {
      authState.profile = {
        ...authState.profile,
        isDevUnlimited: enabled,
        remainingSearches: enabled
          ? 999999
          : Math.max(0, (authState.profile.dailyLimit || 10) - (authState.profile.dailySearchesUsed || 0)),
        dailyLimit: enabled ? 999999 : authState.profile.dailyLimit || 10,
      };
      notifyAuthListeners();
    }
    fetchProfileGlobal(authState.session?.access_token, true);
  });
}

export async function fetchProfileGlobal(token?: string, force: boolean = false): Promise<UserProfileData | null> {
  const now = Date.now();
  if (!force && cachedProfile && now - lastProfileFetchTime < PROFILE_CACHE_TTL_MS) {
    authState.profile = cachedProfile;
    notifyAuthListeners();
    return cachedProfile;
  }

  if (inflightProfilePromise) {
    const res = await inflightProfilePromise;
    if (res) {
      authState.profile = res;
      notifyAuthListeners();
    }
    return res;
  }

  inflightProfilePromise = (async () => {
    try {
      const headers: Record<string, string> = {};
      const activeToken = token || authState.session?.access_token;
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      if (typeof window !== "undefined") {
        if (localStorage.getItem("confirmroute_dev_unlimited") === "true") {
          headers["x-dev-unlimited"] = "true";
        }
        const anonId = getOrCreateAnonymousSessionId();
        if (anonId) {
          headers["x-anonymous-session-id"] = anonId;
        }
        try {
          const devId = getClientDeviceId();
          if (devId) {
            headers["x-device-id"] = devId;
          }
        } catch {}
      }
      const res = await fetch("/api/user/profile", { headers });
      if (res.ok) {
        const data: UserProfileData = await res.json();
        cachedProfile = data;
        lastProfileFetchTime = Date.now();
        authState.profile = data;
        return data;
      }
    } catch (err) {
      console.warn("[useAuth] Failed to load user profile:", err);
    } finally {
      inflightProfilePromise = null;
    }
    return null;
  })();

  const data = await inflightProfilePromise;
  if (data) {
    authState.profile = data;
    notifyAuthListeners();
  }
  return data;
}
