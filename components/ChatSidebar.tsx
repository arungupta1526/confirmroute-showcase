"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChatSession, getRetentionDays } from "@/src/lib/chat-storage";
import {
  X,
  History,
  Clock,
  Sparkles,
  TrainFront,
  ShieldCheck,
} from "lucide-react";
import { ChatSessionsTab } from "./sidebar/ChatSessionsTab";
import { SavedRoutesTab, SavedJourney } from "./sidebar/SavedRoutesTab";
import { useSavedRoutes } from "@/src/hooks/useSavedRoutes";
import { BrandName, BrandLogo } from "@/components/brand";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  accessToken?: string;
  onSelectJourney?: (journey: { origin: string; destination: string; travelClass?: string }) => void;
  onOpenAccountModal?: () => void;
  isPro?: boolean;
  planId?: string;
}

export function ChatSidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  accessToken,
  onSelectJourney,
  onOpenAccountModal,
  isPro,
  planId,
}: Props) {
  const [activeTab, setActiveTab] = useState<"history" | "journeys">("history");
  const { journeys, isLoading: isLoadingJourneys, refreshJourneys } = useSavedRoutes(accessToken);

  const retentionDays = getRetentionDays(planId);
  const isAuthenticated = !!accessToken;

  useEffect(() => {
    if (isOpen && activeTab === "journeys" && accessToken) {
      refreshJourneys();
    }
  }, [isOpen, activeTab, accessToken, refreshJourneys]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        id="chat-history-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full h-[100dvh] max-h-[100dvh] shadow-2xl transition-transform duration-300 ease-in-out shrink-0 touch-manipulation ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <BrandLogo variant="emblem" dimension={28} />
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                <BrandName className="text-xs sm:text-sm" />
                <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/50 whitespace-nowrap shrink-0">
                  {isPro
                    ? `${retentionDays}-Day Pro`
                    : isAuthenticated
                    ? `${retentionDays}-Day Sync`
                    : "3-Day Auto-Clean"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>
                  {isPro
                    ? `${retentionDays}-Day Cloud History`
                    : isAuthenticated
                    ? `${retentionDays}-Day Account History`
                    : "Auto-cleans after 72 hrs"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-sidebar-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer touch-manipulation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800/80 px-3 pt-2 bg-slate-900/50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              activeTab === "history"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Chat History</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("journeys")}
            className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
              activeTab === "journeys"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saved Routes</span>
            {journeys.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-950 text-orange-400 border border-orange-800/60">
                {journeys.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "history" ? (
          <ChatSessionsTab
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={onSelectSession}
            onNewChat={onNewChat}
            onDeleteSession={onDeleteSession}
            onClose={onClose}
            isPro={isPro}
            planId={planId}
            formatDate={formatDate}
          />
        ) : (
          <SavedRoutesTab
            accessToken={accessToken}
            journeys={journeys}
            isLoadingJourneys={isLoadingJourneys}
            onRefreshJourneys={refreshJourneys}
            onSelectJourney={onSelectJourney}
            onOpenAccountModal={onOpenAccountModal}
            onClose={onClose}
            planId={planId}
          />
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between shrink-0 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className={`w-3.5 h-3.5 ${isPro ? "text-orange-400" : "text-emerald-400"}`} />
            <span>
              {isPro
                ? `${retentionDays}-Day Cloud History`
                : isAuthenticated
                ? `${retentionDays}-Day Account Retention`
                : "3-Day Local Retention"}
            </span>
          </span>
          <span className="text-slate-500">
            {activeTab === "history" ? `${sessions.length} Chats` : `${journeys.length} Routes`}
          </span>
        </div>
      </aside>
    </>
  );
}
