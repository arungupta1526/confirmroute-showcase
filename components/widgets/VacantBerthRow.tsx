"use client";

import React from "react";
import { formatStationDisplay } from "./stationHelper";
import { resolveBerthType, BERTH_BADGE_CLASSES } from "../../src/utils/berthHelper";
import type { VacantBerthItem } from "../../src/types";

export const CLASS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "1A": { bg: "bg-purple-950/50", text: "text-purple-300", border: "border-purple-800/60" },
  "2A": { bg: "bg-indigo-950/50", text: "text-indigo-300", border: "border-indigo-800/60" },
  "3A": { bg: "bg-blue-950/50", text: "text-blue-300", border: "border-blue-800/60" },
  "3E": { bg: "bg-cyan-950/50", text: "text-cyan-300", border: "border-cyan-800/60" },
  CC: { bg: "bg-teal-950/50", text: "text-teal-300", border: "border-teal-800/60" },
  SL: { bg: "bg-emerald-950/50", text: "text-emerald-300", border: "border-emerald-800/60" },
  "2S": { bg: "bg-amber-950/50", text: "text-amber-300", border: "border-amber-800/60" },
};

interface VacantBerthRowProps {
  berth: VacantBerthItem;
  index: number;
  onSelectBerthType: (code: string) => void;
}

export const VacantBerthRow = React.memo(function VacantBerthRow({
  berth: b,
  index: idx,
  onSelectBerthType,
}: VacantBerthRowProps) {
  const colors = CLASS_COLORS[b.classCode] || {
    bg: "bg-slate-900",
    text: "text-slate-300",
    border: "border-slate-800",
  };
  const berthType = resolveBerthType(b.berthNumber, b.classCode, b.berthCode);
  const badgeClass =
    BERTH_BADGE_CLASSES[berthType.code] ||
    "bg-slate-800/80 text-slate-400 border-slate-700/60 font-semibold";

  return (
    <div
      key={`${b.coachName}-${b.berthNumber}-${idx}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-bold px-2 py-0.5 rounded border text-[11px] shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {b.coachName}
        </span>
        <div className="min-w-0">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5 flex-wrap">
            <span className="shrink-0">Berth {b.berthNumber}</span>
            {berthType.code && (
              <button
                type="button"
                onClick={() => onSelectBerthType(berthType.code)}
                title={`Click to filter by ${berthType.label} (${berthType.code})`}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-transform active:scale-95 shrink-0 ${badgeClass}`}
              >
                {berthType.code} · {berthType.label}
              </button>
            )}
            {b.cabinCoupeNo && (
              <span className="text-purple-300 text-[10px] font-medium shrink-0">
                Coupe {b.cabinCoupeNo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="sm:text-right text-[11px] min-w-0">
        <div className="font-medium text-slate-300 break-words leading-tight">
          {formatStationDisplay(b.from, b.fromStationName)} → {formatStationDisplay(b.to, b.toStationName)}
        </div>
        <div
          className={`text-[10px] font-medium mt-0.5 ${
            b.isAvailableAtBoarding
              ? "text-emerald-400"
              : b.isDownstream
              ? "text-sky-400"
              : "text-amber-400/80"
          }`}
        >
          {b.isAvailableAtBoarding
            ? `Available from ${b.fromStationName || b.from}`
            : b.isDownstream
            ? `Vacant ahead from ${b.fromStationName || b.from}`
            : "Past segment (ended before boarding)"}
        </div>
      </div>
    </div>
  );
});
