"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PnrStatusResult } from "@/src/types";
import { TrainFront, Clock, User, Star, Utensils, Calendar } from "lucide-react";
import { formatStationDisplay, formatDateWithWeekday } from "./stationHelper";
import { isPnrWatched, toggleWatchPnr, calculateChartingSchedule } from "@/src/utils/pnrWatchStore";
import { PnrStatusBadge, getStatusCategory } from "./pnr/PnrStatusBadge";
import { PnrCoachStrip } from "./pnr/PnrCoachStrip";
import { PnrActionFooter } from "./pnr/PnrActionFooter";
import { PnrHeader } from "./pnr/PnrHeader";

interface Props {
  data: PnrStatusResult;
}

export const PnrStatusCard = React.memo(function PnrStatusCard({ data }: Props) {
  if (!data || data.error) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
        {data?.error || "PNR status details unavailable."}
      </div>
    );
  }

  const {
    pnr,
    trainNumber,
    trainName,
    doj,
    fromStationCode,
    fromStationName,
    toStationCode,
    toStationName,
    boardingStationCode,
    boardingStationName,
    departureTime,
    arrivalTime,
    duration,
    distance,
    chartPrepared,
    passengers = [],
    travelClass,
    quota,
    expectedPlatformNo,
    coachPosition,
    informationMessage,
    bookingFare,
    ticketFare,
  } = data;

  const formattedDuration = useMemo(() => {
    if (!duration) return "";
    const match = duration.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return duration;
  }, [duration]);

  const formattedDistance = useMemo(() => {
    if (!distance && distance !== 0) return "";
    const num = typeof distance === "number" ? distance : parseFloat(String(distance).replace(/[^\d.]/g, ""));
    if (isNaN(num) || num <= 0) return typeof distance === "string" ? distance : "";
    return `${num.toLocaleString("en-IN")} km`;
  }, [distance]);

  const [isWatched, setIsWatched] = useState<boolean>(false);

  useEffect(() => {
    if (pnr) {
      setIsWatched(isPnrWatched(pnr));
    }
  }, [pnr]);

  const handleToggleWatch = () => {
    if (!pnr) return;
    const topStatus = passengers[0]?.currentStatus || passengers[0]?.bookingStatus;
    const watched = toggleWatchPnr({
      pnr,
      trainNumber,
      trainName,
      doj,
      fromStationCode,
      toStationCode,
      departureTime,
      status: topStatus,
      addedAt: new Date().toISOString(),
    });
    setIsWatched(watched);
  };

  const chartingSchedule = calculateChartingSchedule(departureTime, doj);

  // Extract assigned coaches from passenger statuses
  const assignedCoaches = useMemo(() => {
    return passengers.map((p) => p.coach).filter((c): c is string => Boolean(c));
  }, [passengers]);

  // Determine if any passenger is waitlisted or cancelled
  const isWaitlistOrCancelled = useMemo(() => {
    return passengers.some((p) => {
      const cat = getStatusCategory(p.currentStatus || p.bookingStatus, p.coach, p.berth);
      return cat === "WAITLIST" || cat === "CANCELLED";
    });
  }, [passengers]);

  const fareDisplay = ticketFare || bookingFare;
  const isDifferentBoarding = Boolean(boardingStationCode && fromStationCode && boardingStationCode !== fromStationCode);

  return (
    <div className="my-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header Bar */}
      <PnrHeader
        pnr={pnr}
        trainNumber={trainNumber}
        trainName={trainName}
        travelClass={travelClass}
        quota={quota}
        fareDisplay={fareDisplay}
        chartPrepared={chartPrepared}
        isWatched={isWatched}
        onToggleWatch={handleToggleWatch}
        informationMessage={informationMessage}
      />

      {/* Route & Timing details */}
      <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-800/60 text-center items-center">
        <div className="text-left">
          <div className="text-xs font-bold text-white leading-tight">
            {formatStationDisplay(fromStationCode, fromStationName)}
          </div>
          {isDifferentBoarding && (
            <div className="text-[10px] text-amber-400/90 mt-0.5">
              Boarding: {boardingStationName || boardingStationCode}
            </div>
          )}
          {departureTime && <div className="text-xs font-semibold text-sky-400 mt-1">{departureTime}</div>}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-[10px] text-slate-300 font-medium">
            {formatDateWithWeekday(doj) || doj}
          </div>
          <div className="w-full flex items-center gap-1 my-1">
            <div className="h-[1px] flex-1 bg-slate-800" />
            <TrainFront className="w-3 h-3 text-slate-600" />
            <div className="h-[1px] flex-1 bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium flex-wrap justify-center">
            {formattedDuration && <span className="text-sky-300 font-semibold">{formattedDuration}</span>}
            {formattedDuration && (formattedDistance || expectedPlatformNo) && <span className="text-slate-600">·</span>}
            {formattedDistance && <span className="text-slate-300">{formattedDistance}</span>}
            {formattedDistance && expectedPlatformNo && <span className="text-slate-600">·</span>}
            {expectedPlatformNo && <span>Plat: {expectedPlatformNo}</span>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-white leading-tight">
            {formatStationDisplay(toStationCode, toStationName)}
          </div>
          {arrivalTime && <div className="text-xs font-semibold text-sky-400 mt-1">{arrivalTime}</div>}
        </div>
      </div>

      {/* Train Intelligence Strip (Ratings, Booking Date, Pantry) */}
      {(data.ratings || data.bookingDate || data.hasPantry !== undefined) && (
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/40 flex items-center justify-between gap-2 text-[11px] text-slate-400 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {data.ratings && (
              <span className="inline-flex items-center gap-1 text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{data.ratings.overall || 4.0}</span>
                {data.ratings.cleanliness && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    · Clean: {data.ratings.cleanliness}
                  </span>
                )}
                {data.ratings.ratingCount && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({data.ratings.ratingCount.toLocaleString("en-IN")})
                  </span>
                )}
              </span>
            )}
            {data.hasPantry !== undefined && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                data.hasPantry
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  : "bg-slate-800/80 text-slate-400 border border-slate-700/40"
              }`}>
                <Utensils className="w-2.5 h-2.5" />
                <span>{data.hasPantry ? "Pantry Car Available" : "No Pantry Car"}</span>
              </span>
            )}
          </div>
          {data.bookingDate && (
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Booked on {data.bookingDate}</span>
            </div>
          )}
        </div>
      )}

      {/* Official Indian Railways Charting Schedule */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 flex items-start gap-2 text-xs">
        <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-200">Official Charting Timeline:</span>
            <span className="text-sky-300">1st Chart: {chartingSchedule.firstChartTime}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Final Chart: {chartingSchedule.finalChartTime}</span>
          </div>
          <p className="text-slate-400">{chartingSchedule.ruleExplanation}</p>
        </div>
      </div>

      {/* Passenger List */}
      <div className="p-4 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>Passengers ({passengers.length})</span>
        </div>

        <div className="space-y-2">
          {passengers.map((p, idx) => (
            <PnrStatusBadge key={p.number || idx} passenger={p} index={idx} />
          ))}
        </div>
      </div>

      {/* Mini Coach Layout Strip */}
      {coachPosition && (
        <PnrCoachStrip
          coachPosition={coachPosition}
          assignedCoaches={assignedCoaches}
          trainNumber={trainNumber}
        />
      )}

      {/* Quick Action Footer */}
      <PnrActionFooter
        trainNumber={trainNumber}
        fromStationCode={fromStationCode}
        toStationCode={toStationCode}
        isWaitlistOrCancelled={isWaitlistOrCancelled}
      />
    </div>
  );
});
