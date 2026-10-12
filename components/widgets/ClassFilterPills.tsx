"use client";

import React, { useMemo } from "react";
import { Train } from "@/src/types";
import { Armchair } from "lucide-react";

interface ClassFilterPillsProps {
  trains: Train[];
  selectedClass: string | "all";
  onSelectClass: (travelClass: string | "all") => void;
}

export const ClassFilterPills = React.memo(function ClassFilterPills({
  trains,
  selectedClass,
  onSelectClass,
}: ClassFilterPillsProps) {
  // Aggregate distinct travel classes and check whether any train has available seats
  const classStats = useMemo(() => {
    const map = new Map<string, { travelClass: string; count: number; hasAvailable: boolean }>();

    for (const t of trains) {
      if (Array.isArray(t.availability) && t.availability.length > 0) {
        for (const avail of t.availability) {
          const cls = avail.travelClass?.toUpperCase();
          if (!cls) continue;
          const status = String(avail.status || "").toUpperCase();
          const isAvail =
            status.startsWith("AVL") ||
            status.includes("AVAILABLE") ||
            status.includes("CURR_AVBL") ||
            (avail.seats ?? 0) > 0;
          const existing = map.get(cls);
          if (existing) {
            existing.count += 1;
            if (isAvail) existing.hasAvailable = true;
          } else {
            map.set(cls, { travelClass: cls, count: 1, hasAvailable: isAvail });
          }
        }
      } else if (Array.isArray((t as any).classes)) {
        for (const cls of (t as any).classes) {
          const upper = String(cls).toUpperCase();
          if (!upper) continue;
          const existing = map.get(upper);
          if (existing) {
            existing.count += 1;
          } else {
            map.set(upper, { travelClass: upper, count: 1, hasAvailable: false });
          }
        }
      }
    }

    // Standard railway ordering with 2S before SL: 2S, SL, 3E, 3A, 2A, 1A, CC, EC, EA
    const order = ["2S", "SL", "3E", "3A", "2A", "1A", "CC", "EC", "EA"];
    return Array.from(map.values()).sort((a, b) => {
      const idxA = order.indexOf(a.travelClass);
      const idxB = order.indexOf(b.travelClass);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.count - a.count;
    });
  }, [trains]);

  if (classStats.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none text-xs">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
        <Armchair className="w-3.5 h-3.5 text-emerald-400" />
        <span>Class:</span>
      </div>

      <button
        type="button"
        onClick={() => onSelectClass("all")}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition shrink-0 cursor-pointer ${
          selectedClass === "all"
            ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
            : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
        }`}
      >
        All Classes
      </button>

      {classStats.map((item) => (
        <button
          key={item.travelClass}
          type="button"
          onClick={() => onSelectClass(selectedClass === item.travelClass ? "all" : item.travelClass)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition shrink-0 cursor-pointer ${
            selectedClass === item.travelClass
              ? "bg-emerald-600 border-emerald-500 text-white shadow-sm font-semibold"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
          }`}
        >
          <span>{item.travelClass}</span>
          <span className="text-[10px] opacity-75">({item.count})</span>
          {item.hasAvailable && (
            <span
              title="Seats available in this class"
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"
            />
          )}
        </button>
      ))}
    </div>
  );
});
