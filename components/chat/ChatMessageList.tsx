"use client";

import React from "react";
import type { UIMessage } from "ai";
import { StoredMessage } from "@/src/lib/chat-storage";
import { AVAILABLE_MODELS } from "@/src/lib/models";
import { MessageBubble } from "../MessageBubble";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatErrorBanner } from "./ChatErrorBanner";
import { Loader2, RefreshCw } from "lucide-react";
import type { AccountTabType } from "@/components/account/AccountModalTabs";

interface ChatMessageListProps {
  isInitialized: boolean;
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | undefined;
  errorMessage: string | null;
  modelId: string;
  setModelId: (id: string) => void;
  hasAnyKey: boolean;
  dynamicSuggestions: string[];
  selectedSuggestionsMap: Record<string, string>;
  handleSuggestionClick: (messageId: string, sug: string) => void;
  setReplyingTo: (msg: { id: string; role: string; content: string }) => void;
  append: (message: { role: "user"; content: string }) => void;
  setErrorMessage: (msg: string | null) => void;
  reload: () => void;
  handleOpenAccountModal: (tab?: AccountTabType, plan?: string) => void;
  userDisplayName?: string | null;
  userEmail?: string | null;
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
  canRefresh: boolean;
  isCapped?: boolean;
}

export const ChatMessageList = React.memo(function ChatMessageList({
  isInitialized,
  messages,
  isLoading,
  error,
  errorMessage,
  modelId,
  setModelId,
  hasAnyKey,
  dynamicSuggestions,
  selectedSuggestionsMap,
  handleSuggestionClick,
  setReplyingTo,
  append,
  setErrorMessage,
  reload,
  handleOpenAccountModal,
  userDisplayName,
  userEmail,
  pullDistance,
  isPulling,
  isRefreshing,
  canRefresh,
  isCapped = false,
}: ChatMessageListProps) {
  return (
    <>
      {(isPulling || isRefreshing) && (
        <div
          className="flex items-center justify-center transition-all duration-150 overflow-hidden shrink-0 pt-1 pb-2"
          style={{ height: `${Math.max(pullDistance, isRefreshing ? 48 : 0)}px` }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 shadow-xl backdrop-blur">
            <RefreshCw
              className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${Math.min(pullDistance * 4, 360)}deg)`,
              }}
            />
            <span className="text-[11px] font-medium text-slate-300">
              {isRefreshing ? "Refreshing chat..." : canRefresh ? "Release to refresh" : "Pull down to refresh"}
            </span>
          </div>
        </div>
      )}

      {!isInitialized ? (
        <div className="max-w-4xl mx-auto space-y-4 py-8 animate-pulse">
          <div className="flex gap-3 max-w-[70%]">
            <div className="w-8 h-8 rounded-xl bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-16 bg-slate-900/80 rounded-xl border border-slate-800/60" />
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <ChatEmptyState
          dynamicSuggestions={dynamicSuggestions}
          onSelectSuggestion={(sug) => {
            if (hasAnyKey) append({ role: "user", content: sug });
            else setErrorMessage("Please set GEMINI_API_KEY in .env.local first.");
          }}
        />
      ) : (
        <div className="max-w-4xl mx-auto space-y-5">
          {messages.map((m, idx) => {
            const prevMsg = idx > 0 ? (messages[idx - 1] as StoredMessage) : null;
            const prevBoundModelName =
              prevMsg?.modelName ||
              (prevMsg?.role === "assistant"
                ? AVAILABLE_MODELS.find((mod) => mod.id === (prevMsg?.modelId || modelId))?.name
                : undefined);
            const isLast = idx === messages.length - 1;

            return (
              <MessageBubble
                key={m.id || idx}
                message={m as StoredMessage}
                index={idx}
                prevBoundModelName={prevBoundModelName}
                isLastMessage={isLast}
                currentModelId={modelId}
                selectedSuggestion={selectedSuggestionsMap[m.id] || (m as StoredMessage).selectedSuggestion || null}
                onSuggestionClick={(sug) => handleSuggestionClick(m.id, sug)}
                onReplyTo={(msg) => setReplyingTo(msg)}
                isLoading={isLoading}
                userDisplayName={userDisplayName}
                userEmail={userEmail}
                isCapped={isCapped}
              />
            );
          })}

          {isLoading && (
            <div
              aria-live="polite"
              id="chat-loading-indicator"
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-sky-400 max-w-[85%] animate-pulse"
            >
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>ConfirmRoute AI is thinking & querying Indian Railways data...</span>
            </div>
          )}

          <ChatErrorBanner
            errorMessage={errorMessage}
            error={error}
            onRetry={() => {
              setErrorMessage(null);
              reload();
            }}
            onOpenAccountModal={handleOpenAccountModal}
            currentModelId={modelId}
            onSwitchModel={(newId) => setModelId(newId)}
          />
        </div>
      )}
    </>
  );
});
