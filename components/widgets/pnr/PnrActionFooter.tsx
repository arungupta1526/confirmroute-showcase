"use client";

import React from "react";
import { Activity, CalendarDays, Shuffle, Utensils } from "lucide-react";

interface Props {
  trainNumber: string;
  fromStationCode: string;
  toStationCode: string;
  isWaitlistOrCancelled: boolean;
}

export const PnrActionFooter = React.memo(function PnrActionFooter({
  trainNumber,
  fromStationCode,
  toStationCode,
  isWaitlistOrCancelled,
}: Props) {
  const handleTrigger = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("confirmroute:send-prompt", {
        detail: { prompt },
      })
    );
  };

  return (
    <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Quick Inquiries
      </span>

      <div className="flex items-center gap-1.5 flex-wrap">
        {trainNumber && (
          <button
            type="button"
            onClick={() => handleTrigger(`Live running status of train ${trainNumber}`)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500/60 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
            title="Check live GPS location and delay"
          >
            <Activity className="w-3 h-3 text-sky-400" />
            <span>Live Status</span>
          </button>
        )}

        {trainNumber && (
          <button
            type="button"
            onClick={() => handleTrigger(`Train schedule and stops of train ${trainNumber}`)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500/60 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
            title="Check full timetable & halt stations"
          >
            <CalendarDays className="w-3 h-3 text-indigo-400" />
            <span>Timetable</span>
          </button>
        )}

        {isWaitlistOrCancelled && fromStationCode && toStationCode && (
          <button
            type="button"
            onClick={() =>
              handleTrigger(`Find alternate trains from ${fromStationCode} to ${toStationCode}`)
            }
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60 hover:border-amber-500 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
            title="Find alternative direct or connecting trains"
          >
            <Shuffle className="w-3 h-3 text-amber-400" />
            <span>Find Alternates</span>
          </button>
        )}

        {trainNumber && (
          <button
            type="button"
            onClick={() => handleTrigger(`Ratings and food review for train ${trainNumber}`)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500/60 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
            title="Check cleanliness and pantry food ratings"
          >
            <Utensils className="w-3 h-3 text-emerald-400" />
            <span>Food & Ratings</span>
          </button>
        )}
      </div>
    </div>
  );
});
