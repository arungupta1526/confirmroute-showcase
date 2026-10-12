"use client";

import React, { useState } from "react";
import { AlternateResult, AlternateOption } from "@/src/types";
import { Shuffle, Sparkles, IndianRupee, TrainFront, ArrowRight } from "lucide-react";
import { formatStationDisplay, formatDateWithWeekday, parseDateTimestamp } from "./stationHelper";

interface Props {
  data: AlternateResult;
}

export const AlternateTrainsCard = React.memo(function AlternateTrainsCard({ data }: Props) {
  if (!data || !data.alternatesByDate || typeof data.alternatesByDate !== "object") {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        Alternate train suggestions unavailable.
      </div>
    );
  }

  const dateKeys = React.useMemo(() => {
    return Object.keys(data.alternatesByDate).sort(
      (a, b) => parseDateTimestamp(a) - parseDateTimestamp(b)
    );
  }, [data.alternatesByDate]);

  const [selectedDate, setSelectedDate] = useState<string>(dateKeys[0] || "");

  const activeOptions: AlternateOption[] = data.alternatesByDate[selectedDate] || [];

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Alternate Trains</span>
              <span className="text-slate-500">·</span>
              <span className="text-teal-400 text-xs font-semibold">Higher Confirm Chances</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {formatStationDisplay(data.source)} → {formatStationDisplay(data.destination)}
              {(data as any).duration && ` · ${(data as any).duration}`}
              {(data as any).distance && ` · ${(data as any).distance} km`}
            </div>
          </div>
        </div>
      </div>

      {/* Date Tabs */}
      {dateKeys.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {dateKeys.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedDate === d
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-500/30"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {formatDateWithWeekday(d) || d}
            </button>
          ))}
        </div>
      )}

      {/* Options List */}
      {activeOptions.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500">No alternate options found for this date.</div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {activeOptions.map((opt, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrainFront className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-xs text-slate-200">{opt.trainNumber}</span>
                  <span className="text-xs text-slate-300 font-medium truncate max-w-[180px] sm:max-w-[260px]">
                    {opt.trainName}
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 text-[11px] font-bold">
                  {opt.travelClass}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-400">{opt.availability}</span>
                  {opt.description && (
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {opt.description}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {opt.confirmChance != null && opt.confirmChance > 0 && (
                    <span className="text-[11px] text-teal-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      {opt.confirmChance}% Confirm
                    </span>
                  )}
                  {opt.fare != null && (
                    <span className="text-xs font-bold text-slate-200 flex items-center">
                      <IndianRupee className="w-3 h-3 inline" />
                      {opt.fare}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
