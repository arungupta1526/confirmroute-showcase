"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { ChatSession, StoredMessage, getMessageText } from "@/src/lib/chat-storage";
import { useFirstTimeWelcome } from "@/src/hooks/useFirstTimeWelcome";
import type { AccountTabType } from "@/components/account/AccountModalTabs";

interface UseChatSessionSyncOptions {
  isInitialized: boolean;
  activeSessionId: string;
  sessions: ChatSession[];
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
  modelId: string;
  isLoading: boolean;
  persistSessionMessages: (messages: UIMessage[], sessionId: string, modelId: string) => void | Promise<void>;
  setSelectedSuggestionsMap: (map: Record<string, string>) => void;
  setErrorMessage: (msg: string | null) => void;
  handleOpenAccountModal: (tab?: AccountTabType, plan?: string) => void;
}

/**
 * Handles session switching, cloud sync debouncing, first-time user greeting,
 * and account modal event bridge.
 */
export function useChatSessionSync({
  isInitialized,
  activeSessionId,
  sessions,
  messages,
  setMessages,
  modelId,
  isLoading,
  persistSessionMessages,
  setSelectedSuggestionsMap,
  setErrorMessage,
  handleOpenAccountModal,
}: UseChatSessionSyncOptions) {
  const currentSessionIdRef = useRef<string>("");
  const isHydratingRef = useRef<boolean>(false);
  const welcomedRef = useRef(false);
  const { isFirstTime, generateWelcomeMessage, markWelcomed } = useFirstTimeWelcome();

  // Sync messages with active session when session changes or when session data hydrates
  useEffect(() => {
    if (!isInitialized || !activeSessionId) return;

    // Critical: Do NOT overwrite messages if an AI response is actively generating/streaming
    if (isLoading) return;

    const targetSession = sessions.find((s) => s.id === activeSessionId);
    const targetMsgs = (targetSession?.messages as StoredMessage[]) || [];
    const sessionChanged = currentSessionIdRef.current !== activeSessionId;
    const needsHydration = messages.length === 0 && targetMsgs.length > 0;
    const hasMoreMessages = !isLoading && targetMsgs.length > messages.length;
    const lastStored = targetMsgs[targetMsgs.length - 1];
    const lastLocal = messages[messages.length - 1];
    const hasUpdatedLastMessage =
      !isLoading &&
      targetMsgs.length === messages.length &&
      lastStored?.role === "assistant" &&
      getMessageText(lastStored) !== getMessageText(lastLocal as any) &&
      Boolean(getMessageText(lastStored));

    if (sessionChanged || needsHydration || hasMoreMessages || hasUpdatedLastMessage) {
      currentSessionIdRef.current = activeSessionId;
      isHydratingRef.current = true;
      if (targetSession) {
        setMessages(targetMsgs as UIMessage[]);
        const restoredMap: Record<string, string> = {};
        targetMsgs.forEach((m) => {
          if (m.selectedSuggestion) {
            restoredMap[m.id] = m.selectedSuggestion;
          }
        });
        if (targetSession.selectedSuggestionsMap) {
          Object.assign(restoredMap, targetSession.selectedSuggestionsMap);
        }
        setSelectedSuggestionsMap(restoredMap);
      } else {
        setSelectedSuggestionsMap({});
      }
      setErrorMessage(null);
    }
  }, [activeSessionId, isInitialized, isLoading, sessions, messages, setMessages, setSelectedSuggestionsMap, setErrorMessage]);

  // First-time user onboarding welcome greeting (0 credit cost)
  useEffect(() => {
    if (!isInitialized || welcomedRef.current) return;
    const targetSession = sessions.find((s) => s.id === activeSessionId);
    const hasExistingHistory =
      (targetSession?.messages && targetSession.messages.length > 0) ||
      sessions.some((s) => s.messages && s.messages.some((m) => m.role === "user"));

    if (hasExistingHistory) {
      welcomedRef.current = true;
      markWelcomed();
      return;
    }

    if (isFirstTime && messages.length === 0) {
      welcomedRef.current = true;
      const welcome = generateWelcomeMessage();
      setMessages([welcome as any]);
      markWelcomed();
    }
  }, [isFirstTime, isInitialized, activeSessionId, sessions, messages.length, generateWelcomeMessage, markWelcomed, setMessages]);

  // Immediate user turn persistence & debounced assistant completion persistence
  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }
    if (messages.length === 0 || !activeSessionId) return;

    const lastMsg = messages[messages.length - 1];
    // 1. Persist user turns immediately (even during isLoading) so prompt is never lost on back navigation
    if (lastMsg?.role === "user") {
      persistSessionMessages(messages, activeSessionId, modelId);
      return;
    }

    // 2. Debounced persistence for assistant responses once streaming finishes
    if (!isLoading) {
      persistSessionMessages(messages, activeSessionId, modelId);
    }
  }, [messages, activeSessionId, modelId, isLoading, persistSessionMessages]);

  const isRecoveringRef = useRef(false);
  const lastRecoveryAttemptTimeRef = useRef<number>(0);

  // Auto-recovery for interrupted queries (tab close, network cut, or background completion)
  useEffect(() => {
    if (!isInitialized || isLoading || !activeSessionId || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    // Dangling user prompt with no following assistant answer (stream was cut by navigation or network drop)
    return; // Showcase mode: offline local storage only

    const tryRecover = async () => {
      const now = Date.now();
      // Throttle recovery polling to avoid excessive requests on rapid tab toggling (6s cooldown)
      if (now - lastRecoveryAttemptTimeRef.current < 6000) return;
      lastRecoveryAttemptTimeRef.current = now;

      try {
        isRecoveringRef.current = true;
        const { getClientDeviceId } = await import("@/src/lib/auth/deviceId");
        const deviceId = typeof window !== "undefined" ? getClientDeviceId() : "";

        const res = await fetch(`/api/chat/recover?sessionId=${encodeURIComponent(activeSessionId)}`, {
          headers: deviceId ? { "x-device-id": deviceId } : undefined,
        });

        if (!res.ok) return;

        // Guard against non-JSON error pages (e.g. 502/504 Bad Gateway from edge proxy)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;

        const json = await res.json();
        if (json.recovered && json.session?.assistantMessage) {
          const assistantMsg: UIMessage = json.session.assistantMessage;
          const merged = [...messages, assistantMsg];
          setMessages(merged);
          persistSessionMessages(merged, activeSessionId, json.session.modelId || modelId);
        }
      } catch (err) {
        console.warn("[Chat Recovery] Auto-recovery lookup failed:", err);
      } finally {
        isRecoveringRef.current = false;
      }
    };

    // Attempt recovery after a brief tick
    const timer = setTimeout(tryRecover, 1000);

    // Also retry recovery if internet reconnects or tab becomes visible again
    const handleOnline = () => {
      clearTimeout(timer);
      tryRecover();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tryRecover();
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeSessionId, isInitialized, isLoading, messages, modelId, persistSessionMessages, setMessages]);

  // Listen for account modal trigger dispatched from chat markdown links
  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleOpenAccountModal(detail?.tab || "plan");
    };
    window.addEventListener("confirmroute:open-account-modal", handleOpenModal);
    return () => window.removeEventListener("confirmroute:open-account-modal", handleOpenModal);
  }, [handleOpenAccountModal]);
}
