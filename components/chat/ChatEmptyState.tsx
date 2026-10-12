"use client";

import React from "react";
import { Compass, Sparkles } from "lucide-react";

interface ChatEmptyStateProps {
  dynamicSuggestions: string[];
  onSelectSuggestion: (promptText: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  dynamicSuggestions,
  onSelectSuggestion,
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-950/50">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-100">Welcome to ConfirmRoute AI</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Search live trains, check real-time seat availability across classes, track live running status, view multi-day trend calendars, and discover 2-leg break journey alternatives.
        </p>
      </div>

      {/* Dynamic Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
        {dynamicSuggestions.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSuggestion(sug)}
            className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-sky-500/60 text-left text-xs text-slate-300 hover:text-white transition shadow-sm space-y-1 group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span>Prompt Example</span>
            </div>
            <div className="line-clamp-2">{sug}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
