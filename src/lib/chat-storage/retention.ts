import { ChatSession, getStorageKey } from "./types";

/**
 * Returns the chat history retention in days based on the user's plan.
 * - Guest: 3 days (local storage only)
 * - Traveler Free: 10 days (Supabase + local storage sync)
 * - Basic Monthly: 30 days
 * - Pro Monthly: 90 days
 */
export function getRetentionDays(planId?: string): number {
  if (!planId || planId === "guest") {
    return 3;
  }
  if (planId === "traveler_free") {
    return 10;
  }
  if (
    planId.includes("pro") ||
    planId === "traveler_pro_monthly" ||
    planId === "developer_pro_monthly"
  ) {
    return 90;
  }
  if (
    planId.includes("basic") ||
    planId === "traveler_basic_monthly" ||
    planId === "developer_basic_monthly" ||
    planId.startsWith("mcp_")
  ) {
    return 30;
  }
  return 10;
}

export function getRetentionMs(planId?: string): number {
  return getRetentionDays(planId) * 24 * 60 * 60 * 1000;
}

/**
 * Explicitly prunes sessions older than the user's active plan retention period.
 * Safe to invoke once the user profile and planId have resolved.
 */
export function pruneSessionsByPlan(planId: string, userId?: string): ChatSession[] {
  if (typeof window === "undefined" || !planId) return [];
  try {
    const storageKey = getStorageKey(userId);
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const sessions = Array.isArray(parsed) ? parsed : [];
    const now = Date.now();
    const retentionMs = getRetentionMs(planId);
    const validSessions = sessions.filter(
      (s: any) => now - (s.updatedAt || s.createdAt) <= retentionMs
    );
    if (validSessions.length !== sessions.length) {
      localStorage.setItem(storageKey, JSON.stringify(validSessions));
    }
    return validSessions;
  } catch {
    return [];
  }
}
