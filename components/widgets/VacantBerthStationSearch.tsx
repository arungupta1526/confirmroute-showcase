"use client";

import React from "react";
import { MapPin, Navigation, ArrowLeftRight, X, Search } from "lucide-react";

export interface StationOption {
  code: string;
  name: string;
  count: number;
}

interface VacantBerthStationSearchProps {
  fromQuery: string;
  toQuery: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onSwap: () => void;
  onClear: () => void;
  availableFromStations: StationOption[];
  availableToStations: StationOption[];
  matchCount: number;
  totalCount: number;
}

export const VacantBerthStationSearch = React.memo(function VacantBerthStationSearch({
  fromQuery,
  toQuery,
  onFromChange,
  onToChange,
  onSwap,
  onClear,
  availableFromStations,
  availableToStations,
  matchCount,
  totalCount,
}: VacantBerthStationSearchProps) {
  const id = React.useId();
  const fromListId = `vacant-from-${id}`;
  const toListId = `vacant-to-${id}`;
  const isFilterActive = Boolean(fromQuery.trim() || toQuery.trim());

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800/80 p-2.5 space-y-2">
      {/* Search Header */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Search by Station / Leg</span>
        </div>
        {isFilterActive && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-0.5"
          >
            <span>Reset stations</span>
          </button>
        )}
      </div>

      {/* Input Pair (From / Boarding and To / Destination) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
        {/* From / Boarding Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <input
            type="text"
            value={fromQuery}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="Boarding station (e.g. GAYA, NDLS)"
            list={fromListId}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
          />
          {fromQuery && (
            <button
              type="button"
              onClick={() => onFromChange("")}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-200"
              title="Clear boarding search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={onSwap}
          title="Swap boarding and destination stations"
          className="self-center p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 transition-colors shrink-0"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>

        {/* To / Destination Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <input
            type="text"
            value={toQuery}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="Destination station (e.g. CSMT, DDU)"
            list={toListId}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-colors"
          />
          {toQuery && (
            <button
              type="button"
              onClick={() => onToChange("")}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-200"
              title="Clear destination search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* HTML Datalists for native browser autocomplete suggestions with unique IDs */}
      <datalist id={fromListId}>
        {availableFromStations.map((s) => (
          <option key={`from-${s.code}`} value={s.code}>
            {s.name} ({s.code}) - {s.count} berths
          </option>
        ))}
      </datalist>

      <datalist id={toListId}>
        {availableToStations.map((s) => (
          <option key={`to-${s.code}`} value={s.code}>
            {s.name} ({s.code}) - {s.count} berths
          </option>
        ))}
      </datalist>

      {/* Quick station pill suggestions if multiple stations exist */}
      {(availableFromStations.length > 1 || availableToStations.length > 1) && (
        <div className="space-y-1.5 pt-0.5 text-[10px]">
          {availableFromStations.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <span className="text-slate-400 shrink-0 font-medium">Boarding:</span>
              {availableFromStations.slice(0, 5).map((s) => {
                const isSelected = fromQuery.trim().toUpperCase() === s.code.toUpperCase();
                return (
                  <button
                    key={`pill-from-${s.code}`}
                    type="button"
                    onClick={() => onFromChange(isSelected ? "" : s.code)}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 border transition-colors ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {s.code} ({s.count})
                  </button>
                );
              })}
            </div>
          )}

          {availableToStations.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <span className="text-slate-400 shrink-0 font-medium">Destination:</span>
              {availableToStations.slice(0, 5).map((s) => {
                const isSelected = toQuery.trim().toUpperCase() === s.code.toUpperCase();
                return (
                  <button
                    key={`pill-to-${s.code}`}
                    type="button"
                    onClick={() => onToChange(isSelected ? "" : s.code)}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 border transition-colors ${
                      isSelected
                        ? "bg-sky-500 text-slate-950 border-sky-400"
                        : "bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {s.code} ({s.count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active filter summary tag if filter applied */}
      {isFilterActive && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/60">
          <span>
            Matching:{" "}
            <span className="text-emerald-300 font-semibold">{fromQuery || "Any"}</span>
            {" ➔ "}
            <span className="text-sky-300 font-semibold">{toQuery || "Any"}</span>
          </span>
          <span className="text-slate-300 font-medium">
            {matchCount} of {totalCount} berths
          </span>
        </div>
      )}
    </div>
  );
});
