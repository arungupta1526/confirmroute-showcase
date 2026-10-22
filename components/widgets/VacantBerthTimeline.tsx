"use client";

import React from "react";
import { Clock, Info, Sparkles, Building2, AlertTriangle } from "lucide-react";
import { formatChartTime } from "../../src/utils/berthHelper";
import { formatStationDisplay } from "./stationHelper";
import type { BoardingDepartureStatus } from "../../src/types";

interface VacantBerthTimelineProps {
  chartOneDate?: string | null;
  chartTwoDate?: string | null;
  remoteStation?: string | null;
  remoteStationName?: string | null;
  nextRemoteStation?: string | null;
  nextRemoteStationName?: string | null;
  boardingStation?: string | null;
  departureStatus?: BoardingDepartureStatus | null;
}

export const VacantBerthTimeline = React.memo(function VacantBerthTimeline({
  chartOneDate,
  chartTwoDate,
  remoteStation,
  remoteStationName,
  nextRemoteStation,
  nextRemoteStationName,
  boardingStation,
  departureStatus,
}: VacantBerthTimelineProps) {
  const isSecondChartFrozen = Boolean(chartTwoDate);

  return (
    <div className="rounded-lg bg-slate-900/80 border border-slate-800/90 p-2.5 space-y-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-semibold text-slate-300 border-b border-slate-800/70 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>IRCTC Charting Timeline & Booking Window</span>
        </div>
        {departureStatus?.hasDeparted ? (
          <span className="text-[10px] text-rose-300 font-mono bg-rose-950/70 border border-rose-800/60 px-1.5 py-0.5 rounded whitespace-nowrap">
            ⚠️ Train Passed
          </span>
        ) : isSecondChartFrozen ? (
          <span className="text-[10px] text-amber-300 font-mono bg-amber-950/70 border border-amber-800/60 px-1.5 py-0.5 rounded whitespace-nowrap">
            ⚡ Final Chart Frozen
          </span>
        ) : (
          <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded whitespace-nowrap">
            🎟️ Current Booking Open
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-start gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
          <div>
            <span className="text-slate-200 font-medium">1st Chart:</span>{" "}
            <span className="text-slate-400">
              {chartOneDate ? formatChartTime(chartOneDate) : "8–10h in advance"} (Current Booking opens on IRCTC).
            </span>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
          <div>
            <span className="text-slate-200 font-medium">Final 2nd Chart:</span>{" "}
            <span className="text-slate-400">
              {chartTwoDate
                ? `Frozen at ${formatChartTime(chartTwoDate)} (~15m before dep)`
                : "Freezes 15–30 min before departure (seats transfer to TTE Handheld)."}
            </span>
          </div>
        </div>
      </div>

      {/* Charting Remote Hub Info */}
      {remoteStation && (
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-sky-300 bg-sky-950/40 border border-sky-900/40 rounded px-2 py-1 leading-normal">
          <span className="inline-flex items-center gap-1 font-semibold text-sky-200 shrink-0">
            <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Charting Hub:</span>
          </span>
          <span className="font-medium text-sky-100">{formatStationDisplay(remoteStation, remoteStationName)}</span>
          {nextRemoteStation && nextRemoteStation !== remoteStation && (
            <span className="text-slate-400 inline-flex items-center gap-1">
              <span>➔ Next Hub:</span>
              <span className="text-slate-300">{formatStationDisplay(nextRemoteStation, nextRemoteStationName)}</span>
            </span>
          )}
        </div>
      )}

      {/* Train Already Departed Alert Callout */}
      {departureStatus?.hasDeparted && (
        <div className="flex items-start gap-2 text-[11px] text-amber-200 bg-amber-950/70 border border-amber-500/40 rounded-lg p-2.5 leading-relaxed">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5 flex-wrap">
              <span>⚠️ Train already departed from {formatStationDisplay(boardingStation)}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Departed {departureStatus.timeDiffText} ({departureStatus.scheduledDepartureTime})
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {departureStatus.lastPassedStationName && (
                <>Currently on track near <strong>{formatStationDisplay(departureStatus.lastPassedStationCode, departureStatus.lastPassedStationName)}</strong>. </>
              )}
              {departureStatus.nextUpcomingStationName && (
                <>Next upcoming boarding stop: <strong>{formatStationDisplay(departureStatus.nextUpcomingStationCode, departureStatus.nextUpcomingStationName)}</strong> ({departureStatus.nextUpcomingArrivalTime}). </>
              )}
              You cannot board at {formatStationDisplay(boardingStation)} now. The berths listed below are vacant for downstream segments ahead.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Action Callout */}
      {!departureStatus?.hasDeparted && (
        isSecondChartFrozen ? (
          <div className="flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-900/50 rounded-lg p-2 leading-relaxed">
            <Info className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
            <span>
              <strong>Final 2nd Chart is frozen (~15m before departure{remoteStation && remoteStation !== boardingStation ? ` from ${formatStationDisplay(remoteStation, remoteStationName)} Hub` : ""}).</strong> Online IRCTC booking is closed. Board the train and show these exact coach and berth numbers to the on-duty TTE for instant spot allotment.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-2 leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
            <span>
              <strong>Current Booking is OPEN on IRCTC!</strong> These berths can be booked directly on the IRCTC app/website at base fare with a 10% discount until the final 2nd chart freezes (15–30 min before departure).
            </span>
          </div>
        )
      )}
    </div>
  );
});

