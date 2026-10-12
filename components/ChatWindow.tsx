"use client";

import React, { useRef, useEffect } from "react";
import type { UIMessage } from "ai";
import { ChatSidebar } from "./ChatSidebar";
import { useChatSessions } from "@/src/hooks/useChatSessions";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { AccountModal } from "./AccountModal";
import { McpModal } from "./McpModal";
import { useAuth } from "@/src/hooks/useAuth";
import { getTomorrowDate } from "@/src/utils/dates";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInputBar } from "./chat/ChatInputBar";
import { ChatMessageList } from "./chat/ChatMessageList";
import { useModalUrlSync } from "@/src/hooks/useModalUrlSync";
import { useChatKeyboardShortcuts } from "@/src/hooks/useChatKeyboardShortcuts";
import { usePullToRefresh } from "@/src/hooks/usePullToRefresh";
import { useChatQuotaManager } from "@/src/hooks/useChatQuotaManager";
import { useChatSessionSync } from "@/src/hooks/useChatSessionSync";
import { useChatScrollPinning } from "@/src/hooks/useChatScrollPinning";
import { useChatMessaging } from "@/src/hooks/useChatMessaging";
import { safePushState, safeReplaceState } from "@/src/utils/history";

interface ChatWindowProps {
  initialSessionId?: string;
}

export function ChatWindow({ initialSessionId: propSessionId }: ChatWindowProps = {}) {
  const auth = useAuth();
  const { session, user, profile, refreshProfile } = auth;

  // Extract session ID from prop or URL pathname (/c/[id] or /chat/[id])
  const resolvedSessionId = React.useMemo(() => {
    if (propSessionId) return propSessionId;
    if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/^\/(?:c|chat)\/([^/]+)/);
      if (match && match[1]) return match[1];
    }
    return undefined;
  }, [propSessionId]);

  const {
    sessions,
    activeSessionId,
    modelId,
    setModelId,
    isInitialized,
    persistSessionMessages,
    handleSelectSession,
    handleNewChat,
    handleDeleteSession,
  } = useChatSessions(session?.access_token, profile?.planId, user?.id, resolvedSessionId);

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isMcpModalOpen,
    isAccountModalOpen,
    accountModalTab,
    accountModalPlan,
    handleOpenAccountModal,
    handleCloseAccountModal,
    handleOpenMcpModal,
    handleCloseMcpModal,
  } = useModalUrlSync();

  const { anonSessionId, enableTerminalLogs, enableDevUnlimited } = useChatQuotaManager({
    profile,
    modelId,
    setModelId,
    refreshProfile,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Broadcast active model changes for companion dev components
  useEffect(() => {
    if (typeof window !== "undefined" && modelId) {
      window.dispatchEvent(
        new CustomEvent("confirmroute:active-model-changed", { detail: { modelId } })
      );
    }
  }, [modelId]);

  const scrollToBottomRef = useRef<(force?: boolean) => void>(() => {});
  const isNearBottomRef = useRef<boolean>(true);
  const hasAnyKey = true;

  const {
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
  } = useChatMessaging({
    activeSessionId,
    sessionToken: session?.access_token,
    anonSessionId,
    enableDevUnlimited,
    modelId,
    setModelId,
    enableTerminalLogs,
    refreshProfile,
    hasAnyKey: true,
    scrollToBottom: (force) => scrollToBottomRef.current(force),
    setIsNearBottom: (val) => {
      isNearBottomRef.current = val;
    },
    inputRef,
  });

  const { chatScrollContainerRef, handleContainerScroll, scrollToBottom } =
    useChatScrollPinning(messages, isLoading);

  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
  }, [scrollToBottom]);

  useChatSessionSync({
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
  });

  const { pullDistance, isPulling, isRefreshing, canRefresh } = usePullToRefresh(
    chatScrollContainerRef,
    {
      threshold: 65,
      onRefresh: () => {
        if (typeof window !== "undefined") window.location.reload();
      },
    }
  );

  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Automatically execute query prompt if navigated from landing page or external link with ?prompt=...
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const promptParam = url.searchParams.get("prompt");
      if (promptParam && promptParam.trim()) {
        url.searchParams.delete("prompt");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
        append({ role: "user", content: promptParam.trim() });
      }
    }
  }, [isInitialized, append]);

  // Keep URL in sync with active session once user has sent messages, keeping empty new chat at /chat
  useEffect(() => {
    if (typeof window === "undefined" || !activeSessionId || !isInitialized) return;
    const hasUserMessage = messages.some((m) => m.role === "user");
    const currentPath = window.location.pathname;

    if (hasUserMessage) {
      const targetPath = `/c/${activeSessionId}`;
      if (currentPath !== targetPath && (currentPath === "/" || currentPath === "/chat")) {
        safeReplaceState(targetPath);
      }
    } else {
      // Empty new chat -> keep clean canonical /chat URL
      if (currentPath.startsWith("/c/")) {
        const activeSession = sessions.find((s) => s.id === activeSessionId);
        const isEmpty = !activeSession?.messages || activeSession.messages.length === 0 || !activeSession.messages.some((m) => m.role === "user");
        if (isEmpty) {
          safeReplaceState("/chat");
        }
      }
    }
  }, [activeSessionId, isInitialized, messages, sessions]);

  const onNewChatClick = () => {
    const targetSession = handleNewChat();
    if (targetSession) {
      setMessages((targetSession.messages as UIMessage[]) || []);
    } else {
      setMessages([]);
    }
    safePushState("/chat");
    setSelectedSuggestionsMap({});
    setErrorMessage(null);
    setReplyingTo(null);
    isNearBottomRef.current = true;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onSelectSessionClick = (sessionId: string) => {
    const target = handleSelectSession(sessionId);
    if (target) {
      setMessages((target.messages as UIMessage[]) || []);
      setSelectedSuggestionsMap({});
      setErrorMessage(null);
      isNearBottomRef.current = true;
      const hasUserMsg = Boolean(target.messages && target.messages.some((m) => m.role === "user"));
      safePushState(hasUserMsg ? `/c/${sessionId}` : "/chat");
      setTimeout(() => {
        scrollToBottom(true);
        inputRef.current?.focus();
      }, 50);
    }
  };

  const lastInputBlurTimeRef = useRef<number>(0);

  // Track blur timestamp on the chat input to handle rapid blur on mobile back gesture
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onBlur = () => {
      lastInputBlurTimeRef.current = Date.now();
    };
    el.addEventListener("blur", onBlur);
    return () => el.removeEventListener("blur", onBlur);
  }, [inputRef]);

  // Synchronize chat with browser back/forward buttons (popstate)
  useEffect(() => {
    if (typeof window === "undefined" || !isInitialized) return;

    const handlePopState = () => {
      const chatPath = activeSessionId ? `/c/${activeSessionId}` : "/chat";

      // 1. Mobile Virtual Keyboard trap: if input is focused or keyboard is visible, dismiss keyboard and remain in chat
      const isVirtualKeyboardOpen =
        typeof window !== "undefined" &&
        Boolean(window.visualViewport && window.visualViewport.height < window.innerHeight - 140);

      const isInputActive =
        Boolean(inputRef.current && (document.activeElement === inputRef.current || inputRef.current.contains(document.activeElement))) ||
        Date.now() - lastInputBlurTimeRef.current < 450 ||
        isVirtualKeyboardOpen;

      if (isInputActive) {
        inputRef.current?.blur();
        safePushState(chatPath);
        return;
      }

      // 2. Mobile Sidebar drawer trap: if sidebar is open, close sidebar and remain in chat
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        safePushState(chatPath);
        return;
      }

      const currentPath = window.location.pathname;
      const match = currentPath.match(/^\/(?:c|chat)\/([^/]+)/);
      if (match && match[1]) {
        const targetId = match[1];
        if (targetId !== activeSessionId) {
          const target = handleSelectSession(targetId);
          if (target) {
            setMessages((target.messages as UIMessage[]) || []);
            setSelectedSuggestionsMap({});
            setErrorMessage(null);
          }
        }
      } else if (currentPath === "/chat") {
        const active = sessions.find((s) => s.id === activeSessionId);
        const isEmpty = !active?.messages || active.messages.length === 0 || !active.messages.some((m) => m.role === "user");
        if (!isEmpty) {
          onNewChatClick();
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isInitialized, activeSessionId, isSidebarOpen, setIsSidebarOpen, sessions, handleSelectSession, setMessages, setSelectedSuggestionsMap, setErrorMessage]);

  const onDeleteSessionClick = (sessionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    const updated = handleDeleteSession(sessionId);
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        onSelectSessionClick(updated[0].id);
      } else {
        safePushState("/chat");
        onNewChatClick();
      }
    }
  };

  useChatKeyboardShortcuts({
    onNewChat: onNewChatClick,
    onToggleSidebar: () => setIsSidebarOpen((prev) => !prev),
    isMcpModalOpen,
    onOpenMcpModal: handleOpenMcpModal,
    onCloseMcpModal: handleCloseMcpModal,
    hasReplyingTo: Boolean(replyingTo),
    onCancelReply: () => setReplyingTo(null),
    isSidebarOpen,
    onCloseSidebar: () => setIsSidebarOpen(false),
  });

  const handleSelectJourney = (journey: { origin: string; destination: string; travelClass?: string }) => {
    const tomorrow = getTomorrowDate();
    const classText = journey.travelClass ? ` in ${journey.travelClass}` : "";
    const prompt = `Search trains from ${journey.origin} to ${journey.destination} on ${tomorrow}${classText}`;
    isNearBottomRef.current = true;
    append({ role: "user", content: prompt });
    scrollToBottom(true);
  };

  return (
    <div className="flex h-full h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-hidden overscroll-none">
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSessionClick}
        onNewChat={onNewChatClick}
        onDeleteSession={onDeleteSessionClick}
        accessToken={session?.access_token}
        onSelectJourney={handleSelectJourney}
        onOpenAccountModal={() => handleOpenAccountModal("plan")}
        isPro={profile?.planId?.startsWith("pro")}
        planId={profile?.planId}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={handleCloseAccountModal}
        initialTab={accountModalTab}
        initialPlanId={accountModalPlan}
        auth={auth}
      />

      <McpModal isOpen={isMcpModalOpen} onClose={handleCloseMcpModal} />

      <div className="flex flex-col flex-1 h-full min-w-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        <ChatHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAccountModal={(tab, planId) => handleOpenAccountModal(tab || "plan", planId)}
          onOpenMcpModal={handleOpenMcpModal}
          onNewChat={onNewChatClick}
          user={user}
          profile={profile}
          enableDevUnlimited={enableDevUnlimited}
        />

        <div
          ref={chatScrollContainerRef}
          onScroll={handleContainerScroll}
          className="flex-1 overflow-y-auto overscroll-y-contain px-3 sm:px-6 py-4 sm:py-6 space-y-4 relative"
        >
          <ChatMessageList
            isInitialized={isInitialized}
            messages={messages}
            isLoading={isLoading}
            error={error}
            errorMessage={errorMessage}
            modelId={modelId}
            setModelId={setModelId}
            hasAnyKey={hasAnyKey}
            dynamicSuggestions={dynamicSuggestions}
            selectedSuggestionsMap={selectedSuggestionsMap}
            handleSuggestionClick={handleSuggestionClick}
            setReplyingTo={setReplyingTo}
            append={append}
            setErrorMessage={setErrorMessage}
            reload={reload}
            handleOpenAccountModal={handleOpenAccountModal}
            userDisplayName={profile?.user?.displayName || user?.user_metadata?.full_name}
            userEmail={user?.email}
            pullDistance={pullDistance}
            isPulling={isPulling}
            isRefreshing={isRefreshing}
            canRefresh={canRefresh}
            isCapped={isCapped}
          />
        </div>

        <ScrollToTopButton targetRef={chatScrollContainerRef} />

        <ChatInputBar
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          hasAnyKey={hasAnyKey}
          inputRef={inputRef}
          isWarning={isWarning}
          isCapped={isCapped}
          remainingTurns={remainingTurns}
          maxTurns={maxTurns}
          onNewChat={onNewChatClick}
        />
      </div>
    </div>
  );
}
