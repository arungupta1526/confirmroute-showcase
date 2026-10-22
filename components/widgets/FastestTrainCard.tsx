"use client";

import React from "react";
import { Zap, Clock, Trophy, ArrowRight, Gauge } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";

export interface FastestTrainItem {
  trainNumber: string;
  trainName: string;
  trainType?: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string;
  distance?: number;
  fromStnCode: string;
  fromStnName?: string;
  toStnCode: string;
  toStnName?: string;
  timeSavedVersusSlowest?: string;
}

export interface FastestTrainResult {
  source: string;
  destination: string;
  date?: string;
  totalTrainsAnalyzed?: number;
  fastestTrain?: FastestTrainItem;
  topFastestTrains?: FastestTrainItem[];
}

interface Props {
  data: FastestTrainResult;
}

export const FastestTrainCard = React.memo(function FastestTrainCard({ data }: Props) {
  if (!data || !data.fastestTrain) return null;

  const { fastestTrain, topFastestTrains = [], source, destination, totalTrainsAnalyzed } = data;

  // Calculate average speed of the fastest train if distance is available
  const avgSpeed =
    fastestTrain.distance && fastestTrain.durationMinutes > 0
      ? Math.round((fastestTrain.distance / fastestTrain.durationMinutes) * 60)
      : null;

  const handleCheckSeats = (trainNo: string, fromCode?: string, toCode?: string) => {
    if (!trainNo) return;
    const orig = fromCode || fastestTrain.fromStnCode || source || "";
    const dest = toCode || fastestTrain.toStnCode || destination || "";
    const prompt = `Seat availability for ${trainNo}${orig && dest ? ` from ${orig} to ${dest}` : ""}`;
    window.dispatchEvent(
      new CustomEvent("confirmroute:send-prompt", {
        detail: { prompt },
      })
    );
  };

  return (
    <div className="my-3 font-sans rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 space-y-4 shadow-2xl shadow-black/40 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-slate-100 inline-flex items-center gap-1 flex-wrap">
                <span>Speed Champion:</span>
                <span>{formatStationDisplay(source)}</span>
                <span className="text-slate-500">→</span>
                <span>{formatStationDisplay(destination)}</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 shrink-0 whitespace-nowrap">
                Fastest Journey
              </span>
            </div>
            {totalTrainsAnalyzed && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Analyzed across all {totalTrainsAnalyzed} direct trains on this corridor
              </p>
            )}
          </div>
        </div>
      </div>

      {/* #1 Fastest Hero Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/60 border border-amber-500/40 space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
              #1 FASTEST
            </span>
            <span className="font-mono font-bold text-sm text-sky-300">
              #{fastestTrain.trainNumber}
            </span>
            <span className="font-bold text-sm text-slate-100">{fastestTrain.trainName}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{fastestTrain.durationFormatted}</span>
          </div>
        </div>

        {/* Departure -> Arrival Strip */}
        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-100">{formatDualTime(fastestTrain.departureTime)}</div>
            <div className="text-[11px] text-slate-400">
              {formatStationDisplay(fastestTrain.fromStnCode, fastestTrain.fromStnName)}
            </div>
          </div>

          <div className="flex flex-col items-center px-2">
            <div className="w-16 sm:w-24 h-0.5 bg-slate-700 relative my-1 flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 absolute" />
            </div>
            {fastestTrain.distance && (
              <span className="text-[10px] text-slate-500">{fastestTrain.distance} km</span>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm sm:text-base font-bold text-slate-100">{formatDualTime(fastestTrain.arrivalTime)}</div>
            <div className="text-[11px] text-slate-400">
              {formatStationDisplay(fastestTrain.toStnCode, fastestTrain.toStnName)}
            </div>
          </div>
        </div>

        {/* Speed & Time Saved Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {fastestTrain.timeSavedVersusSlowest && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Saves {fastestTrain.timeSavedVersusSlowest} over slowest train
              </span>
            )}
            {avgSpeed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                Avg Speed: {avgSpeed} km/h
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleCheckSeats(fastestTrain.trainNumber, fastestTrain.fromStnCode, fastestTrain.toStnCode)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition active:scale-95 cursor-pointer"
          >
            Check Seats →
          </button>
        </div>
      </div>

      {/* Top 5 Speed Leaderboard Table */}
      {topFastestTrains.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Top Speed Leaderboard on this Route</span>
          </div>

          <div className="divide-y divide-slate-800/70 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden text-xs">
            {topFastestTrains.slice(0, 5).map((train, idx) => (
              <div
                key={`${train.trainNumber}-${idx}`}
                onClick={() => handleCheckSeats(train.trainNumber, train.fromStnCode, train.toStnCode)}
                className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/50 transition cursor-pointer group"
                title={`Check seats for ${train.trainName} (${train.trainNumber})`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-[11px] text-slate-400 w-4 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200 text-xs truncate group-hover:text-amber-300 transition">
                      <span className="font-mono text-sky-300 mr-1">#{train.trainNumber}</span>
                      {train.trainName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formatDualTime(train.departureTime)} ({train.fromStnCode}) ➔ {formatDualTime(train.arrivalTime)} ({train.toStnCode})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="font-bold text-amber-300 font-mono text-xs">
                    {train.durationFormatted}
                  </span>
                  <span className="text-[10px] text-sky-400 group-hover:text-sky-300 font-medium px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 transition hidden sm:inline-block">
                    Seats →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
