/**
 * Chat Session Limits & Token Pruning Configuration
 *
 * Enforces session-level boundaries to prevent token explosion, context degradation,
 * and cross-query railway parameter hallucinations.
 */

/**
 * Maximum number of user messages allowed in a single chat session.
 * Configurable via NEXT_PUBLIC_MAX_SESSION_USER_TURNS or MAX_SESSION_USER_TURNS in .env.
 * Default: 20
 */
export const MAX_SESSION_USER_TURNS: number =
  Number(process.env.NEXT_PUBLIC_MAX_SESSION_USER_TURNS || process.env.MAX_SESSION_USER_TURNS) || 20;

/**
 * Threshold at which early warning banner appears to the user.
 * Configurable via NEXT_PUBLIC_WARNING_SESSION_USER_TURNS or WARNING_SESSION_USER_TURNS in .env.
 * Default: 16 (4 turns before max)
 */
export const WARNING_SESSION_USER_TURNS: number =
  Number(process.env.NEXT_PUBLIC_WARNING_SESSION_USER_TURNS || process.env.WARNING_SESSION_USER_TURNS) || 16;

/**
 * Number of messages to retain in the backend sliding window passed to the LLM.
 * Configurable via BACKEND_MAX_CONTEXT_MESSAGES or NEXT_PUBLIC_BACKEND_MAX_CONTEXT_MESSAGES in .env.
 * Default: 10 messages (5 Q&A pairs)
 */
export const BACKEND_MAX_CONTEXT_MESSAGES: number =
  Number(process.env.BACKEND_MAX_CONTEXT_MESSAGES || process.env.NEXT_PUBLIC_BACKEND_MAX_CONTEXT_MESSAGES) || 10;

export interface SessionTurnStatus {
  userTurnCount: number;
  maxTurns: number;
  remainingTurns: number;
  isWarning: boolean;
  isCapped: boolean;
}

export const TOTAL_MCP_TOOLS_COUNT = 25;
