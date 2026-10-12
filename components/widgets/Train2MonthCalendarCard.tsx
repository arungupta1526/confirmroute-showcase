"use client";

import React from "react";
import { Train2MonthCalendar, TrainCalendarDayDetails } from "@/src/types";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { formatStationDisplay, formatDateWithWeekday, parseDateTimestamp } from "./stationHelper";

interface Props {
  data: Train2MonthCalendar;
}

export const Train2MonthCalendarCard = React.memo(function Train2MonthCalendarCard({ data }: Props) {
  if (!data || !data.days || typeof data.days !== "object") {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        60-day calendar trend data unavailable.
      </div>
    );
  }

  const dayEntries = React.useMemo(() => {
    return (Object.entries(data.days) as [string, TrainCalendarDayDetails][]).sort(
      ([dateA, infoA], [dateB, infoB]) => {
        const timeA = parseDateTimestamp(infoA?.date || dateA);
        const timeB = parseDateTimestamp(infoB?.date || dateB);
        return timeA - timeB;
      }
    );
  }, [data.days]);

  const bestDates = React.useMemo(() => {
    return dayEntries
      .filter(([_, info]) => {
        const s = String(info?.status || "").toUpperCase();
        return s.includes("AVL") || (info?.confirmChance != null && info.confirmChance >= 80);
      })
      .slice(0, 3);
  }, [dayEntries]);

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5 flex-wrap">
              <span>{data.trainNumber}</span>
              {data.trainName && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-sky-300 font-semibold">{data.trainName}</span>
                </>
              )}
              <span className="text-slate-500">·</span>
              <span>60-Day Availability Calendar</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {formatStationDisplay(data.source)} → {formatStationDisplay(data.destination)}
              {(data as any).duration && ` · ${(data as any).duration}`}
              {(data as any).distance && ` · ${(data as any).distance} km`}
              {" "}· Class: <span className="text-sky-400 font-semibold">{data.travelClass}</span> ({data.quota || "GN"})
            </div>
          </div>
        </div>
      </div>

      {/* Best Dates Recommendation Banner */}
      {bestDates.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs flex-wrap">
          <span className="text-emerald-400 font-semibold shrink-0">✨ Recommended Dates:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {bestDates.map(([dateStr, info], i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 text-[11px] font-medium">
                {formatDateWithWeekday(info?.date || dateStr)} ({info?.status || `${info?.confirmChance}%`})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {dayEntries.map(([dateStr, info], idx) => {
          const statusStr = String(info?.status || "").toUpperCase();
          const isNotAvailable =
            statusStr.includes("NOT AVAILABLE") ||
            statusStr.includes("REGRET") ||
            statusStr.includes("CANCEL") ||
            statusStr.includes("NOT_AVAILABLE");
          const isAvail =
            !isNotAvailable &&
            (statusStr.includes("AVL") ||
              statusStr.includes("AVAILABLE") ||
              statusStr.includes("CURR_AVBL"));
          const isRac = !isNotAvailable && statusStr.includes("RAC");
          const isWl = !isNotAvailable && statusStr.includes("WL");

          const pillBg = isAvail
            ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
            : isRac
            ? "bg-sky-950/70 border-sky-700/80 text-sky-300"
            : isWl
            ? "bg-amber-950/40 border-amber-900/60 text-amber-300"
            : isNotAvailable
            ? "bg-rose-950/30 border-rose-900/50 text-rose-400/90"
            : "bg-slate-900 border-slate-800 text-slate-400";

          const isFastFilling = info?.gradient && String(info.gradient).toLowerCase().includes("high");

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition ${pillBg}`}
            >
              <div className="font-semibold text-slate-200 text-[11px]">
                {formatDateWithWeekday(info?.date || dateStr)}
              </div>
              <div className="font-bold text-xs mt-1 truncate">{info?.status || "Check"}</div>
              {isFastFilling && (
                <span className="text-[9px] text-amber-300 font-bold bg-amber-950/80 border border-amber-800/60 px-1 py-0.5 rounded mt-1 inline-block">
                  🔥 Fast Filling
                </span>
              )}
              {info?.confirmChance != null && info.confirmChance > 0 && !isFastFilling && (
                <div className="text-[10px] mt-1 text-sky-400 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{info.confirmChance}% Confirm</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
