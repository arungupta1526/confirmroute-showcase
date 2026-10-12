"use client";

import React from "react";
import { Train } from "@/src/types";
import { Clock, ArrowRight, ShieldCheck, AlertCircle, Utensils } from "lucide-react";
import { formatStationDisplay, parseRunningDays } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";
import { sortAvailabilityByClassHierarchy } from "@/src/utils/shareRouteHelper";
import { resolveTrainCategory } from "./trainCategoryHelper";


interface TrainCardItemProps {
  train: Train;
  isDeparted?: boolean;
  isNextUpcoming?: boolean;
}

export const TrainCardItem = React.memo(function TrainCardItem({
  train,
  isDeparted = false,
  isNextUpcoming = false,
}: TrainCardItemProps) {
  const isPassingTrain =
    train.trainOriginCode &&
    train.fromStnCode &&
    train.trainOriginCode.toUpperCase() !== train.fromStnCode.toUpperCase();

  const effectiveDeparted = isDeparted || Boolean(train.hasDeparted);
  const trainTypeLabel = resolveTrainCategory(train.trainNumber, train.trainName, train.trainType);

  return (
    <div
      className={`p-4 rounded-xl border transition shadow-lg space-y-3 ${
        effectiveDeparted
          ? "bg-slate-900/50 border-slate-800/60 opacity-75 hover:opacity-100"
          : isNextUpcoming
          ? "bg-slate-900/90 border-sky-500/50 ring-1 ring-sky-500/30 hover:border-sky-400"
          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Header: Train Number & Name */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                effectiveDeparted
                  ? "bg-slate-800 text-slate-400 border-slate-700"
                  : "bg-sky-950 text-sky-400 border-sky-800/50"
              }`}
            >
              #{train.trainNumber}
            </span>
            <h4 className="font-semibold text-slate-100 text-sm">{train.trainName}</h4>
            {effectiveDeparted && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60">
                Departed
              </span>
            )}
            {isNextUpcoming && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800/60 animate-pulse">
                Next Upcoming
              </span>
            )}
            {train.isTejas && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                ✨ Tejas Smart
              </span>
            )}
            {train.hasPantry && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                <Utensils className="w-2.5 h-2.5" /> Pantry
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {trainTypeLabel && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700/80">
                {trainTypeLabel}
              </span>
            )}
            {isPassingTrain && (
              <span className="text-[10px] text-slate-500 font-medium italic">
                (Starts from {train.trainOriginName || train.trainOriginCode})
              </span>
            )}
            {train.runningDays && (
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] text-slate-500 mr-0.5">Runs:</span>
                {parseRunningDays(train.runningDays).map((day, dIdx) => (
                  <span
                    key={dIdx}
                    title={day.fullName}
                    className={`w-3.5 h-3.5 flex items-center justify-center rounded text-[8px] font-bold ${
                      day.runs
                        ? "bg-sky-950 text-sky-300 border border-sky-800/50"
                        : "text-slate-600 bg-slate-900/40"
                    }`}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {train.trainRating != null && !isNaN(Number(train.trainRating)) && (
          <div className="flex items-center gap-1 bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded text-xs border border-amber-800/40 shrink-0">
            ★ {Number(train.trainRating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Departure / Duration / Arrival */}
      <div className="flex items-center justify-between text-xs py-1">
        <div className="max-w-[155px] sm:max-w-[200px]">
          <div
            className={`text-sm sm:text-base font-bold ${
              isDeparted ? "text-slate-400" : "text-slate-100"
            }`}
          >
            {formatDualTime(train.departureTime)}
          </div>
          <div className="text-slate-300 font-medium text-[11px] truncate">
            {formatStationDisplay(train.fromStnCode, train.fromStnName)}
          </div>
        </div>

        <div className="flex flex-col items-center px-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {train.durationFormatted || train.duration || "Direct"}
          </span>
          <div className="w-16 sm:w-20 h-0.5 bg-slate-800 relative my-1 flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5 text-sky-400 absolute" />
          </div>
          {train.distance && <span className="text-[10px] text-slate-500">{train.distance} km</span>}
        </div>

        <div className="text-right max-w-[155px] sm:max-w-[200px]">
          <div className="text-sm sm:text-base font-bold text-slate-100">
            {formatDualTime(train.arrivalTime)}
          </div>
          <div className="text-slate-300 font-medium text-[11px] truncate">
            {formatStationDisplay(train.toStnCode, train.toStnName)}
          </div>
        </div>
      </div>

      {/* Seat Availability Pills */}
      {Array.isArray(train.availability) && train.availability.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {sortAvailabilityByClassHierarchy(train.availability).map((avail, idx) => {
            const statusStr = String(avail.status || "").toUpperCase();
            const isNotAvailable =
              statusStr.includes("NOT AVAILABLE") ||
              statusStr.includes("REGRET") ||
              statusStr.includes("CANCEL") ||
              statusStr.includes("NOT_AVAILABLE");
            const isAvailable =
              !isNotAvailable &&
              (statusStr.startsWith("AVL") ||
                statusStr.includes("AVAILABLE") ||
                statusStr.includes("CURR_AVBL") ||
                (avail.seats ?? 0) > 0);
            const isRAC =
              !isNotAvailable &&
              (statusStr.startsWith("RAC") || statusStr.includes("RAC"));
            const isWL =
              !isNotAvailable &&
              !isRAC &&
              (statusStr.startsWith("WL") || statusStr.includes("WL"));
            const bgStyle = isDeparted
              ? "bg-slate-900/60 border-slate-800 text-slate-400"
              : isAvailable
              ? "bg-emerald-950/50 border-emerald-800/60 text-emerald-300"
              : isRAC
              ? "bg-sky-950/60 border-sky-800/70 text-sky-300"
              : isWL
              ? "bg-amber-950/50 border-amber-800/60 text-amber-300"
              : isNotAvailable
              ? "bg-rose-950/30 border-rose-900/50 text-rose-400/90"
              : "bg-slate-900 border-slate-800 text-slate-400";

            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${bgStyle}`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{avail.travelClass}</span>
                  {avail.fare != null && <span className="text-slate-200">₹{avail.fare}</span>}
                </div>

                <div className="text-[11px] font-semibold mt-1">{avail.status || "Check"}</div>

                {avail.confirmChance != null && avail.confirmChance > 0 && !isDeparted && (
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    {avail.confirmChance > 70 ? (
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                    )}
                    {avail.confirmChance}% Chance
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fallback Class Badges when availability array is omitted (e.g. filter_trains_by_time_window) */}
      {(!Array.isArray(train.availability) || train.availability.length === 0) &&
        Array.isArray((train as any).classes) &&
        (train as any).classes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500 mr-0.5">Classes Available:</span>
            {(train as any).classes.map((cls: string, cIdx: number) => (
              <span
                key={cIdx}
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-sky-300 border border-slate-800"
              >
                {cls}
              </span>
            ))}
          </div>
        )}
    </div>
  );
});
