"use client";

import React from "react";
import { Ticket, Bookmark, BookmarkCheck, CheckCircle2, Clock, IndianRupee, AlertCircle } from "lucide-react";

interface Props {
  pnr: string;
  trainNumber: string;
  trainName: string;
  travelClass?: string;
  quota?: string;
  fareDisplay?: string | number | null;
  chartPrepared: boolean;
  isWatched: boolean;
  onToggleWatch: () => void;
  informationMessage?: string | null;
}

export const PnrHeader = React.memo(function PnrHeader({
  pnr,
  trainNumber,
  trainName,
  travelClass,
  quota,
  fareDisplay,
  chartPrepared,
  isWatched,
  onToggleWatch,
  informationMessage,
}: Props) {
  return (
    <>
      {/* Informational / Cancellation Banner */}
      {informationMessage && (
        <div className="px-4 py-2 bg-rose-950/70 border-b border-rose-800/80 flex items-center gap-2 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{informationMessage}</span>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
              <span>PNR: {pnr}</span>
              {travelClass && (
                <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 text-[10px] font-mono border border-sky-800">
                  {travelClass}
                </span>
              )}
              {quota && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {quota}
                </span>
              )}
              {fareDisplay && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-emerald-300 text-[10px] font-mono inline-flex items-center gap-0.5 border border-slate-700/60">
                  <IndianRupee className="w-2.5 h-2.5" />
                  {fareDisplay}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {trainNumber} — {trainName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleWatch}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
              isWatched
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60"
            }`}
            title={isWatched ? "Remove from tracked PNRs" : "Track this PNR for live charting & updates"}
          >
            {isWatched ? (
              <>
                <BookmarkCheck className="w-3 h-3 text-amber-400" />
                <span>Tracked</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3 text-slate-400" />
                <span>Track PNR</span>
              </>
            )}
          </button>

          {/* Chart status badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              chartPrepared
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                : "bg-amber-950/60 text-amber-300 border-amber-800/60"
            }`}
          >
            {chartPrepared ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Chart Prepared</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Chart Not Prepared</span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
