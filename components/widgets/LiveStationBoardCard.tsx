"use client";

import React, { useState } from "react";
import { Compass, Clock } from "lucide-react";
import type { StationLiveBoardResult } from "@/src/types";
import { formatStationDisplay } from "./stationHelper";

interface LiveStationBoardCardProps {
  data: StationLiveBoardResult;
}

type TimeWindowOption = "0-2h" | "2-4h" | "4-6h" | "ALL";

const WINDOW_OPTIONS: { id: TimeWindowOption; label: string }[] = [
  { id: "0-2h", label: "Next 2h" },
  { id: "2-4h", label: "2 - 4h" },
  { id: "4-6h", label: "4 - 6h" },
  { id: "ALL", label: "All (8h)" },
];

function getTimeDiffMinutes(timeStr: string, queryTimeIst: string): number {
  if (!timeStr || !timeStr.includes(":") || timeStr.includes("-")) return -1;
  const [th, tm] = timeStr.split(":").map(Number);
  const [qh, qm] = (queryTimeIst || "00:00").replace(" IST", "").split(":").map(Number);
  if (isNaN(th) || isNaN(tm) || isNaN(qh) || isNaN(qm)) return -1;
  return (th * 60 + (tm || 0) - (qh * 60 + (qm || 0)) + 1440) % 1440;
}

function formatTimeUntil(timeStr: string, queryTimeIst: string): string {
  const diff = getTimeDiffMinutes(timeStr, queryTimeIst);
  if (diff < 0) return "TBA";
  if (diff <= 3) return "Now";
  if (diff < 60) return `in ${diff}m`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
}

export const LiveStationBoardCard: React.FC<LiveStationBoardCardProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<"ALL" | "DEPARTURE" | "ARRIVAL">("ALL");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [selectedWindow, setSelectedWindow] = useState<TimeWindowOption>("0-2h");

  const platforms = React.useMemo(() => {
    if (!data?.trains) return [];
    const set = new Set<string>();
    data.trains.forEach((t) => {
      if (t.expectedPlatform && t.expectedPlatform !== "-") {
        set.add(String(t.expectedPlatform));
      }
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [data?.trains]);

  if (!data || !data.stationCode) return null;

  const filteredTrains = data.trains.filter((t) => {
    if (filterType !== "ALL" && t.type !== filterType) return false;
    if (selectedPlatform !== "ALL" && String(t.expectedPlatform) !== selectedPlatform) return false;

    const targetTime = t.expectedTime || t.scheduledTime;
    const diff = getTimeDiffMinutes(targetTime, data.queryTimeIst);
    if (diff < 0) {
      if (selectedWindow !== "ALL") return false;
    } else {
      if (selectedWindow === "0-2h" && (diff < 0 || diff > 120)) return false;
      if (selectedWindow === "2-4h" && (diff <= 120 || diff > 240)) return false;
      if (selectedWindow === "4-6h" && (diff <= 240 || diff > 360)) return false;
      if (selectedWindow === "ALL" && diff > 480) return false;
    }

    return true;
  });

  const windowLabel =
    selectedWindow === "0-2h"
      ? "Next 2 hrs"
      : selectedWindow === "2-4h"
      ? "2 - 4 hrs slot"
      : selectedWindow === "4-6h"
      ? "4 - 6 hrs slot"
      : "All 8 hrs";

  return (
    <div className="w-full my-3.5 rounded-2xl border border-sky-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-5 shadow-2xl text-slate-100 font-sans text-xs sm:text-sm">
      {/* Airport-style Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-inner">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2 flex-wrap">
              <span>Live Station Board: {formatStationDisplay(data.stationCode)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 font-mono border border-sky-800">
                {windowLabel}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live snapshot as of <span className="font-mono text-sky-300">{data.queryTimeIst}</span> • Showing{" "}
              <span className="font-mono text-sky-300 font-bold">{filteredTrains.length}</span> of {data.totalTrains} active trains
            </p>
          </div>
        </div>

        {/* Filter Chips: Type, Window, and Platform */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Departures / Arrivals */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["ALL", "DEPARTURE", "ARRIVAL"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  filterType === type
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {type === "ALL" ? "All Trains" : type === "DEPARTURE" ? "Departures" : "Arrivals"}
              </button>
            ))}
          </div>

          {/* Time Window Selector (Option B: Slot Intervals) */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 pl-1.5 pr-0.5 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-sky-400" />
              Window:
            </span>
            {WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedWindow(opt.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition shrink-0 ${
                  selectedWindow === opt.id
                    ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {platforms.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full no-scrollbar scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setSelectedPlatform("ALL")}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition shrink-0 ${
                  selectedPlatform === "ALL"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All PF
              </button>
              {platforms.map((pf) => (
                <button
                  key={pf}
                  type="button"
                  onClick={() => setSelectedPlatform(pf)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition shrink-0 ${
                    selectedPlatform === pf
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  PF {pf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Train List / Board */}
      <div className="mt-3 divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto pr-1">
        {filteredTrains.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            No active trains found in this {windowLabel} filter.
          </div>
        ) : (
          filteredTrains.map((train, idx) => {
            const targetTime = train.expectedTime || train.scheduledTime;
            const diff = getTimeDiffMinutes(targetTime, data.queryTimeIst);
            const isDepartingSoon =
              train.type === "DEPARTURE" &&
              diff >= 0 &&
              diff <= 35 &&
              (train.status.toLowerCase().includes("departing") ||
                train.status.toLowerCase().includes("ready") ||
                train.delayMinutes === 0);
            const isDiverted = train.status.toLowerCase().includes("divert");
            const isCancelled = train.status.toLowerCase().includes("cancel");
            const isLate = train.delayMinutes > 0 && !isDiverted && !isCancelled;

            return (
              <div
                key={idx}
                className="py-2.5 px-2 flex items-center justify-between gap-2 hover:bg-slate-800/40 rounded-xl transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex flex-col items-center justify-center h-10 w-11 rounded-lg bg-slate-850 border border-slate-800 shrink-0 font-mono">
                    <span className="text-[11px] font-bold text-slate-100">{targetTime}</span>
                    <span className="text-[9px] text-slate-400">{train.type === "DEPARTURE" ? "DEP" : "ARR"}</span>
                  </div>

                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-100 text-xs truncate">
                        #{train.trainNumber} {train.trainName}
                      </span>
                      <span className="text-[10px] font-mono text-sky-300 bg-sky-950/70 border border-sky-800/60 px-1.5 py-0.2 rounded shrink-0">
                        {formatTimeUntil(targetTime, data.queryTimeIst)}
                      </span>
                      {isDepartingSoon && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-950/70 border border-amber-800/70 px-1 py-0.2 rounded shrink-0">
                          ⚡ Ready
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span>➔ {formatStationDisplay(train.destination)}</span>
                      {train.delayMinutes > 0 && train.scheduledTime !== targetTime && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          (Sched: {train.scheduledTime})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Platform & Status Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Platform</div>
                    <span className="inline-block font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      PF {train.expectedPlatform}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        isDiverted || isCancelled
                          ? "bg-rose-950/60 text-rose-300 border-rose-800/50"
                          : isLate
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                          : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                      }`}
                    >
                      {train.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

