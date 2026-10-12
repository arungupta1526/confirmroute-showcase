"use client";

import React, { useEffect, useRef } from "react";
import { LiveRunningStatus } from "@/src/types";
import {
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Zap,
  Calendar,
} from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { LiveStationTimelineRow } from "./LiveStationTimelineRow";
import { LiveTrackRadarBanner } from "./LiveTrackRadarBanner";

interface Props {
  data: LiveRunningStatus;
}

export const LiveRunningStatusCard = React.memo(function LiveRunningStatusCard({ data }: Props) {
  const currentStationRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll internal timeline if the train is actively running or halted
    if (data?.doesRunToday === false || (data as any)?.journeyStatus === "NOT_RUNNING_TODAY") {
      return;
    }

    const container = timelineContainerRef.current;
    const target = currentStationRef.current;
    if (container && target) {
      // Container-scoped scroll: Never hijack outer chat page scroll
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({
        top: Math.max(0, offsetTop - container.clientHeight / 2 + targetRect.height / 2),
        behavior: "smooth",
      });
    }
  }, [data?.currentStationCode, data?.doesRunToday]);

  if (!data || !data.schedule || !Array.isArray(data.schedule)) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
        Running status data unavailable.
      </div>
    );
  }

  const isDelayed = (data.delayMinutes ?? 0) > 0;
  const telemetry = data.liveTelemetry;
  const congestion = data.congestion;

  const lastStop = data.schedule && data.schedule.length > 0 ? data.schedule[data.schedule.length - 1] : null;
  const routeDistance = (data as any).totalDistance || (lastStop && lastStop.distance && Number(lastStop.distance) > 0 ? lastStop.distance : null);
  const routeDuration = (data as any).totalDuration || (data as any).duration || null;

  return (
    <div className="my-3 font-sans space-y-3">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-400 font-mono text-xs font-bold border border-sky-800/50">
              #{data.trainNumber}
            </span>
            <h4 className="font-bold text-slate-100 text-base">{data.trainName}</h4>
          </div>
          <span className="text-xs text-slate-400">Date: {data.date}</span>
        </div>

        {/* Live Status Text & Telemetry Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {data.doesRunToday === false || (data as any).journeyStatus === "NOT_RUNNING_TODAY" ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/60">
              <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{data.statusText || `Train does not operate on ${data.date}. Runs on: ${data.runsOnDays?.join(", ") || "weekly schedule"}`}</span>
            </div>
          ) : data.statusText || (data as any).currentLocationSummary ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 bg-sky-950/40 px-3 py-1.5 rounded-lg border border-sky-900/50">
              <Navigation className="w-4 h-4 animate-pulse text-sky-400" />
              {(data as any).currentLocationSummary || data.statusText}
            </div>
          ) : null}

          {telemetry && (
            <div className="flex items-center gap-2 text-xs">
              {telemetry.speed > 0 && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-800/40"
                  title="Live RTIS GPS speed"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  {telemetry.speed} km/h
                </span>
              )}
              {telemetry.power && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-950/50 text-amber-300 font-medium border border-amber-800/40 text-[11px]">
                  <Zap className="w-3 h-3" />
                  {telemetry.power === "E" ? "Electric Loco" : "Diesel Loco"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Route, Duration, Distance and Delay */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              Route:{" "}
              <span className="text-slate-200 font-medium">
                {formatStationDisplay(data.sourceCode, data.sourceName)}
              </span>{" "}
              →{" "}
              <span className="text-slate-200 font-medium">
                {formatStationDisplay(data.destinationCode, data.destinationName)}
              </span>
            </span>
            {routeDuration && (
              <>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {routeDuration}
                </span>
              </>
            )}
            {routeDistance && (
              <>
                <span className="text-slate-600">·</span>
                <span>{routeDistance} km</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 font-semibold">
            {data.doesRunToday === false || (data as any).journeyStatus === "NOT_RUNNING_TODAY" ? (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] bg-amber-950/50 px-2.5 py-1 rounded border border-amber-800/50">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Does Not Run Today
              </span>
            ) : isDelayed ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Delayed by {data.delayMinutes} mins
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Running On Time
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Block Section & Crossing Intelligence Banner */}
      {congestion && <LiveTrackRadarBanner congestion={congestion} />}

      {/* Station Timeline */}
      <div ref={timelineContainerRef} className="max-h-[360px] overflow-y-auto pr-1 space-y-2">
        {(() => {
          const schedule = data.schedule;
          const currentStnCode = (data.currentStationCode || "").trim().toUpperCase();
          const upcomingMatch = data.upcomingStation?.match(/\(([A-Z0-9]+)\)/i);
          const targetUpcomingCode = upcomingMatch ? upcomingMatch[1].toUpperCase() : "";

          const isNotRunningToday = Boolean(
            data.doesRunToday === false ||
            (data as any).journeyStatus === "NOT_RUNNING_TODAY" ||
            data.statusText?.toLowerCase().includes("does not run on")
          );

          const isCompleted = !isNotRunningToday && Boolean(
            (data as any).isJourneyCompleted ||
            (data as any).journeyStatus === "COMPLETED" ||
            (data.currentStationCode &&
              data.destinationCode &&
              data.currentStationCode.trim().toUpperCase() === data.destinationCode.trim().toUpperCase()) ||
            data.statusText?.toLowerCase().includes("arrived at destination") ||
            data.statusText?.toLowerCase().includes("journey completed")
          );

          const isAtSource = !isNotRunningToday && !isCompleted && Boolean(
            (data as any).journeyStatus === "NOT_STARTED" ||
            data.statusText?.toLowerCase().includes("yet to start") ||
            (data.currentStationCode &&
              data.sourceCode &&
              data.currentStationCode.trim().toUpperCase() === data.sourceCode.trim().toUpperCase() &&
              (data.statusText?.toLowerCase().includes("currently at source") ||
                data.statusText?.toLowerCase().includes("not yet departed") ||
                data.statusText?.toLowerCase().includes("not departed")))
          );

          const currentIndex = !isNotRunningToday
            ? schedule.findIndex((s) => s.stationCode?.toUpperCase() === currentStnCode)
            : -1;

          const isCurrentHalted =
            !isNotRunningToday &&
            !isCompleted &&
            !isAtSource &&
            currentIndex !== -1 &&
            (schedule[currentIndex].isHalted === true || schedule[currentIndex].status === "ARRIVED") &&
            schedule[currentIndex].hasDeparted !== true &&
            schedule[currentIndex].status !== "DEPARTED";

          let upcomingIndex = -1;
          if (!isNotRunningToday && !isCompleted) {
            if (isAtSource) {
              upcomingIndex = schedule.length > 1 ? 1 : -1;
            } else if (isCurrentHalted) {
              upcomingIndex = currentIndex + 1 < schedule.length ? currentIndex + 1 : -1;
            } else if (targetUpcomingCode) {
              upcomingIndex = schedule.findIndex(
                (s) => s.stationCode?.toUpperCase() === targetUpcomingCode
              );
            }

            if (upcomingIndex === -1 && !isAtSource) {
              if (currentIndex !== -1) {
                upcomingIndex = currentIndex + 1 < schedule.length ? currentIndex + 1 : -1;
              } else {
                upcomingIndex = schedule.findIndex(
                  (s) => !s.hasDeparted && s.status !== "DEPARTED"
                );
              }
            }
          }

          const effectiveJourneyStatus: "RUNNING" | "COMPLETED" | "NOT_STARTED" | "NOT_RUNNING_TODAY" | "SCHEDULED" =
            isNotRunningToday
              ? "NOT_RUNNING_TODAY"
              : isCompleted
              ? "COMPLETED"
              : isAtSource
              ? "NOT_STARTED"
              : "RUNNING";

          return schedule.map((stn, idx) => {
            let isPassed = false;
            let isUpcoming = false;
            let isHalted = false;

            const isFirst = idx === 0;
            const isLast = idx === schedule.length - 1;
            const stationRole: "SOURCE" | "DESTINATION" | "INTERMEDIATE" = isFirst
              ? "SOURCE"
              : isLast
              ? "DESTINATION"
              : "INTERMEDIATE";

            if (isNotRunningToday) {
              isPassed = false;
              isUpcoming = false;
              isHalted = false;
            } else if (isCompleted) {
              isPassed = !isLast;
              isUpcoming = false;
              isHalted = false;
            } else if (isAtSource) {
              isPassed = false;
              isUpcoming = false;
              isHalted = false;
            } else {
              if (isCurrentHalted && idx === currentIndex) {
                isHalted = true;
              } else if (idx === upcomingIndex) {
                isUpcoming = true;
              } else if (
                stn.hasDeparted === true ||
                stn.status === "DEPARTED" ||
                (currentIndex !== -1 && idx < currentIndex) ||
                (upcomingIndex !== -1 && idx < upcomingIndex && (!isCurrentHalted || idx < currentIndex))
              ) {
                isPassed = true;
              }
            }

            const isScrollTarget = isUpcoming || (isHalted && upcomingIndex === -1);

            return (
              <LiveStationTimelineRow
                key={idx}
                stn={stn}
                isPassed={isPassed}
                isUpcoming={isUpcoming}
                isCurrentHalted={isHalted}
                stationRole={stationRole}
                journeyStatus={effectiveJourneyStatus}
                innerRef={isScrollTarget ? currentStationRef : undefined}
              />
            );
          });
        })()}
      </div>
    </div>
  );
});
