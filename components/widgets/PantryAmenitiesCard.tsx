"use client";

import React from "react";
import { Utensils, CheckCircle2, XCircle, Moon, Zap, ShieldCheck } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";

interface AmenityItem {
  name: string;
  available: boolean;
  description: string;
}

interface Props {
  data: {
    trainNumber?: string;
    trainName?: string;
    source?: string;
    destination?: string;
    totalDuration?: string;
    totalDistance?: number | null;
    hasPantry?: boolean;
    cateringSummary?: string;
    classes?: string[];
    amenities?: AmenityItem[];
  };
}

export const PantryAmenitiesCard = React.memo(function PantryAmenitiesCard({ data }: Props) {
  if (!data || !data.amenities || !Array.isArray(data.amenities)) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        Train amenities data unavailable.
      </div>
    );
  }

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100 flex-wrap">
            <span className="font-mono text-base font-bold text-white">#{data.trainNumber}</span>
            {data.trainName && (
              <>
                <span className="text-slate-500">·</span>
                <span className="truncate max-w-[170px] xs:max-w-[220px] sm:max-w-[320px] text-slate-200">{data.trainName}</span>
              </>
            )}
          </div>
          {(data.source || data.destination) && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="inline-flex items-center gap-1 flex-wrap font-medium text-slate-300">
                <span>{formatStationDisplay(data.source)}</span>
                <span className="text-slate-500">→</span>
                <span>{formatStationDisplay(data.destination)}</span>
              </span>
              {data.totalDuration && (
                <>
                  <span className="text-slate-600">·</span>
                  <span>{data.totalDuration}</span>
                </>
              )}
              {data.totalDistance && (
                <>
                  <span className="text-slate-600">·</span>
                  <span>{data.totalDistance} km</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0">
          {data.hasPantry ? (
            <span className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap">
              <Utensils className="w-3.5 h-3.5" /> Pantry Car Active
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap">
              <XCircle className="w-3.5 h-3.5 text-slate-500" /> No Pantry Car
            </span>
          )}
        </div>
      </div>

      {/* Amenities List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {data.amenities.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {item.available ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className={item.available ? "text-slate-200" : "text-slate-400"}>
                {item.name}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed pl-5">
              {item.description}
            </div>
          </div>
        ))}
      </div>

      {/* Classes tag row */}
      {data.classes && data.classes.length > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
          <span className="text-slate-500">Available Classes:</span>
          <div className="flex flex-wrap gap-1">
            {data.classes.map((cls) => (
              <span
                key={cls}
                className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
