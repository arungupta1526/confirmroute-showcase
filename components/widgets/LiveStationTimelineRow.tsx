"use client";

import React from "react";
import { MapPin, Check } from "lucide-react";
import { LiveStationStatus } from "@/src/types";
import { formatStationDisplay } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";

export interface LiveStationTimelineRowProps {
  stn: LiveStationStatus;
  isPassed: boolean;
  isUpcoming: boolean;
  isCurrentHalted: boolean;
  stationRole?: "SOURCE" | "DESTINATION" | "INTERMEDIATE";
  journeyStatus?: "RUNNING" | "COMPLETED" | "NOT_STARTED" | "NOT_RUNNING_TODAY" | "SCHEDULED";
  innerRef?: React.Ref<HTMLDivElement>;
}

export const LiveStationTimelineRow = React.memo(function LiveStationTimelineRow({
  stn,
  isPassed,
  isUpcoming,
  isCurrentHalted,
  stationRole = "INTERMEDIATE",
  journeyStatus = "RUNNING",
  innerRef,
}: LiveStationTimelineRowProps) {
  const isSource = stationRole === "SOURCE";
  const isDestination = stationRole === "DESTINATION";
  const isNotRunningToday = journeyStatus === "NOT_RUNNING_TODAY";
  const isJourneyCompleted = journeyStatus === "COMPLETED";
  const isYetToStart = journeyStatus === "NOT_STARTED";

  return (
    <div
      ref={innerRef}
      className={`p-3 rounded-lg border text-xs flex items-center justify-between transition ${
        isNotRunningToday
          ? "bg-slate-900/40 border-slate-800/60 text-slate-400"
          : isJourneyCompleted
          ? isDestination
            ? "bg-emerald-950/40 border-emerald-600/70 shadow-md shadow-emerald-950/40 text-slate-200"
            : "bg-slate-900/40 border-slate-800/60 text-slate-300"
          : isCurrentHalted
          ? "bg-sky-950/70 border-sky-600/80 shadow-md shadow-sky-950/50"
          : isUpcoming
          ? "bg-emerald-950/30 border-emerald-600/70 shadow-md shadow-emerald-950/40"
          : isPassed
          ? "bg-slate-900/40 border-slate-800/60 text-slate-300"
          : "bg-slate-900/60 border-slate-800/80 text-slate-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          {isNotRunningToday ? (
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700/80 border border-slate-600/60" />
          ) : isJourneyCompleted ? (
            <div
              className="w-4 h-4 rounded-full bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center shadow-sm shadow-emerald-950/50"
              title={isDestination ? "Journey Completed" : "Passed Station"}
            >
              <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
            </div>
          ) : isCurrentHalted ? (
            <MapPin className="w-4 h-4 text-sky-400 animate-bounce" />
          ) : isUpcoming ? (
            <div className="relative flex h-4 w-4 items-center justify-center" title="Next Approaching Stop">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-lg shadow-emerald-400/90 border border-emerald-200 animate-pulse" />
            </div>
          ) : isPassed ? (
            <div
              className="w-4 h-4 rounded-full bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center shadow-sm shadow-emerald-950/50"
              title="Passed Station"
            >
              <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
            </div>
          ) : isYetToStart && isSource ? (
            <div className="w-3 h-3 rounded-full bg-sky-900 border border-sky-400/80" title="Starting Station" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700/80 border border-slate-600/60" />
          )}
        </div>

        <div>
          <div className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
            {formatStationDisplay(stn.stationCode, stn.stationName)}
            {stn.day != null && stn.day > 1 && (
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded">
                Day {stn.day}
              </span>
            )}

            {/* Contextual Badges based on Journey Status */}
            {isNotRunningToday ? (
              isSource ? (
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold px-1.5 py-0.5 rounded">
                  SOURCE
                </span>
              ) : isDestination ? (
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold px-1.5 py-0.5 rounded">
                  DESTINATION
                </span>
              ) : null
            ) : isJourneyCompleted ? (
              isDestination ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/80 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  REACHED DESTINATION
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800/80 text-emerald-400/90 font-medium px-1.5 py-0.2 rounded border border-emerald-950">
                  Passed
                </span>
              )
            ) : isYetToStart ? (
              isSource ? (
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-600/80 font-bold px-1.5 py-0.5 rounded">
                  SOURCE (YET TO START)
                </span>
              ) : isDestination ? (
                <span className="text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700 font-medium px-1.5 py-0.2 rounded">
                  DESTINATION
                </span>
              ) : null
            ) : (
              <>
                {isCurrentHalted && (
                  <span className="text-[10px] bg-sky-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                    CURRENT LOCATION (HALTED)
                  </span>
                )}
                {isUpcoming && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/80 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    NEXT STOP
                  </span>
                )}
                {isPassed && (
                  <span className="text-[10px] bg-slate-800/80 text-emerald-400/90 font-medium px-1.5 py-0.2 rounded border border-emerald-950">
                    Passed
                  </span>
                )}
                {isDestination && !isPassed && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-medium px-1.5 py-0.2 rounded">
                    DESTINATION
                  </span>
                )}
              </>
            )}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
            <span>Arr: {stn.arrivalTime ? formatDualTime(stn.arrivalTime) : "Starts"}</span>
            <span>•</span>
            <span>Dep: {stn.departureTime ? formatDualTime(stn.departureTime) : "Ends"}</span>
            {stn.haltMinutes && stn.haltMinutes !== "-" && (
              <>
                <span>•</span>
                <span>Halt: {stn.haltMinutes}m</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        {stn.expectedPlatformNo && (
          <div className="text-[11px] text-slate-300 font-semibold">
            PF #{stn.expectedPlatformNo}
          </div>
        )}
        {stn.arrivalDelay &&
          stn.arrivalDelay !== "-" &&
          stn.arrivalDelay !== "0" &&
          !Number.isNaN(Number(stn.arrivalDelay)) &&
          Number(stn.arrivalDelay) > 0 && (
            <div className="text-[10px] text-amber-400 font-medium">
              +{stn.arrivalDelay}m late
            </div>
          )}
        {stn.arrivalDelay &&
          stn.arrivalDelay !== "-" &&
          !Number.isNaN(Number(stn.arrivalDelay)) &&
          Number(stn.arrivalDelay) < 0 && (
            <div className="text-[10px] text-emerald-400 font-medium">
              {Math.abs(Number(stn.arrivalDelay))}m early
            </div>
          )}
      </div>
    </div>
  );
});
