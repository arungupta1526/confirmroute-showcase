"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { StoredMessage, getMessageToolInvocations } from "@/src/lib/chat-storage";

interface Props {
  message: StoredMessage;
  selectedSuggestion: string | null;
  onSuggestionClick: (promptText: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

/**
 * Parses explicit follow-up suggestions from markdown or generates context-aware dynamic suggestions (2-3) based on executed tools.
 */
export function getNextPromptSuggestions(message: StoredMessage): string[] {
  if (message.role !== "assistant") return [];

  // 0. Dedicated starter suggestions for first-time welcome message
  if (message.id === "welcome-message-first-time") {
    return [
      "Search trains from Varanasi (BSB) to New Delhi (NDLS) tomorrow in 3A",
      "Live running status of train 12002",
      "2-leg connecting trains from Patna to Mumbai tomorrow",
    ];
  }

  const suggestions: string[] = [];

  // 1. Parse suggestions from markdown text if AI generated a suggestion section
  if (message.content) {
    const lines = message.content.split("\n");
    let inSuggestionSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.toLowerCase().includes("suggested next question") ||
        trimmed.toLowerCase().includes("suggested next step") ||
        trimmed.toLowerCase().includes("suggested questions") ||
        trimmed.toLowerCase().includes("suggested prompt")
      ) {
        inSuggestionSection = true;
        continue;
      }

      if (inSuggestionSection) {
        if (trimmed.startsWith("#") || trimmed.startsWith("---")) {
          inSuggestionSection = false;
        } else if (
          trimmed.startsWith("-") ||
          trimmed.startsWith("*") ||
          trimmed.startsWith("💡") ||
          /^\d+\./.test(trimmed)
        ) {
          const cleanText = trimmed
            .replace(/^[-*💡]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/https?:\/\/\S+/gi, "")
            .replace(/[*_"`']/g, "")
            .replace(/\[/g, "")
            .replace(/\]/g, "")
            .trim();
          if (cleanText && cleanText.length >= 5 && cleanText.length <= 95) {
            // ConfirmRoute is strictly an independent travel advisor; filter out direct booking prompts
            if (!/^(book\s+tickets?|book\s+now|buy\s+tickets?)/i.test(cleanText)) {
              suggestions.push(cleanText);
            }
          }
        }
      }
    }
  }

  if (suggestions.length >= 2) {
    return Array.from(new Set(suggestions)).slice(0, 3);
  }

  // 2. Generate dynamic fallback suggestions based on executed tool calls with corrected arg key names (CQ-7)
  const tools = getMessageToolInvocations(message);
  let trainNo = "";
  let fromStn = "";
  let toStn = "";

  tools.forEach((t) => {
    const args = (t.args as Record<string, unknown>) || {};
    // CQ-7: Correct argument parameter keys matching AI SDK / MCP definitions
    if (args.trainNumber) trainNo = String(args.trainNumber);
    if (args.trainNo) trainNo = String(args.trainNo);
    if (args.origin) fromStn = String(args.origin);
    if (args.fromStation) fromStn = String(args.fromStation);
    if (args.destination) toStn = String(args.destination);
    if (args.toStation) toStn = String(args.toStation);

    if (t.state === "result" && t.result) {
      const res = t.result as Record<string, unknown>;
      if (
        t.toolName === "search_trains" &&
        Array.isArray(res.trains) &&
        res.trains.length > 0
      ) {
        const firstTrain = res.trains[0] as { trainNumber?: string };
        if (!trainNo && firstTrain.trainNumber) {
          trainNo = firstTrain.trainNumber;
        }
      }
      if (t.toolName === "get_pnr_status") {
        if (!trainNo && res.trainNumber) trainNo = String(res.trainNumber);
        if (!fromStn && res.fromStationCode) fromStn = String(res.fromStationCode);
        if (!toStn && res.toStationCode) toStn = String(res.toStationCode);
      }
    }
  });

  const dynamicSuggestions: string[] = [];

  const hasLiveStatus = tools.some((t) => t.toolName === "get_live_running_status");
  const hasSchedule = tools.some((t) => t.toolName === "get_train_schedule");
  const hasSearch = tools.some((t) => t.toolName === "search_trains");
  const hasAvailability = tools.some((t) => t.toolName === "get_seat_availability");
  const hasConnecting = tools.some((t) => t.toolName === "get_connecting_trains");
  const hasPnr = tools.some((t) => t.toolName === "get_pnr_status");

  if (hasPnr && trainNo) {
    dynamicSuggestions.push(`Live running status of train ${trainNo}`);
    dynamicSuggestions.push(`Coach position of train ${trainNo}`);
    dynamicSuggestions.push(`Ratings and food review for train ${trainNo}`);
    if (fromStn && toStn) {
      dynamicSuggestions.push(`Find alternate trains from ${fromStn} to ${toStn}`);
    }
  } else if (hasLiveStatus && trainNo) {
    dynamicSuggestions.push(`Check seat availability for train ${trainNo}`);
    dynamicSuggestions.push(`View complete route schedule for train ${trainNo}`);
    dynamicSuggestions.push(`Find 2-leg connecting trains if delayed`);
  } else if (hasSchedule && trainNo) {
    dynamicSuggestions.push(`Live running status of train ${trainNo}`);
    dynamicSuggestions.push(`Check seat availability for train ${trainNo}`);
    dynamicSuggestions.push(`Availability calendar trend for train ${trainNo}`);
  } else if (hasSearch) {
    if (trainNo) {
      dynamicSuggestions.push(`Live running status of train ${trainNo}`);
      dynamicSuggestions.push(`Check seat availability for train ${trainNo}`);
    } else {
      dynamicSuggestions.push(`Live running status of top train`);
      dynamicSuggestions.push(`Check seat availability for 3AC class`);
    }
    const fromToText = fromStn && toStn ? `from ${fromStn} to ${toStn}` : "";
    dynamicSuggestions.push(`Find 2-leg connecting trains ${fromToText}`.trim());
  } else if (hasAvailability) {
    if (trainNo) {
      dynamicSuggestions.push(`Live running status of train ${trainNo}`);
      dynamicSuggestions.push(`View complete route schedule for train ${trainNo}`);
    }
    const fromToText = fromStn && toStn ? `between ${fromStn} and ${toStn}` : "";
    dynamicSuggestions.push(`Find 2-leg connecting trains ${fromToText}`.trim());
  } else if (hasConnecting) {
    dynamicSuggestions.push(`Check direct trains availability for this route`);
    dynamicSuggestions.push(`Live running status of the first connecting train`);
  }

  // Clean and filter duplicates
  const finalSuggestions = Array.from(new Set([...suggestions, ...dynamicSuggestions])).filter(
    (s) => s.length >= 6
  );

  return finalSuggestions.slice(0, 3);
}

export const SuggestionChips = React.memo(function SuggestionChips({
  message,
  selectedSuggestion,
  onSuggestionClick,
  isLoading,
  disabled = false,
}: Props) {
  const suggestions = getNextPromptSuggestions(message);

  if (suggestions.length === 0) return null;

  const isTurnLocked = Boolean(selectedSuggestion);
  const isWelcome = message.id === "welcome-message-first-time";

  return (
    <div className="pt-2 border-t border-slate-800/60 mt-2">
      <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>
          {isTurnLocked
            ? "Selected prompt:"
            : isWelcome
            ? "Quick-start prompts:"
            : "Suggested follow-up questions:"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((sug) => {
          const isSelected = selectedSuggestion === sug;
          // When a suggestion is selected for this turn, disable all chips in this message
          const isDisabled = isLoading || disabled || isTurnLocked;

          return (
            <button
              key={sug}
              type="button"
              aria-label={sug}
              onClick={() => {
                if (!isDisabled) onSuggestionClick(sug);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isDisabled) onSuggestionClick(sug);
                }
              }}
              disabled={isDisabled}
              className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 font-medium text-left ${
                isSelected
                  ? "bg-sky-600/80 border-sky-400 text-white shadow-sm shadow-sky-500/30 cursor-default pointer-events-none select-none"
                  : isDisabled
                  ? "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-40 pointer-events-none select-none"
                  : "bg-slate-900/90 hover:bg-slate-800 border-sky-900/50 hover:border-sky-500/80 text-sky-300 hover:text-sky-100 shadow-sm cursor-pointer"
              }`}
            >
              <Sparkles className={`w-3 h-3 ${isSelected ? "text-white" : "text-amber-400"}`} />
              <span className="line-clamp-1">{sug}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
