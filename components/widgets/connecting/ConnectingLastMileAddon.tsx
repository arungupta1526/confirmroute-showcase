"use client";

import React from "react";
import { TrainFront, Bus, Ticket, MapPin } from "lucide-react";

interface LastMileAddonProps {
  addon: {
    branchCode: string;
    branchName: string;
    railheadCode: string;
    railheadName: string;
    distanceKm: number;
    shuttles: Array<{
      trainNumber: string;
      trainName: string;
      scheduleInfo: string;
      ticketType: string;
    }>;
    roadAlternative: string;
  };
}

export const ConnectingLastMileAddon = React.memo(function ConnectingLastMileAddon({
  addon,
}: LastMileAddonProps) {
  if (!addon) return null;

  return (
    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2.5 text-xs text-amber-100/90 mx-1">
      <div className="flex items-center justify-between border-b border-amber-800/40 pb-1.5 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Last-Mile Local Connection: {addon.railheadName} ({addon.railheadCode}) ➔ {addon.branchName} ({addon.branchCode}) · {addon.distanceKm} km
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700/60 text-[10px] font-semibold">
          Rural Branch Railhead
        </span>
      </div>

      {addon.shuttles && addon.shuttles.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-amber-200 flex items-center gap-1">
            <TrainFront className="w-3.5 h-3.5 text-amber-400" />
            <span>Local Passenger / DMU Shuttles:</span>
          </div>
          {addon.shuttles.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-amber-900/40 text-[11px] flex-wrap gap-2"
            >
              <div>
                <span className="font-semibold text-amber-300">#{s.trainNumber}</span>{" "}
                <span className="text-slate-200">{s.trainName}</span>
                <span className="text-slate-400 text-[10px] block sm:inline sm:ml-2">
                  ({s.scheduleInfo})
                </span>
              </div>
              <span className="text-emerald-400 font-medium flex items-center gap-1 text-[10px]">
                <Ticket className="w-3 h-3 text-emerald-400" />
                {s.ticketType}
              </span>
            </div>
          ))}
        </div>
      )}

      {addon.roadAlternative && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-200/80 pt-0.5">
          <Bus className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300 font-semibold">Road Transit:</strong>{" "}
            {addon.roadAlternative}
          </span>
        </div>
      )}
    </div>
  );
});
