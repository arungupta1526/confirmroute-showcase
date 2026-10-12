import { ChatSession, getStorageKey } from "./types";
import { getRetentionMs } from "./retention";

/**
 * Showcase Mode Cloud Sync Stub:
 * All sessions are safely preserved in browser LocalStorage / IndexedDB.
 * Cloud sync to remote PostgreSQL is disabled in the public frontend showcase.
 */
export async function syncSessionToCloud(_session: ChatSession, _accessToken?: string): Promise<void> {
  // No-op in showcase mode
}

export async function fetchCloudSessions(_accessToken: string): Promise<ChatSession[]> {
  return [];
}

export async function deleteSessionFromCloud(_sessionId: string, _accessToken?: string): Promise<void> {
  // No-op in showcase mode
}

export function mergeAndSyncSessions(
  _cloudSessions: ChatSession[],
  localSessions: ChatSession[],
  _accessToken?: string,
  planId?: string,
  userId?: string
): ChatSession[] {
  const map = new Map<string, ChatSession>();
  const now = Date.now();
  const retentionMs = planId ? getRetentionMs(planId) : Infinity;

  localSessions.forEach((local) => {
    if (now - (local.updatedAt || local.createdAt) <= retentionMs) {
      map.set(local.id, local);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  if (typeof window !== "undefined") {
    try {
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch (err) {
      console.error("Failed to persist merged chat sessions to localStorage:", err);
    }
  }

  return merged;
}
