"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MAX_SESSION_USER_TURNS,
  WARNING_SESSION_USER_TURNS,
  BACKEND_MAX_CONTEXT_MESSAGES,
  SessionTurnStatus,
} from "@/src/config/chat-limits";

interface MessageLike {
  role: string;
}

let cachedLimits = {
  maxTurns: MAX_SESSION_USER_TURNS,
  warningTurns: WARNING_SESSION_USER_TURNS,
  backendMaxMessages: BACKEND_MAX_CONTEXT_MESSAGES,
};

let hasFetchedLimits = false;
let limitsInflightPromise: Promise<void> | null = null;

function fetchChatLimits() {
  if (hasFetchedLimits || limitsInflightPromise) return;

  limitsInflightPromise = fetch("/api/chat/limits")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && typeof data.maxUserTurns === "number") {
        cachedLimits = {
          maxTurns: data.maxUserTurns,
          warningTurns: data.warningTurns,
          backendMaxMessages: data.backendMaxMessages,
        };
        hasFetchedLimits = true;
        notifyListeners();
      }
    })
    .catch(() => {})
    .finally(() => {
      limitsInflightPromise = null;
    });
}

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

/**
 * Computes session turn usage, warning trigger, and session cap status
 * based on current message history and dynamically synced admin limits.
 */
export function useSessionTurnLimits(messages: MessageLike[]): SessionTurnStatus {
  const [limits, setLimits] = useState(cachedLimits);

  useEffect(() => {
    const update = () => setLimits({ ...cachedLimits });
    listeners.add(update);

    fetchChatLimits();

    return () => {
      listeners.delete(update);
    };
  }, []);

  return useMemo(() => {
    const userTurnCount = messages.filter((m) => m.role === "user").length;
    const remainingTurns = Math.max(0, limits.maxTurns - userTurnCount);
    const isWarning =
      userTurnCount >= limits.warningTurns && userTurnCount < limits.maxTurns;
    const isCapped = userTurnCount >= limits.maxTurns;

    return {
      userTurnCount,
      maxTurns: limits.maxTurns,
      remainingTurns,
      isWarning,
      isCapped,
    };
  }, [messages, limits]);
}
