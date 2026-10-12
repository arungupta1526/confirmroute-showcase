"use client";

import React, { useState } from "react";
import { TrainSchedule, TrainScheduleDetailed, ScheduleStation, DetailedScheduleStation } from "@/src/types";
import { Clock, MapPin, Route, ChevronDown, ChevronUp, Utensils, Star } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";

interface Props {
  data: TrainSchedule | TrainScheduleDetailed;
}

export const TrainScheduleCard = React.memo(function TrainScheduleCard({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || !data.schedule || !Array.isArray(data.schedule)) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        Train schedule unavailable.
      </div>
    );
  }

  const stops = data.schedule;
  const displayedStops = isExpanded ? stops : stops.slice(0, 6);

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
              <span>{data.trainNumber}</span>
              <span className="text-slate-500">·</span>
              <span className="truncate max-w-[200px] sm:max-w-[320px]">{data.trainName}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center flex-wrap">
                <span>{formatStationDisplay(data.sourceCode, data.sourceName)}</span>
                <span className="text-slate-500 mx-1.5 font-normal">→</span>
                <span>{formatStationDisplay(data.destinationCode, data.destinationName)}</span>
              </span>
              {data.totalDuration && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {data.totalDuration}
                  </span>
                </>
              )}
              {((data as any).totalDistance || (stops.length > 0 && stops[stops.length - 1].distance && Number(stops[stops.length - 1].distance) > 0)) && (
                <>
                  <span className="text-slate-600">·</span>
                  <span>{(data as any).totalDistance || stops[stops.length - 1].distance} km</span>
                </>
              )}
              <span className="text-slate-600">·</span>
              <span>{stops.length} stops</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.hasPantry && (
            <span className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-400 text-[10px] font-medium flex items-center gap-1">
              <Utensils className="w-3 h-3" /> Pantry
            </span>
          )}
          {data.rating != null && !isNaN(Number(data.rating)) && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-emerald-400" /> {Number(data.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Schedule Stops Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-900/30">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2">Station</th>
              <th className="px-1.5 py-2">Day</th>
              <th className="px-2 py-2">Arr</th>
              <th className="px-2 py-2">Dep</th>
              <th className="px-2 py-2">Halt</th>
              <th className="px-2 py-2">Dist</th>
              <th className="px-2 py-2 text-right">PF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
            {displayedStops.map((st: ScheduleStation | DetailedScheduleStation, idx: number) => (
              <tr key={idx} className="hover:bg-slate-900/50 transition">
                <td className="px-3 py-2 font-sans font-medium text-slate-200">
                  {formatStationDisplay(st.stationCode, st.stationName)}
                </td>
                <td className="px-1.5 py-2 font-mono text-[10px] text-slate-400">
                  <span className="px-1 py-0.2 rounded bg-slate-800/80 text-slate-300">
                    D{st.day || 1}
                  </span>
                </td>
                <td className="px-2 py-2 text-slate-400 font-sans">{formatDualTime(st.arrivalTime)}</td>
                <td className="px-2 py-2 text-slate-200 font-semibold font-sans">{formatDualTime(st.departureTime)}</td>
                <td className="px-2 py-2 text-slate-400">
                  {st.haltMinutes != null && st.haltMinutes !== "-"
                    ? String(st.haltMinutes).endsWith("m")
                      ? st.haltMinutes
                      : `${st.haltMinutes}m`
                    : "-"}
                </td>
                <td className="px-2 py-2 text-slate-400">
                  {st.distance != null ? `${st.distance} km` : "-"}
                </td>
                <td className="px-2 py-2 text-right font-sans">
                  {st.expectedPlatformNo ? (
                    <span className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/50 text-sky-400 text-[10px]">
                      PF {st.expectedPlatformNo}
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stops.length > 6 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              Show Less ({stops.length} Total Stations)
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              Show All {stops.length} Stations (Full Timetable)
            </>
          )}
        </button>
      )}
    </div>
  );
});
