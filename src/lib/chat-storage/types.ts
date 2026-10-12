import { UIMessage } from "ai";

export interface MessageUsageMetrics {
  prompt?: number;
  completion?: number;
  total?: number;
}

export interface MessageCostMetrics {
  amountInr?: number;
  amountUsd?: number;
  formattedInr?: string;
  formattedUsd?: string;
  isFreeTier?: boolean;
}

export type StoredMessage = Omit<UIMessage, "parts"> & {
  parts?: Array<any>;
  content?: string;
  createdAt?: Date;
  modelName?: string;
  modelId?: string;
  timestamp?: number;
  roleType?: "fast" | "workhorse" | "reasoning";
  tokens?: MessageUsageMetrics;
  cost?: MessageCostMetrics;
  selectedSuggestion?: string | null;
  toolInvocations?: any[];
};

/**
 * Extracts pure text content from a UIMessage / StoredMessage,
 * checking message parts first with fallback to content.
 */
export function getMessageText(msg: { parts?: any[]; content?: string } | null | undefined): string {
  if (!msg) return "";
  if (msg.parts && Array.isArray(msg.parts)) {
    const text = msg.parts
      .filter((p) => p && (p.type === "text" || typeof p.text === "string"))
      .map((p) => p.text || "")
      .join("");
    if (text) return text;
  }
  return msg.content || "";
}

/**
 * Normalizes tool objects from legacy AI SDK v3 (toolInvocation: { state: "result", result, args })
 * and AI SDK v4+ parts (dynamic-tool: { state: "output-available", output, input }).
 */
export function normalizeToolInvocation(t: any): any {
  if (!t || typeof t !== "object") return t;
  const toolName =
    t.toolName ||
    t.name ||
    (typeof t.type === "string" && t.type.startsWith("tool-") && t.type !== "tool-invocation"
      ? t.type.slice(5)
      : "");
  const result = t.result !== undefined ? t.result : t.output;
  const args = t.args !== undefined ? t.args : t.input;
  const isComplete =
    t.state === "result" ||
    t.state === "output-available" ||
    (result !== undefined && result !== null);

  return {
    ...t,
    toolCallId: t.toolCallId || t.id,
    toolName,
    state: isComplete ? "result" : t.state,
    result,
    args,
  };
}

/**
 * Extracts tool invocations from a message, checking direct toolInvocations array
 * and AI SDK v4+ message parts with fallback to raw tool result parts.
 */
export function getMessageToolInvocations(msg: any): any[] {
  if (!msg) return [];
  if (Array.isArray(msg.toolInvocations) && msg.toolInvocations.length > 0) {
    return msg.toolInvocations.map(normalizeToolInvocation);
  }
  if (Array.isArray(msg.parts)) {
    const fromParts: any[] = [];
    for (const part of msg.parts) {
      if (!part) continue;
      if (part.type === "tool-invocation" && part.toolInvocation) {
        fromParts.push(normalizeToolInvocation(part.toolInvocation));
      } else if (part.toolInvocation) {
        fromParts.push(normalizeToolInvocation(part.toolInvocation));
      } else if (
        part.type === "dynamic-tool" ||
        part.type?.startsWith("tool-") ||
        part.toolName ||
        part.output !== undefined ||
        part.result !== undefined
      ) {
        fromParts.push(normalizeToolInvocation(part));
      }
    }
    if (fromParts.length > 0) return fromParts;
  }
  return [];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  modelId: string;
  messages: StoredMessage[];
  selectedSuggestionsMap?: Record<string, string>;
}

export const STORAGE_KEY = "confirmroute_chat_sessions_v1";
export const ACTIVE_SESSION_KEY = "confirmroute_active_session_id_v1";
export const TAB_ACTIVE_SESSION_KEY = "confirmroute_tab_active_session_id_v1";

/**
 * Returns user-isolated localStorage key for chat sessions.
 * Guarantees that user A and user B do not share or cross-leak sessions on the same browser.
 */
export function getStorageKey(userId?: string): string {
  return userId ? `confirmroute_chat_sessions_v1_${userId}` : STORAGE_KEY;
}

/**
 * Returns user-isolated localStorage key for active session ID.
 */
export function getActiveSessionKey(userId?: string): string {
  return userId ? `confirmroute_active_session_id_v1_${userId}` : ACTIVE_SESSION_KEY;
}
