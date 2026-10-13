import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export interface ResolvedUser {
  id: string;
  email?: string;
  displayName?: string;
}

// In-memory verification cache to prevent duplicate remote auth calls across concurrent requests
interface CachedUserEntry {
  user: ResolvedUser;
  expiresAt: number;
}
const verifiedUserCache = new Map<string, CachedUserEntry>();
const AUTH_CACHE_TTL_MS = 60_000; // 60 seconds
const MAX_VERIFIED_USER_CACHE_SIZE = 500;
let lastAuthCachePrune = Date.now();
const AUTH_CACHE_PRUNE_INTERVAL_MS = 60_000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function pruneAuthCache(now: number) {
  for (const [key, value] of verifiedUserCache.entries()) {
    if (value.expiresAt <= now) {
      verifiedUserCache.delete(key);
    }
  }
  if (verifiedUserCache.size > MAX_VERIFIED_USER_CACHE_SIZE) {
    const toDeleteCount = verifiedUserCache.size - MAX_VERIFIED_USER_CACHE_SIZE;
    let deleted = 0;
    for (const key of verifiedUserCache.keys()) {
      verifiedUserCache.delete(key);
      deleted++;
      if (deleted >= toDeleteCount) break;
    }
  }
  lastAuthCachePrune = now;
}

const JWT_FORMAT_REGEX = /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]*$/;

export function isValidJwtFormat(candidate: unknown): boolean {
  if (typeof candidate !== "string") return false;
  const trimmed = candidate.trim();
  return trimmed.length > 20 && JWT_FORMAT_REGEX.test(trimmed);
}

let cachedAuthClient: ReturnType<typeof createClient> | null = null;
let cachedAuthClientUrl = "";
let cachedAuthClientKey = "";

export function getAuthSupabaseClient(url: string, key: string) {
  if (!cachedAuthClient || cachedAuthClientUrl !== url || cachedAuthClientKey !== key) {
    cachedAuthClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    cachedAuthClientUrl = url;
    cachedAuthClientKey = key;
  }
  return cachedAuthClient;
}

/**
 * Extracts and verifies the authenticated Supabase user from the incoming request.
 * Checks Bearer Authorization header first, then Supabase and custom cookies.
 */
export async function getAuthenticatedUser(req: Request): Promise<ResolvedUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // 1. Check Bearer token in Authorization header
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    const candidate = authHeader.slice(7).trim();
    if (isValidJwtFormat(candidate)) {
      token = candidate;
    }
  }

  // 2. Check Supabase and custom cookies if no header token
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || "";

    const crMatch = cookieHeader.match(/confirmroute_auth_token=([^;]+)/);
    if (crMatch && crMatch[1]) {
      const decoded = decodeURIComponent(crMatch[1]).trim();
      if (isValidJwtFormat(decoded)) {
        token = decoded;
      }
    }

    if (!token) {
      const match = cookieHeader.match(/sb-[a-zA-Z0-9_-]+-auth-token(?:[.-]\d+)?=([^;]+)/);
      if (match && match[1]) {
        try {
          const decoded = decodeURIComponent(match[1]);
          const parsed = JSON.parse(decoded);
          const candidate = Array.isArray(parsed) ? parsed[0] : parsed?.access_token || decoded;
          if (isValidJwtFormat(candidate)) {
            token = candidate;
          }
        } catch {
          const raw = decodeURIComponent(match[1]).trim();
          if (isValidJwtFormat(raw)) {
            token = raw;
          }
        }
      }
    }
  }

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const cached = verifiedUserCache.get(tokenHash);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.user;
  }

  try {
    const supabase = getAuthSupabaseClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      verifiedUserCache.delete(tokenHash);
      return null;
    }

    const resolved: ResolvedUser = {
      id: user.id,
      email: user.email,
      displayName:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0],
    };

    const now = Date.now();
    verifiedUserCache.set(tokenHash, {
      user: resolved,
      expiresAt: now + AUTH_CACHE_TTL_MS,
    });

    if (now - lastAuthCachePrune > AUTH_CACHE_PRUNE_INTERVAL_MS || verifiedUserCache.size > MAX_VERIFIED_USER_CACHE_SIZE) {
      pruneAuthCache(now);
    }

    return resolved;
  } catch (err) {
    console.warn("[Auth] Failed to verify user token in showcase:", err);
    return null;
  }
}
