"use client";

import React from "react";
import { AvailabilityCalendar } from "@/src/types";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatStationDisplay, formatDateWithWeekday, parseDateTimestamp } from "./stationHelper";

interface Props {
  data: AvailabilityCalendar;
}

export const AvailabilityCalendarCard = React.memo(function AvailabilityCalendarCard({ data }: Props) {
  if (!data || !data.availability || !Array.isArray(data.availability)) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
        Calendar data unavailable.
      </div>
    );
  }

  const daysList = React.useMemo(() => {
    return [...data.availability].sort(
      (a, b) => parseDateTimestamp(a.date) - parseDateTimestamp(b.date)
    );
  }, [data.availability]);

  return (
    <div className="my-3 font-sans space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-md shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-semibold text-slate-400 flex-wrap gap-1">
        <span className="flex items-center gap-1.5 text-sky-400">
          <CalendarIcon className="w-4 h-4 text-sky-400" />
          Availability Calendar ({formatStationDisplay(data.source)} → {formatStationDisplay(data.destination)}
          {(data as any).duration && ` · ${(data as any).duration}`}
          {(data as any).distance && ` · ${(data as any).distance} km`})
        </span>
        <span>Start: {formatDateWithWeekday(data.startDate) || data.startDate}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
        {daysList.map((day, idx) => {
          const state = typeof day.state === "string" ? day.state : String(day.state || "Unknown");
          const stateLower = state.toLowerCase();
          const isNotAvail =
            stateLower.includes("not avail") ||
            stateLower.includes("regret") ||
            stateLower.includes("cancel");
          const isAvail = !isNotAvail && stateLower.includes("avail");
          const isFast = stateLower.includes("fast");
          const isFew = stateLower.includes("few");

          // UX-7: Color-coded availability state classes
          const bgStyle = isAvail
            ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
            : isFast
            ? "bg-amber-950/60 border-amber-800/60 text-amber-300"
            : isFew
            ? "bg-orange-950/60 border-orange-800/60 text-orange-300"
            : isNotAvail
            ? "bg-rose-950/30 border-rose-900/50 text-rose-400/90"
            : "bg-slate-900 border-slate-800 text-slate-400";

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition ${bgStyle}`}
            >
              <div className="font-semibold text-slate-200">{formatDateWithWeekday(day.date)}</div>
              <div className="text-[11px] font-bold mt-1.5">{state}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
