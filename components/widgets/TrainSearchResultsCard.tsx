"use client";

import React from "react";
import { TrainFront, Radio, Route, Ticket, LayoutGrid, ArrowRight, Clock } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";

export interface TrainSearchResultItem {
  trainNumber: string;
  trainName: string;
  sourceCode?: string;
  sourceName?: string;
  destinationCode?: string;
  destinationName?: string;
  duration?: string;
}

interface Props {
  data: TrainSearchResultItem[] | { trains?: TrainSearchResultItem[] };
}

export const TrainSearchResultsCard = React.memo(function TrainSearchResultsCard({ data }: Props) {
  if (!data) return null;

  const trains: TrainSearchResultItem[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any).trains)
    ? (data as any).trains
    : [];

  if (trains.length === 0) return null;

  const handlePromptClick = (promptText: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("confirmroute:send-prompt", {
        detail: { prompt: promptText },
      })
    );
  };

  return (
    <div className="my-3 font-sans rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-xl shadow-black/30 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400">
            <TrainFront className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Matching Trains Found</h4>
            <p className="text-[11px] text-slate-400">
              {trains.length} {trains.length === 1 ? "train" : "trains"} matching your search query
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          Indian Railways
        </span>
      </div>

      {/* Train Cards List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {trains.map((train, idx) => {
          const hasRoute = Boolean(
            (train.sourceCode || train.sourceName) && (train.destinationCode || train.destinationName)
          );

          return (
            <div
              key={`${train.trainNumber}-${idx}`}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 space-y-2.5 hover:border-slate-700 transition"
            >
              {/* Train Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 shrink-0">
                    #{train.trainNumber}
                  </span>
                  <span className="font-semibold text-xs text-slate-100 truncate">
                    {train.trainName}
                  </span>
                </div>
              </div>

              {/* Friendly Station Route */}
              {hasRoute && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium py-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex-wrap sm:flex-nowrap">
                  <span className="text-slate-100 font-medium truncate">
                    {formatStationDisplay(train.sourceCode, train.sourceName)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mx-0.5" />
                  <span className="text-slate-100 font-medium truncate">
                    {formatStationDisplay(train.destinationCode, train.destinationName)}
                  </span>
                  {train.duration && (
                    <span className="text-[10px] text-slate-400 font-mono ml-auto shrink-0 flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {train.duration.includes(":")
                        ? `${train.duration.split(":")[0]}h ${train.duration.split(":")[1]}m`
                        : train.duration}
                    </span>
                  )}
                </div>
              )}

              {/* Quick 1-Tap Action Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => handlePromptClick(`Live status of ${train.trainNumber}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-800/80 hover:bg-sky-950 hover:text-sky-300 hover:border-sky-800/60 border border-slate-700/60 text-slate-300 transition cursor-pointer"
                >
                  <Radio className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>Live Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePromptClick(`Route and timetable of ${train.trainNumber}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-800/60 border border-slate-700/60 text-slate-300 transition cursor-pointer"
                >
                  <Route className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Route / Halts</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const seatPrompt = train.sourceCode && train.destinationCode
                      ? `Check seat availability for ${train.trainNumber} from ${train.sourceCode} to ${train.destinationCode}`
                      : `Check seat availability for ${train.trainNumber}`;
                    handlePromptClick(seatPrompt);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-800/80 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800/60 border border-slate-700/60 text-slate-300 transition cursor-pointer"
                >
                  <Ticket className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Seat Availability</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePromptClick(`Coach position of ${train.trainNumber}`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-800/80 hover:bg-amber-950 hover:text-amber-300 hover:border-amber-800/60 border border-slate-700/60 text-slate-300 transition cursor-pointer"
                >
                  <LayoutGrid className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Coach Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
