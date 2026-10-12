"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { UIMessage } from "ai";
import {
  ChatSession,
  StoredMessage,
  loadAllSessions,
  saveSession,
  deleteSession,
  getActiveSessionId,
  setActiveSessionId,
  getTabActiveSessionId,
  setTabActiveSessionId,
  createNewSession,
  mergeAndSyncSessions,
  getStorageKey,
  getMessageText,
  getMessageToolInvocations,
} from "@/src/lib/chat-storage";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, CAPABILITY_MODES, normalizeToCapabilityMode } from "@/src/lib/models";
import { safeReplaceState } from "@/src/utils/history";

export function useChatSessions(
  accessToken?: string,
  planId?: string,
  userId?: string,
  targetSessionId?: string
) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string>("");
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const messageModelMapRef = useRef<Record<string, { modelId: string; modelName: string }>>({});
  const messageTimestampMapRef = useRef<Record<string, number>>({});
  const saveDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserIdRef = useRef<string | undefined>(userId);
  const hasHydratedRef = useRef<boolean>(false);
  const lastHydratedUserIdRef = useRef<string | undefined>(undefined);

  const populateModelMap = useCallback((msgs: StoredMessage[]) => {
    msgs.forEach((m) => {
      if (m.modelName && m.modelId) {
        messageModelMapRef.current[m.id] = {
          modelId: m.modelId,
          modelName: m.modelName,
        };
      }
      if (m.timestamp) {
        messageTimestampMapRef.current[m.id] = m.timestamp;
      } else if (m.createdAt) {
        const parsed = new Date(m.createdAt).getTime();
        if (!isNaN(parsed)) {
          messageTimestampMapRef.current[m.id] = parsed;
        }
      }
    });
  }, []);

  // Hydrate sessions scoped to current userId
  useEffect(() => {
    // Only re-hydrate on initial mount or when userId changes (e.g. login/logout)
    if (hasHydratedRef.current && lastHydratedUserIdRef.current === userId) {
      return;
    }
    hasHydratedRef.current = true;
    lastHydratedUserIdRef.current = userId;
    currentUserIdRef.current = userId;
    const all = loadAllSessions(planId, userId);
    setSessions(all);

    // 1. Explicit targetSessionId from URL (/c/[id]) has the absolute highest priority!
    const targetFromUrl = targetSessionId;
    // 2. Check tab-scoped active session (survives reload in same tab)
    const tabActiveId = getTabActiveSessionId();
    // 3. Check user-scoped stored active session
    const storedActiveId = targetFromUrl || tabActiveId || getActiveSessionId(userId);

    const active = storedActiveId ? all.find((s) => s.id === storedActiveId) : undefined;

    if (active) {
      setActiveSessionIdState(active.id);
      setActiveSessionId(active.id, userId);
      setTabActiveSessionId(active.id);
      setModelId(active.modelId || DEFAULT_MODEL_ID);
      populateModelMap(active.messages || []);
      // Pre-seed fingerprint so initial hydration doesn't falsely bump updatedAt
      const lastMsg = active.messages && active.messages.length > 0 ? active.messages[active.messages.length - 1] : null;
      lastPersistedFingerprintRef.current[active.id] = `${active.id}:${active.modelId || DEFAULT_MODEL_ID}:${active.messages?.length || 0}:${lastMsg?.id || ""}:${lastMsg?.content?.length || 0}`;
    } else if (targetFromUrl && !accessToken) {
      // Unauthenticated / Guest: URL session is not in local storage -> invalid or foreign session!
      safeReplaceState("/chat");
      // Open a legitimate fresh new chat instead of adopting a foreign/tampered ID
      const fresh = createNewSession(DEFAULT_MODEL_ID, accessToken, planId, userId);
      setSessions([fresh, ...all]);
      setActiveSessionIdState(fresh.id);
      setModelId(fresh.modelId || DEFAULT_MODEL_ID);
    } else if (tabActiveId) {
      // User reloaded on a new empty session that was not yet in all
      const fresh = createNewSession(DEFAULT_MODEL_ID, accessToken, planId, userId);
      setSessions([fresh, ...all.filter((s) => s.id !== fresh.id)]);
      setActiveSessionIdState(fresh.id);
      setModelId(fresh.modelId || DEFAULT_MODEL_ID);
    } else {
      // Fresh open in a new tab without /c/[id]: Requirement #1 -> ALWAYS open a fresh new chat!
      const existingEmpty = all.find(
        (s) => !s.messages || s.messages.length === 0 || !s.messages.some((m) => m.role === "user")
      );
      if (existingEmpty) {
        setActiveSessionIdState(existingEmpty.id);
        setActiveSessionId(existingEmpty.id, userId);
        setTabActiveSessionId(existingEmpty.id);
        setModelId(existingEmpty.modelId || DEFAULT_MODEL_ID);
        populateModelMap(existingEmpty.messages || []);
      } else {
        const fresh = createNewSession(DEFAULT_MODEL_ID, accessToken, planId, userId);
        setSessions([fresh, ...all]);
        setActiveSessionIdState(fresh.id);
        setModelId(fresh.modelId || DEFAULT_MODEL_ID);
      }
    }
    setIsInitialized(true);
  }, [populateModelMap, userId, targetSessionId, accessToken, planId]);

  // M5: Apply retention pruning safely only after user planId has resolved
  useEffect(() => {
    if (!planId) return;
    import("@/src/lib/chat-storage").then(({ pruneSessionsByPlan }) => {
      const pruned = pruneSessionsByPlan(planId, userId);
      if (pruned.length > 0) {
        setSessions(pruned);
      }
    });
  }, [planId, userId]);

  // Sync with cloud sessions and push unsynced local sessions when authenticated
  useEffect(() => {
    if (!accessToken) return;
    import("@/src/lib/chat-storage").then(({ fetchCloudSessions, mergeAndSyncSessions }) => {
      fetchCloudSessions(accessToken).then((cloudSessions) => {
        setSessions((prev) => {
          const merged = mergeAndSyncSessions(cloudSessions, prev, accessToken, planId, userId);
          return merged;
        });

        // Validate targetSessionId against cloud sessions
        if (targetSessionId) {
          const cloudMatch = cloudSessions.find((s) => s.id === targetSessionId);
          if (cloudMatch) {
            setActiveSessionIdState(cloudMatch.id);
            setActiveSessionId(cloudMatch.id, userId);
            setTabActiveSessionId(cloudMatch.id);
            setModelId(cloudMatch.modelId || DEFAULT_MODEL_ID);
            populateModelMap(cloudMatch.messages || []);
          } else if (!sessionsRef.current.some((s) => s.id === targetSessionId)) {
            // URL session belongs to neither local nor cloud account -> clean URL to /chat
            safeReplaceState("/chat");
          }
        }
      });
    });
  }, [accessToken, planId, userId, targetSessionId, populateModelMap]);

  // Refetch cloud sessions on internet reconnection or tab visibility change
  useEffect(() => {
    if (!accessToken) return;

    const refetchCloud = () => {
      import("@/src/lib/chat-storage").then(({ fetchCloudSessions, mergeAndSyncSessions }) => {
        fetchCloudSessions(accessToken).then((cloudSessions) => {
          setSessions((prev) => mergeAndSyncSessions(cloudSessions, prev, accessToken, planId, userId));
        });
      });
    };

    window.addEventListener("online", refetchCloud);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refetchCloud();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", refetchCloud);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [accessToken, planId, userId]);

  // Sync sessions across browser tabs via storage event
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (e: StorageEvent) => {
      const storageKey = getStorageKey(currentUserIdRef.current);
      if (e.key === storageKey && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (Array.isArray(fresh)) {
            setSessions(fresh);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const sessionsRef = useRef<ChatSession[]>(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  const accessTokenRef = useRef<string | undefined>(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const planIdRef = useRef<string | undefined>(planId);
  useEffect(() => {
    planIdRef.current = planId;
  }, [planId]);

  const lastPersistedFingerprintRef = useRef<Record<string, string>>({});

  // Debounced session save with deduplication (PERF-5)
  const persistSessionMessages = useCallback(
    (currentMessages: UIMessage[], activeId: string, currentModelId: string) => {
      if (!isInitialized || !activeId) return;

      const lastMsg = currentMessages[currentMessages.length - 1];
      const lastMsgText = getMessageText(lastMsg as any);
      // M1: Use content length + id instead of concatenating full 20KB+ string
      const fingerprint = `${activeId}:${currentModelId}:${currentMessages.length}:${lastMsg?.id || ""}:${lastMsgText.length}`;

      // Skip scheduling if this exact state was already persisted
      if (lastPersistedFingerprintRef.current[activeId] === fingerprint) {
        return;
      }

      if (saveDebounceTimerRef.current) {
        clearTimeout(saveDebounceTimerRef.current);
      }

      const isUserTurn = lastMsg?.role === "user";
      const debounceDelay = isUserTurn ? 0 : 400;

      saveDebounceTimerRef.current = setTimeout(() => {
        lastPersistedFingerprintRef.current[activeId] = fingerprint;

        const storedMsgs: StoredMessage[] = currentMessages.map((m) => {
          const binding = messageModelMapRef.current[m.id];
          const existingTimestamp =
            (m as any).timestamp ||
            messageTimestampMapRef.current[m.id] ||
            ((m as any).createdAt ? new Date((m as any).createdAt).getTime() : undefined) ||
            Date.now();

          messageTimestampMapRef.current[m.id] = existingTimestamp;

          const usageAnn =
            (m as any).metadata?.usage_metrics ||
            (Array.isArray((m as any).metadata?.annotations)
              ? (m as any).metadata.annotations.find(
                  (a: any) => a && typeof a === "object" && a.type === "usage_metrics"
                )
              : undefined) ||
            (Array.isArray((m as any).annotations)
              ? (m as any).annotations.find(
                  (a: any) => a && typeof a === "object" && a.type === "usage_metrics"
                )
              : undefined) ||
            (Array.isArray((m as any).parts)
              ? (m as any).parts.find(
                  (p: any) => p && p.type === "data-usage-metrics"
                )?.data
              : undefined);

          const tokens = usageAnn?.tokens || (m as any).tokens;
          const cost = usageAnn?.cost || (m as any).cost;
          const roleType = usageAnn?.role || (m as any).roleType;
          const tools = getMessageToolInvocations(m);

          return {
            ...m,
            content: getMessageText(m as any),
            parts: (m as any).parts,
            toolInvocations: tools.length > 0 ? tools : (m as any).toolInvocations,
            timestamp: existingTimestamp,
            createdAt: (m as any).createdAt || new Date(existingTimestamp),
            modelId: binding?.modelId || (m.role === "assistant" ? currentModelId : undefined),
            modelName: binding?.modelName || (m.role === "assistant" ? (CAPABILITY_MODES.find((mod) => mod.id === normalizeToCapabilityMode(currentModelId))?.title || AVAILABLE_MODELS.find((mod) => mod.id === currentModelId)?.name) : undefined),
            tokens,
            cost,
            roleType,
            annotations: (m as any).annotations,
            selectedSuggestion: (m as StoredMessage).selectedSuggestion || undefined,
          };
        });

        // Determine title from first user query
        const firstUserMsg = currentMessages.find((m) => m.role === "user");
        let title = "New Train Query";
        const firstUserText = getMessageText(firstUserMsg as any);
        if (firstUserText) {
          title = firstUserText.slice(0, 36) + (firstUserText.length > 36 ? "..." : "");
        }

        const currentSessions = sessionsRef.current;
        const existingSession = currentSessions.find((s) => s.id === activeId);

        // Check if there is genuine new message content before bumping updatedAt
        const prevMsgCount = existingSession?.messages?.length || 0;
        const hasNewMessages = currentMessages.length > prevMsgCount;
        const prevLastMsg = existingSession?.messages?.[prevMsgCount - 1];
        const lastMsgChanged =
          lastMsg &&
          (!prevLastMsg ||
            lastMsg.id !== prevLastMsg.id ||
            getMessageText(lastMsg as any) !== getMessageText(prevLastMsg as any));
        const shouldUpdateTimestamp = !existingSession || hasNewMessages || lastMsgChanged;

        const sessionToSave: ChatSession = {
          id: activeId,
          title,
          createdAt: existingSession?.createdAt ?? Date.now(),
          updatedAt: shouldUpdateTimestamp ? Date.now() : (existingSession?.updatedAt ?? Date.now()),
          modelId: currentModelId,
          messages: storedMsgs,
          selectedSuggestionsMap: existingSession?.selectedSuggestionsMap,
        };

        saveSession(sessionToSave, currentSessions, accessTokenRef.current, planIdRef.current, userId);

        // Update in-memory sessions list without re-parsing localStorage (PERF-2)
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.id === activeId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = sessionToSave;
            return next;
          }
          return [sessionToSave, ...prev];
        });
      }, debounceDelay);
    },
    [isInitialized, userId]
  );

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return null;

      setActiveSessionIdState(sessionId);
      setActiveSessionId(sessionId, userId);
      setTabActiveSessionId(sessionId);
      // CQ-5: Fix default fallback model
      const targetModel = target.modelId || DEFAULT_MODEL_ID;
      setModelId(targetModel);
      populateModelMap(target.messages || []);

      // Pre-seed fingerprint so selecting/hydrating this session doesn't trigger a fake timestamp bump
      const lastMsg = target.messages && target.messages.length > 0 ? target.messages[target.messages.length - 1] : null;
      lastPersistedFingerprintRef.current[sessionId] = `${sessionId}:${targetModel}:${target.messages?.length || 0}:${lastMsg?.id || ""}:${lastMsg?.content?.length || 0}`;

      return target;
    },
    [sessions, populateModelMap, userId]
  );

  const isSessionEmpty = useCallback((s: ChatSession) => {
    if (!s.messages || s.messages.length === 0) return true;
    return !s.messages.some((m) => m.role === "user");
  }, []);

  const handleNewChat = useCallback(() => {
    // 1. If current active session is already empty, keep it
    const currentActive = sessions.find((s) => s.id === activeSessionId);
    if (currentActive && isSessionEmpty(currentActive)) {
      setTabActiveSessionId(currentActive.id);
      return currentActive;
    }

    // 2. If any empty chat session exists in the sessions list, switch to it
    const existingEmpty = sessions.find(isSessionEmpty);
    if (existingEmpty) {
      setActiveSessionIdState(existingEmpty.id);
      setActiveSessionId(existingEmpty.id, userId);
      setTabActiveSessionId(existingEmpty.id);
      setModelId(existingEmpty.modelId || DEFAULT_MODEL_ID);
      populateModelMap(existingEmpty.messages || []);
      return existingEmpty;
    }

    // 3. No empty session exists -> create a fresh session
    const fresh = createNewSession(modelId || DEFAULT_MODEL_ID, accessToken, planIdRef.current, userId);
    setSessions((prev) => [fresh, ...prev.filter((s) => !isSessionEmpty(s))]);
    setActiveSessionIdState(fresh.id);
    setActiveSessionId(fresh.id, userId);
    setTabActiveSessionId(fresh.id);
    return fresh;
  }, [sessions, activeSessionId, isSessionEmpty, modelId, accessToken, userId, populateModelMap]);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      const updated = deleteSession(sessionId, accessToken, planIdRef.current, userId);
      setSessions(updated);

      // CQ-14: Auto-switch if we deleted the active session
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          setActiveSessionIdState(updated[0].id);
          setActiveSessionId(updated[0].id, userId);
          setModelId(updated[0].modelId || DEFAULT_MODEL_ID);
        } else {
          setActiveSessionIdState("");
        }
      }
      return updated;
    },
    [activeSessionId, accessToken, userId]
  );

  return {
    sessions,
    activeSessionId,
    modelId,
    setModelId,
    isInitialized,
    messageModelMapRef,
    persistSessionMessages,
    handleSelectSession,
    handleNewChat,
    handleDeleteSession,
  };
}
