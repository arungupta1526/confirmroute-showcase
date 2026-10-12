"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getMessageText } from "@/src/lib/chat-storage";
import { getTomorrowDate } from "@/src/utils/dates";
import { useSessionTurnLimits } from "@/src/hooks/useSessionTurnLimits";
import { getClientDeviceId, getOrCreateAnonymousSessionId } from "@/src/lib/auth/deviceId";
import { updateCachedProfileQuota } from "@/src/hooks/authProfileCache";

interface ReplyingToState {
  id: string;
  role: string;
  content: string;
}

interface UseChatMessagingOptions {
  activeSessionId?: string;
  sessionToken?: string;
  anonSessionId: string;
  enableDevUnlimited: boolean;
  modelId: string;
  setModelId: (id: string) => void;
  enableTerminalLogs: boolean;
  refreshProfile: () => void;
  hasAnyKey: boolean;
  scrollToBottom: (force?: boolean) => void;
  setIsNearBottom: (val: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * Encapsulates chat messaging, streaming, reply-to state, form submission,
 * and dynamic suggestion prompts.
 */
export function useChatMessaging({
  activeSessionId,
  sessionToken,
  anonSessionId,
  enableDevUnlimited,
  modelId,
  setModelId,
  enableTerminalLogs,
  refreshProfile,
  hasAnyKey,
  scrollToBottom,
  setIsNearBottom,
  inputRef,
}: UseChatMessagingOptions) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyingToState | null>(null);
  const [selectedSuggestionsMap, setSelectedSuggestionsMap] = useState<Record<string, string>>({});

  // M4: Remember user's preferred model before quota fallback to Gemma
  const preferredModelRef = useRef<string>(modelId);
  const lastCustomPromptRef = useRef<{ prompt: string; time: number }>({ prompt: "", time: 0 });
  useEffect(() => {
    if (modelId && modelId !== "gemma-4-31b-it") {
      preferredModelRef.current = modelId;
    }
  }, [modelId]);

  /**
   * Per-request identity refs — always hold the latest values.
   * useChat() accepts a static `headers` object captured at hook init;
   * to send fresh values on every request we use a custom fetch wrapper
   * that reads from these refs at call time instead of at mount time.
   */
  const anonSessionIdRef = useRef(anonSessionId);
  const sessionTokenRef = useRef(sessionToken);
  const enableDevUnlimitedRef = useRef(enableDevUnlimited);
  const activeSessionIdRef = useRef(activeSessionId);
  useEffect(() => { anonSessionIdRef.current = anonSessionId; }, [anonSessionId]);
  useEffect(() => { sessionTokenRef.current = sessionToken; }, [sessionToken]);
  useEffect(() => { enableDevUnlimitedRef.current = enableDevUnlimited; }, [enableDevUnlimited]);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  const [input, setInput] = useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const customFetch = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
    const headers = new Headers(options?.headers);
    const currentToken = sessionTokenRef.current;
    let currentAnonId = anonSessionIdRef.current;
    if (!currentAnonId && typeof window !== "undefined") {
      currentAnonId = getOrCreateAnonymousSessionId();
      anonSessionIdRef.current = currentAnonId;
    }
    const currentDevUnlimited = enableDevUnlimitedRef.current;
    const currentSessionId = activeSessionIdRef.current;

    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    } else if (currentAnonId) {
      headers.set("x-anonymous-session-id", currentAnonId);
    }
    if (currentSessionId) {
      headers.set("x-chat-session-id", currentSessionId);
    }
    if (currentDevUnlimited) {
      headers.set("x-dev-unlimited", "true");
    }
    const devId = getClientDeviceId();
    if (devId) {
      headers.set("x-device-id", devId);
    }
    const res = await fetch(url as string, { ...options, headers });
    if (res.headers.get("x-quota-exhausted") === "true") {
      updateCachedProfileQuota(0);
      if (modelId !== "gemma-4-31b-it") {
        preferredModelRef.current = modelId;
      }
      setModelId("gemma-4-31b-it");
    } else {
      const remainingHeader = res.headers.get("x-quota-remaining");
      if (remainingHeader !== null) {
        const remaining = parseInt(remainingHeader, 10);
        if (!isNaN(remaining)) {
          updateCachedProfileQuota(remaining);
        }
        if (remaining > 0 && modelId === "gemma-4-31b-it" && preferredModelRef.current) {
          setModelId(preferredModelRef.current);
        }
      }
    }
    return res;
  };

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    fetch: customFetch,
    prepareSendMessagesRequest: ({ messages: chatMsgs }) => {
      const cleanMessages = chatMsgs.map((m: any) => ({
        role: m.role,
        content: getMessageText(m) || (m.role === "assistant" ? "I have provided the railway details above." : ""),
      }));
      return {
        body: {
          messages: cleanMessages,
          modelId,
          terminalLogs: enableTerminalLogs,
          sessionId: activeSessionIdRef.current,
        },
      };
    },
  });

  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    status,
    error,
    stop,
  } = useChat({
    transport,
    onError: (err) => {
      console.error("[useChat] Error received:", err);
      let errMsg = "An error occurred while generating the response.";
      try {
        if (err.message) {
          const parsed = JSON.parse(err.message);
          errMsg = parsed.error || err.message;
        }
      } catch {
        errMsg =
          err.message && err.message !== "An error occurred."
            ? err.message
            : "An error occurred while searching train data or communicating with the AI model. Please try again or select a different model.";
      }
      setErrorMessage(errMsg);
    },
    onFinish: () => {
      refreshProfile();
      setTimeout(() => inputRef.current?.focus(), 50);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const reload = regenerate;
  const append = useCallback((msg: { role?: string; content: string; createdAt?: Date }) => {
    sendMessage({ text: msg.content });
  }, [sendMessage]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  }, [input, sendMessage]);

  const { isWarning, isCapped, remainingTurns, maxTurns, userTurnCount } = useSessionTurnLimits(messages);

  const handleSuggestionClick = (messageId: string, promptText: string) => {
    if (isCapped) return;
    if (!hasAnyKey) {
      setErrorMessage("Please set GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local first.");
      return;
    }
    setErrorMessage(null);
    setSelectedSuggestionsMap((prev) => ({ ...prev, [messageId]: promptText }));
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? ({ ...msg, selectedSuggestion: promptText } as any) : msg
      )
    );
    setIsNearBottom(true);
    append({ role: "user", content: promptText, createdAt: new Date() });
    scrollToBottom(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handleCustomSend = (e: any) => {
      if (isCapped) return;
      const prompt = e?.detail?.prompt;
      if (typeof prompt === "string" && prompt.trim()) {
        const trimmed = prompt.trim();
        const now = Date.now();
        // Prevent duplicate submissions within 800ms (e.g. from dual event dispatches or double clicks)
        if (lastCustomPromptRef.current.prompt === trimmed && now - lastCustomPromptRef.current.time < 800) {
          return;
        }
        lastCustomPromptRef.current = { prompt: trimmed, time: now };

        if (!hasAnyKey) {
          setErrorMessage("Please set GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local first.");
          return;
        }
        setErrorMessage(null);
        setIsNearBottom(true);
        append({ role: "user", content: trimmed, createdAt: new Date() });
        scrollToBottom(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("confirmroute:send-prompt", handleCustomSend);
    window.addEventListener("confirmroute:fill-chat-input", handleCustomSend);
    return () => {
      window.removeEventListener("confirmroute:send-prompt", handleCustomSend);
      window.removeEventListener("confirmroute:fill-chat-input", handleCustomSend);
    };
  }, [append, hasAnyKey, isCapped, scrollToBottom, setIsNearBottom, inputRef]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCapped) return;
    if (!hasAnyKey) {
      setErrorMessage("Please set GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local first.");
      return;
    }
    if (!input.trim()) return;

    setErrorMessage(null);
    setIsNearBottom(true);

    if (replyingTo) {
      const snippet =
        replyingTo.content.length > 120
          ? replyingTo.content.slice(0, 120) + "..."
          : replyingTo.content;
      const combined = `Replying to (${replyingTo.role}): "${snippet}"\n\n${input}`;
      append({ role: "user", content: combined, createdAt: new Date() });
      setReplyingTo(null);
      handleInputChange({ target: { value: "" } } as any);
      scrollToBottom(true);
      return;
    }

    handleSubmit(e);
    scrollToBottom(true);
  };

  const [tomorrowStr, setTomorrowStr] = useState<string>("");
  useEffect(() => {
    setTomorrowStr(getTomorrowDate());
  }, []);

  const dynamicSuggestions = [
    tomorrowStr
      ? `Search trains from Varanasi (BSB) to New Delhi (NDLS) on ${tomorrowStr}`
      : "Search trains from Varanasi (BSB) to New Delhi (NDLS) tomorrow",
    "Live running status of train 12002",
    tomorrowStr
      ? `2-leg connecting trains from Patna to Mumbai on ${tomorrowStr}`
      : "2-leg connecting trains from Patna to Mumbai tomorrow",
    "Tatkal opening time for train 12393 tomorrow",
  ];

  return {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleFormSubmit,
    isLoading,
    error,
    reload,
    append,
    errorMessage,
    setErrorMessage,
    replyingTo,
    setReplyingTo,
    selectedSuggestionsMap,
    setSelectedSuggestionsMap,
    handleSuggestionClick,
    dynamicSuggestions,
    isWarning,
    isCapped,
    remainingTurns,
    maxTurns,
    userTurnCount,
  };
}
