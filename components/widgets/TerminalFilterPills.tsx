"use client";

import React, { useMemo } from "react";
import { Train } from "@/src/types";
import { Building2 } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";

interface TerminalFilterPillsProps {
  trains: Train[];
  selectedTerminal: string | "all";
  onSelectTerminal: (terminal: string | "all") => void;
}

export const TerminalFilterPills = React.memo(function TerminalFilterPills({
  trains,
  selectedTerminal,
  onSelectTerminal,
}: TerminalFilterPillsProps) {
  // Aggregate distinct origin terminal counts
  const terminalCounts = useMemo(() => {
    const map = new Map<string, { code: string; name?: string; count: number }>();
    for (const t of trains) {
      const code = t.fromStnCode;
      if (!code) continue;
      const existing = map.get(code);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(code, { code, name: t.fromStnName, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [trains]);

  // Only show terminal filter pills if there are at least 2 distinct terminals
  if (terminalCounts.length < 2) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none text-xs">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
        <Building2 className="w-3.5 h-3.5 text-sky-400" />
        <span>Terminals:</span>
      </div>

      <button
        type="button"
        onClick={() => onSelectTerminal("all")}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition shrink-0 cursor-pointer ${
          selectedTerminal === "all"
            ? "bg-sky-600 border-sky-500 text-white shadow-sm"
            : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
        }`}
      >
        All Terminals ({trains.length})
      </button>

      {terminalCounts.map((term) => (
        <button
          key={term.code}
          type="button"
          onClick={() => onSelectTerminal(term.code)}
          title={term.name || term.code}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition shrink-0 cursor-pointer ${
            selectedTerminal === term.code
              ? "bg-sky-600 border-sky-500 text-white shadow-sm font-semibold"
              : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
          }`}
        >
          {formatStationDisplay(term.code, term.name)} ({term.count})
        </button>
      ))}
    </div>
  );
});
