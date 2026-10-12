"use client";

import React from "react";
import { IndianRupee, Zap, TrendingDown, Clock } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";

interface TrainFareItem {
  trainNumber: string;
  trainName: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  durationFormatted?: string;
  distance?: number | null;
  fare?: number;
  minFare?: number;
  classType?: string;
  allFares?: Record<string, number>;
  faresByClass?: Record<string, { fare: number; status: string }>;
}

interface Props {
  data: {
    source?: string;
    destination?: string;
    date?: string;
    distance?: number | null;
    requestedClass?: string | null;
    filterClass?: string | null;
    cheapestTrain?: TrainFareItem | null;
    cheapestOption?: TrainFareItem | null;
    fastestTrain?: TrainFareItem | null;
    fastestOption?: TrainFareItem | null;
    trains?: TrainFareItem[];
    comparison?: TrainFareItem[];
    topFastestTrains?: TrainFareItem[];
    message?: string;
  };
}

export const FareComparisonCard = React.memo(function FareComparisonCard({ data }: Props) {
  const cheapest = data?.cheapestTrain || data?.cheapestOption || null;
  const fastest = data?.fastestTrain || data?.fastestOption || null;
  const rawTrains = data?.trains || data?.comparison || data?.topFastestTrains || [];
  const trains: TrainFareItem[] = Array.isArray(rawTrains) ? rawTrains : [];

  if (!data || (!trains.length && !cheapest && !fastest)) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        {data?.message || "Fare comparison data unavailable."}
      </div>
    );
  }

  const routeDistance =
    data.distance || cheapest?.distance || fastest?.distance || trains[0]?.distance || null;
  const activeClass = data.requestedClass || (data.filterClass !== "ALL" ? data.filterClass : null);

  const handleCheckSeats = (trainNo: string) => {
    if (!trainNo) return;
    const dest = data.destination || "";
    const orig = data.source || "";
    const cls = activeClass ? ` in ${activeClass}` : "";
    const prompt = `Seat availability for train ${trainNo}${orig && dest ? ` from ${orig} to ${dest}` : ""}${cls}`;
    window.dispatchEvent(
      new CustomEvent("confirmroute:send-prompt", {
        detail: { prompt },
      })
    );
  };

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <span>Train Fare Comparison</span>
            {activeClass && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                Class: {activeClass}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {formatStationDisplay(data.source || "")} → {formatStationDisplay(data.destination || "")}
            {data.date && ` · ${data.date}`}
            {routeDistance ? ` · ${routeDistance} km` : ""}
          </div>
        </div>
      </div>

      {/* Top Highlights (Cheapest vs Fastest) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cheapest && (
          <div
            onClick={() => handleCheckSeats(cheapest.trainNumber)}
            className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 hover:border-emerald-700/70 hover:bg-emerald-950/30 transition-all cursor-pointer space-y-1 group"
            title={`Check seats for ${cheapest.trainNumber} · ${cheapest.trainName}`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Cheapest Option
              </span>
              <span className="text-emerald-300 font-bold text-sm">
                ₹{cheapest.fare ?? cheapest.minFare ?? "N/A"}
              </span>
            </div>
            <div className="font-medium text-xs text-slate-200 group-hover:text-emerald-200 transition-colors truncate">
              {cheapest.trainNumber} · {cheapest.trainName}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {(cheapest.duration || cheapest.durationFormatted) && (
                  <span>{cheapest.duration || cheapest.durationFormatted}</span>
                )}
                {cheapest.distance && (
                  <>
                    <span>·</span>
                    <span>{cheapest.distance} km</span>
                  </>
                )}
                {cheapest.departureTime && (
                  <>
                    <span>·</span>
                    <span>Dep: {formatDualTime(cheapest.departureTime)}</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-emerald-400/80 group-hover:text-emerald-300 font-medium">Check Seats →</span>
            </div>
          </div>
        )}

        {fastest && (
          <div
            onClick={() => handleCheckSeats(fastest.trainNumber)}
            className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 hover:border-sky-700/70 hover:bg-sky-950/30 transition-all cursor-pointer space-y-1 group"
            title={`Check seats for ${fastest.trainNumber} · ${fastest.trainName}`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Fastest Option
              </span>
              <span className="text-sky-300 font-bold text-xs">
                {fastest.duration || fastest.durationFormatted || "Quickest"}
              </span>
            </div>
            <div className="font-medium text-xs text-slate-200 group-hover:text-sky-200 transition-colors truncate">
              {fastest.trainNumber} · {fastest.trainName}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {(fastest.fare != null || fastest.minFare != null) && (
                  <span>₹{fastest.fare ?? fastest.minFare}</span>
                )}
                {fastest.distance && (
                  <>
                    <span>·</span>
                    <span>{fastest.distance} km</span>
                  </>
                )}
                {fastest.departureTime && (
                  <>
                    <span>·</span>
                    <span>Dep: {formatDualTime(fastest.departureTime)}</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-sky-400/80 group-hover:text-sky-300 font-medium">Check Seats →</span>
            </div>
          </div>
        )}
      </div>

      {/* Train List / Fare Matrix */}
      {trains.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>All Options on Route</span>
            <span className="text-[10px] text-slate-500 font-normal lowercase">tap train to check seats</span>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {trains.slice(0, 10).map((t, idx) => {
              const displayFare = t.fare ?? t.minFare;
              const displayDuration = t.duration || t.durationFormatted;
              return (
                <div
                  key={idx}
                  onClick={() => handleCheckSeats(t.trainNumber)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group text-xs"
                  title={`Click to check seat availability for ${t.trainNumber}`}
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                      <span>{t.trainNumber}</span> · {t.trainName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {t.departureTime && t.arrivalTime && (
                        <span>{formatDualTime(t.departureTime)} → {formatDualTime(t.arrivalTime)}</span>
                      )}
                      {(displayDuration || t.distance) && (
                        <span>({displayDuration || ""}{displayDuration && t.distance ? " · " : ""}{t.distance ? `${t.distance} km` : ""})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    {displayFare != null ? (
                      <span className="font-bold text-emerald-400 text-sm">₹{displayFare}</span>
                    ) : t.allFares && typeof t.allFares === "object" ? (
                      <div className="flex gap-1">
                        {Object.entries(t.allFares).slice(0, 3).map(([cls, fare]) => (
                          <span key={cls} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {cls}: ₹{fare}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">Check</span>
                    )}
                    <span className="text-[9px] text-slate-500 group-hover:text-sky-400 transition-colors">Seats →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
