/**
 * Showcase Daily Search Quota & Usage Tracker
 * Enforces:
 * - Guest: 15 searches / day
 * - Logged-in User: 50 searches / day
 * Resets daily at 00:00 IST.
 */

export const GUEST_DAILY_LIMIT = 15;
export const LOGGED_IN_DAILY_LIMIT = 50;

// In-memory daily counter: `${dateKeyIST}:${identityKey}` -> count
const usageMap = new Map<string, number>();

export function getTodayKeyIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getIdentityKey(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;

  const cookieHeader = req.headers.get("cookie") || "";
  const anonMatch = cookieHeader.match(/confirmroute_anon_session_id=([^;]+)/);
  if (anonMatch) {
    return `guest:${decodeURIComponent(anonMatch[1]).trim()}`;
  }

  const headerAnon = req.headers.get("x-anonymous-session-id");
  if (headerAnon) {
    return `guest:${headerAnon.trim()}`;
  }

  const deviceMatch = cookieHeader.match(/confirmroute_device_id=([^;]+)/);
  if (deviceMatch) {
    return `device:${decodeURIComponent(deviceMatch[1]).trim()}`;
  }

  const headerDevice = req.headers.get("x-device-id");
  if (headerDevice) {
    return `device:${headerDevice.trim()}`;
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
  return `guest:ip:${ip}`;
}

export function getUsageCount(identityKey: string): number {
  const dateKey = getTodayKeyIST();
  return usageMap.get(`${dateKey}:${identityKey}`) || 0;
}

export function incrementUsageCount(identityKey: string): number {
  const dateKey = getTodayKeyIST();
  const fullKey = `${dateKey}:${identityKey}`;
  const current = usageMap.get(fullKey) || 0;
  const next = current + 1;
  usageMap.set(fullKey, next);
  return next;
}
