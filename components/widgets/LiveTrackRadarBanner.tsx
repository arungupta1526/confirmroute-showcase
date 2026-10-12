"use client";

import React from "react";
import { GitFork, ArrowUpRight } from "lucide-react";

interface CongestionData {
  stationName?: string;
  stationCode?: string;
  crossingTrains: Array<{
    trainNo: string;
    trainName: string;
    actualTime: string;
    blockSection: string;
    section?: string;
  }>;
  aheadTrains: Array<{
    trainNo: string;
    trainName: string;
    actualTime: string;
    blockSection: string;
    section?: string;
  }>;
}

interface Props {
  congestion: CongestionData;
}

export const LiveTrackRadarBanner = React.memo(function LiveTrackRadarBanner({
  congestion,
}: Props) {
  if (!congestion || (congestion.crossingTrains.length === 0 && congestion.aheadTrains.length === 0)) {
    return null;
  }

  return (
    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-sky-400">
          <GitFork className="w-3.5 h-3.5" />
          Live Track Radar & Congestion {congestion.stationName ? `(${congestion.stationName})` : ""}
        </span>
        <span className="text-slate-500 font-normal">Adjacent Block Sections</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        {/* Crossing Trains */}
        {congestion.crossingTrains.length > 0 && (
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Opposite Crossings:
            </span>
            <div className="space-y-1">
              {congestion.crossingTrains.slice(0, 2).map((c, i) => (
                <div
                  key={i}
                  className="px-2 py-1 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex justify-between items-center"
                >
                  <span className="truncate max-w-[170px]">
                    {c.trainNo} {c.trainName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.blockSection}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ahead in Section */}
        {congestion.aheadTrains.length > 0 && (
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Ahead in Block Section:
            </span>
            <div className="space-y-1">
              {congestion.aheadTrains.slice(0, 2).map((a, i) => (
                <div
                  key={i}
                  className="px-2 py-1 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex justify-between items-center"
                >
                  <span className="truncate max-w-[170px]">
                    {a.trainNo} {a.trainName}
                  </span>
                  <span className="text-[10px] text-amber-400/90 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {a.blockSection}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
