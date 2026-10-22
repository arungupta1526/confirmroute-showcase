"use client";

import React from "react";
import { CheckCircle2, XCircle, Clock, MapPin, Route, AlertTriangle } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";

export interface StoppageData {
  trainNumber?: string;
  trainName?: string;
  queriedStation?: string;
  resolvedStationCode?: string;
  stopsHere?: boolean;
  haltDetails?: {
    stopNumber?: number;
    stationName?: string;
    stationCode?: string;
    arrivalTime?: string;
    departureTime?: string;
    haltMinutes?: string;
    day?: number;
    distanceKm?: number;
    expectedPlatformNo?: string;
  } | null;
  totalStops?: number;
  origin?: string;
  destination?: string;
  error?: string;
}

interface Props {
  data: StoppageData;
}

export const StationStoppageCard = React.memo(function StationStoppageCard({ data }: Props) {
  if (!data) return null;

  const {
    trainNumber,
    trainName,
    queriedStation,
    resolvedStationCode,
    stopsHere,
    haltDetails,
    totalStops,
    origin,
    destination,
    error,
  } = data;

  const stnCode = resolvedStationCode || queriedStation || "";
  const haltMinNum = haltDetails?.haltMinutes ? parseInt(haltDetails.haltMinutes, 10) : 0;
  const isShortHalt = stopsHere && !isNaN(haltMinNum) && haltMinNum > 0 && haltMinNum <= 2;

  return (
    <div className="my-3 font-sans rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-xl shadow-black/30 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              stopsHere
                ? "bg-emerald-950/70 border-emerald-700/50 text-emerald-400"
                : "bg-rose-950/70 border-rose-800/50 text-rose-400"
            }`}
          >
            {stopsHere ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100 flex-wrap">
              <span className="font-mono text-base font-bold text-sky-300">#{trainNumber}</span>
              {trainName && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="truncate max-w-[170px] xs:max-w-[220px] sm:max-w-[300px] text-slate-200">
                    {trainName}
                  </span>
                </>
              )}
            </div>
            {(origin || destination) && (
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Route className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="inline-flex items-center gap-1 flex-wrap">
                  <span>{origin}</span>
                  <span className="text-slate-500">→</span>
                  <span>{destination}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Halt Confirmation Badge */}
        <div className="text-right shrink-0">
          {stopsHere ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Confirmed Halt
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 rounded-full whitespace-nowrap">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              No Stoppage
            </span>
          )}
        </div>
      </div>

      {/* Main Stoppage Details or Non-Stop Notice */}
      {stopsHere && haltDetails ? (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Queried Station</div>
              <div className="font-bold text-sm text-slate-100 mt-0.5">
                {formatStationDisplay(stnCode, haltDetails.stationName)}
              </div>
              {haltDetails.distanceKm !== undefined && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {haltDetails.distanceKm} km from origin
                  {haltDetails.stopNumber && totalStops && ` · Stop #${haltDetails.stopNumber} of ${totalStops}`}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Arrival</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  {formatDualTime(haltDetails.arrivalTime)}
                </div>
              </div>

              <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Halt</div>
                <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {haltDetails.haltMinutes || "-"}
                </div>
              </div>

              <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Departure</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  {formatDualTime(haltDetails.departureTime)}
                </div>
              </div>

              {haltDetails.expectedPlatformNo && (
                <div className="text-center px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/50">
                  <div className="text-[10px] uppercase font-bold text-amber-400">Platform</div>
                  <div className="text-xs font-bold font-mono text-amber-300 mt-0.5">
                    PF {haltDetails.expectedPlatformNo}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Short halt luggage advisory alert */}
          {isShortHalt && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Short {haltDetails.haltMinutes} Halt:</strong> Please assemble near the coach exit doors in advance with all luggage.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300">
          <p className="font-semibold text-rose-200">
            Train #{trainNumber} {trainName || ""} does NOT halt at {formatStationDisplay(stnCode)}.
          </p>
          <p className="text-[11px] text-rose-400/80 mt-1">
            This train passes through without a commercial or technical passenger stop. Please check nearby alternate stations or connecting trains.
          </p>
        </div>
      )}
    </div>
  );
});
