"use client";

import React from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";

interface SessionLimitReachedCardProps {
  maxTurns: number;
  onNewChat: () => void;
}

export const SessionLimitReachedCard: React.FC<SessionLimitReachedCardProps> = ({
  maxTurns,
  onNewChat,
}) => {
  return (
    <div className="w-full rounded-2xl bg-slate-900/95 border border-sky-500/30 p-3.5 sm:p-4 shadow-xl backdrop-blur animate-in fade-in zoom-in-95">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-100">
                Session Complete
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 font-mono">
                {maxTurns}/{maxTurns} turns
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              To keep live schedules and availability 100% accurate, please start a fresh chat.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start Fresh Chat</span>
        </button>
      </div>
    </div>
  );
};
