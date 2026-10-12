"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Train } from "lucide-react";
import { getCoachColor, parseCoachPosition, cleanCoachToken } from "../coachHelper";

interface Props {
  coachPosition: string | null | undefined;
  assignedCoaches?: string[];
  trainNumber?: string;
}

export const PnrCoachStrip = React.memo(function PnrCoachStrip({
  coachPosition,
  assignedCoaches = [],
  trainNumber,
}: Props) {
  const coaches = React.useMemo(() => parseCoachPosition(coachPosition), [coachPosition]);
  const normalizedAssigned = React.useMemo(
    () => assignedCoaches.map((c) => cleanCoachToken(c).toUpperCase().trim()).filter(Boolean),
    [assignedCoaches]
  );
  const hasAssignedMatch = coaches.some((c) => normalizedAssigned.includes(c.toUpperCase()));

  // Expand by default if passenger has a confirmed coach in the rake
  const [isExpanded, setIsExpanded] = useState<boolean>(hasAssignedMatch);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-center the passenger's assigned coach ("YOU") inside the horizontal strip ONLY
  // Strictly avoid targetEl.scrollIntoView() which hijacks page/chat vertical scrolling in Safari
  React.useEffect(() => {
    if (!isExpanded || !hasAssignedMatch) return;
    const timer = setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      const targetEl = container.querySelector<HTMLElement>('[data-assigned="true"]');
      if (targetEl) {
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetCenterOffset = targetRect.left - containerRect.left + targetRect.width / 2;
        const scrollDelta = targetCenterOffset - containerRect.width / 2;
        container.scrollTo({
          left: Math.max(0, container.scrollLeft + scrollDelta),
          behavior: "smooth",
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isExpanded, hasAssignedMatch]);

  if (!coaches || coaches.length === 0) return null;

  const handleOpenCoachLayout = () => {
    if (!trainNumber) return;
    window.dispatchEvent(
      new CustomEvent("confirmroute:send-prompt", {
        detail: { prompt: `Coach position of train ${trainNumber}` },
      })
    );
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/40">
      <div className="px-4 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Train className="w-3.5 h-3.5 text-sky-400" />
          <span>Train Coach Layout ({coaches.length} Coaches)</span>
          {hasAssignedMatch && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800/80">
              Coach Identified
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {trainNumber && (
          <button
            type="button"
            onClick={handleOpenCoachLayout}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Ask AI for comprehensive rake breakdown"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Full Layout Tool</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-3 pt-1 space-y-2">
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <span className="text-amber-400 font-medium">Front (Engine)</span>
            <span className="text-slate-600">→</span>
            <span>Scroll horizontally to locate your coach</span>
          </div>

          <div ref={scrollRef} className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
            {coaches.map((code, idx) => {
              const upperCode = code.toUpperCase();
              const isAssigned = normalizedAssigned.includes(upperCode);
              const colorClass = getCoachColor(code);

              return (
                <div
                  key={`${code}-${idx}`}
                  data-assigned={isAssigned ? "true" : undefined}
                  className="flex flex-col items-center shrink-0"
                >
                  <div
                    className={`min-w-10 px-2 h-9 rounded-lg border flex flex-col items-center justify-center font-bold text-[11px] transition-all relative ${colorClass} ${
                      isAssigned
                        ? "ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20 scale-105 z-10"
                        : "hover:scale-105"
                    }`}
                  >
                    {isAssigned && (
                      <span className="absolute -top-1.5 px-1 rounded-full bg-emerald-500 text-slate-950 text-[8px] font-black uppercase tracking-tight">
                        You
                      </span>
                    )}
                    <span>{code}</span>
                  </div>
                  <span className="text-[8px] text-slate-500 mt-0.5 font-mono">#{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
