import { DEFAULT_MODEL_ID } from "../models.js";
import {
  ChatSession,
  getStorageKey,
  getActiveSessionKey,
  TAB_ACTIVE_SESSION_KEY,
} from "./types";
import {
  StoredSessionSchema,
  StoredSessionsArraySchema,
} from "./schemas";
import { getRetentionMs } from "./retention";
import { syncSessionToCloud, deleteSessionFromCloud } from "./cloud-sync";

/**
 * Loads all chat sessions from localStorage for the given user, validating schema with Zod.
 * Automatically scopes sessions by userId to prevent cross-account chat leaks.
 */
export function loadAllSessions(planId?: string, userId?: string): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const storageKey = getStorageKey(userId);
    let raw = localStorage.getItem(storageKey);

    // Backward compatibility migration from legacy global key if scoped user key is not yet set
    if (!raw) {
      const legacyRaw = localStorage.getItem("confirmroute_chat_sessions_v1");
      if (legacyRaw && userId) {
        // One-time migration of local guest sessions to authenticated user on first login
        raw = legacyRaw;
        localStorage.setItem(storageKey, legacyRaw);
      } else if (legacyRaw) {
        raw = legacyRaw;
      }
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    let sessions: ChatSession[] = [];
    const parseResult = StoredSessionsArraySchema.safeParse(parsed);

    if (parseResult.success) {
      sessions = parseResult.data as ChatSession[];
    } else if (Array.isArray(parsed)) {
      const validItems: ChatSession[] = [];
      for (const item of parsed) {
        const itemParse = StoredSessionSchema.safeParse(item);
        if (itemParse.success) {
          validItems.push(itemParse.data as ChatSession);
        }
      }
      sessions = validItems;
    }

    if (sessions.length === 0) return [];

    // Sanitize any legacy first-time welcome messages in storage containing plan/link clutter
    sessions.forEach((s) => {
      s.messages?.forEach((m) => {
        if (m.id === "welcome-message-first-time" || (typeof m.content === "string" && m.content.includes("Guest Access & Quick Links"))) {
          m.content = (m.content || "")
            .replace(/---\s*💡\s*\*\*Guest Access & Quick Links\*\*[\s\S]*?(?=\*Type your question|\n\n\*Type|$)/, "")
            .trim();
        }
      });
    });

    // Clean up duplicate empty sessions (keep at most 1 empty session)
    let seenEmpty = false;
    const deduplicated = sessions.filter((s) => {
      const isEmpty = !s.messages || s.messages.length === 0 || !s.messages.some((m) => m.role === "user");
      if (isEmpty) {
        if (seenEmpty) return false;
        seenEmpty = true;
      }
      return true;
    });
    if (deduplicated.length !== sessions.length) {
      localStorage.setItem(storageKey, JSON.stringify(deduplicated));
      sessions = deduplicated;
    }

    // Only prune if planId is explicitly defined and resolved
    if (!planId) {
      return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    const now = Date.now();
    const retentionMs = getRetentionMs(planId);
    const validSessions = sessions.filter(
      (s) => now - (s.updatedAt || s.createdAt) <= retentionMs
    );

    if (validSessions.length !== sessions.length) {
      localStorage.setItem(storageKey, JSON.stringify(validSessions));
    }
    return validSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error("Failed to load chat sessions from localStorage:", err);
    return [];
  }
}

/**
 * Saves or updates a session in localStorage, scoped by user, with optional cloud sync.
 */
export function saveSession(
  session: ChatSession,
  existingSessions?: ChatSession[],
  accessToken?: string,
  planId?: string,
  userId?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const storageKey = getStorageKey(userId);
    // Always load freshest sessions from localStorage to avoid cross-tab overwrites
    const freshFromDisk = loadAllSessions(planId, userId);
    const sessions = freshFromDisk.length > 0 ? freshFromDisk : (existingSessions ? [...existingSessions] : []);
    const existingIdx = sessions.findIndex((s) => s.id === session.id);
    const updatedSession: ChatSession = {
      ...session,
      updatedAt: session.updatedAt || Date.now(),
    };

    if (existingIdx >= 0) {
      sessions[existingIdx] = updatedSession;
    } else {
      sessions.unshift(updatedSession);
    }

    if (planId) {
      const retentionMs = getRetentionMs(planId);
      const now = Date.now();
      const validSessions = sessions.filter(
        (s) => now - (s.updatedAt || s.createdAt) <= retentionMs
      );
      localStorage.setItem(storageKey, JSON.stringify(validSessions));
    } else {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    }

    if (accessToken) {
      syncSessionToCloud(updatedSession, accessToken);
    }
  } catch (err) {
    console.error("Failed to save chat session to localStorage:", err);
  }
}

/**
 * Deletes a session from user-scoped localStorage by ID, with optional cloud deletion.
 */
export function deleteSession(
  sessionId: string,
  accessToken?: string,
  planId?: string,
  userId?: string
): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const storageKey = getStorageKey(userId);
    const sessions = loadAllSessions(planId, userId);
    const filtered = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    if (getActiveSessionId(userId) === sessionId) {
      clearActiveSessionId(userId);
    }

    if (accessToken) {
      deleteSessionFromCloud(sessionId, accessToken);
    }

    return filtered;
  } catch (err) {
    console.error("Failed to delete chat session from localStorage:", err);
    return [];
  }
}

/**
 * Gets the active session ID for the current browser tab from sessionStorage.
 */
export function getTabActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TAB_ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets the active session ID for the current browser tab in sessionStorage.
 */
export function setTabActiveSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(TAB_ACTIVE_SESSION_KEY, sessionId);
  } catch {}
}

/**
 * Clears the active session ID for the current browser tab from sessionStorage.
 */
export function clearTabActiveSessionId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(TAB_ACTIVE_SESSION_KEY);
  } catch {}
}

/**
 * Gets the active session ID from user-scoped localStorage.
 */
export function getActiveSessionId(userId?: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getActiveSessionKey(userId));
}

/**
 * Sets the active session ID in user-scoped localStorage and tab sessionStorage.
 */
export function setActiveSessionId(sessionId: string, userId?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getActiveSessionKey(userId), sessionId);
  setTabActiveSessionId(sessionId);
}

/**
 * Clears the active session ID from user-scoped localStorage and tab sessionStorage.
 */
export function clearActiveSessionId(userId?: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getActiveSessionKey(userId));
  clearTabActiveSessionId();
}

/**
 * Creates a brand new chat session isolated to the active user, or reuses an existing empty session.
 */
export function createNewSession(
  modelId: string = DEFAULT_MODEL_ID,
  accessToken?: string,
  planId?: string,
  userId?: string
): ChatSession {
  // Reuse existing empty session if already present to guarantee zero duplicate empty chats
  const freshFromDisk = loadAllSessions(planId, userId);
  const existingEmpty = freshFromDisk.find(
    (s) => !s.messages || s.messages.length === 0 || !s.messages.some((m) => m.role === "user")
  );
  if (existingEmpty) {
    setActiveSessionId(existingEmpty.id, userId);
    setTabActiveSessionId(existingEmpty.id);
    return existingEmpty;
  }

  const randSuffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now()}`;

  const newSession: ChatSession = {
    id: `session_${Date.now()}_${randSuffix}`,
    title: "New Train Query",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    modelId,
    messages: [],
  };
  saveSession(newSession, undefined, accessToken, planId, userId);
  setActiveSessionId(newSession.id, userId);
  setTabActiveSessionId(newSession.id);
  return newSession;
}
