"use client";

import React from "react";
import { Sparkles, PlusCircle } from "lucide-react";

interface SessionTurnWarningProps {
  remainingTurns: number;
  onNewChat: () => void;
}

export const SessionTurnWarning: React.FC<SessionTurnWarningProps> = ({
  remainingTurns,
  onNewChat,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-xs text-amber-200 shadow-md backdrop-blur animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span className="truncate">
          <strong className="font-semibold text-amber-100">Fresh chat recommended:</strong>{" "}
          <span className="text-amber-300">
            {remainingTurns} {remainingTurns === 1 ? "turn" : "turns"} left
          </span>{" "}
          to keep railway data accurate.
        </span>
      </div>
      <button
        type="button"
        onClick={onNewChat}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-400/40 text-[11px] font-medium transition cursor-pointer"
        title="Start a new chat session"
      >
        <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
        <span>New Chat</span>
      </button>
    </div>
  );
};
