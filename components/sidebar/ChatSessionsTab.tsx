"use client";

import React from "react";
import { ChatSession, getRetentionDays } from "@/src/lib/chat-storage";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

interface ChatSessionsTabProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onClose: () => void;
  isPro?: boolean;
  planId?: string;
  formatDate: (timestamp: number) => string;
}

export const ChatSessionsTab: React.FC<ChatSessionsTabProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
  isPro,
  planId,
  formatDate,
}) => {
  const retentionDays = getRetentionDays(planId);

  // Display sessions that have user messages, plus at most the current active session if empty.
  // Completely eliminates duplicate/stale empty chats from cluttering the history list.
  const displaySessions = React.useMemo(() => {
    let emptyCount = 0;
    return sessions.filter((s) => {
      const hasUserMsg = Boolean(s.messages && s.messages.length > 0 && s.messages.some((m) => m.role === "user"));
      if (hasUserMsg) return true;
      if (s.id === activeSessionId && emptyCount === 0) {
        emptyCount++;
        return true;
      }
      return false;
    });
  }, [sessions, activeSessionId]);

  return (
    <>
      {/* New Chat Button */}
      <div className="p-3 border-b border-slate-800/60 shrink-0">
        <button
          id="new-chat-btn"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full py-2.5 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition group cursor-pointer"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>New Train Chat</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {displaySessions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs px-4 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p>No saved chat sessions.</p>
            <p className="text-[10px] text-slate-500">
              {isPro
                ? `Your train chats automatically save to your account for ${retentionDays} days!`
                : planId && planId !== "guest"
                ? `Your train chats automatically save to your account for ${retentionDays} days!`
                : "Your train chats automatically save for 3 days in browser storage!"}
            </p>
          </div>
        ) : (
          displaySessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const msgCount = session.messages ? session.messages.length : 0;

            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectSession(session.id);
                    onClose();
                  }
                }}
                className={`group relative p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                  isActive
                    ? "bg-slate-800/90 border-sky-500/60 text-slate-100 shadow-sm"
                    : "bg-slate-900/50 border-slate-800/60 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                      isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-xs text-slate-200 truncate leading-snug">
                      {session.title || "Train Search"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                      <span>{formatDate(session.updatedAt)}</span>
                      <span>•</span>
                      <span>{msgCount} msgs</span>
                    </div>
                  </div>
                </div>

                <button
                  id={`delete-session-${session.id}`}
                  onClick={(e) => onDeleteSession(session.id, e)}
                  aria-label="Delete chat session"
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded-lg hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition shrink-0 cursor-pointer"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
