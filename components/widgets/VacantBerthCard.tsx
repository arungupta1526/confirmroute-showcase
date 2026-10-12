"use client";

import React, { useState } from "react";
import { Armchair, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Copy, Check, Share2, Sparkles } from "lucide-react";
import { formatStationDisplay, MAJOR_STATIONS } from "./stationHelper";
import { resolveBerthType, formatChartTime, STANDARD_BERTH_FILTERS, BERTH_PILL_STYLES } from "../../src/utils/berthHelper";
import { VacantBerthTimeline } from "./VacantBerthTimeline";
import { VacantBerthStationSearch } from "./VacantBerthStationSearch";
import { VacantBerthRow } from "./VacantBerthRow";
import type { VacantChartBerthsResult } from "../../src/types";

interface Props {
  data: Partial<VacantChartBerthsResult> & {
    error?: string;
    message?: string;
  };
}

export const VacantBerthCard = React.memo(function VacantBerthCard({ data }: Props) {
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedBerthType, setSelectedBerthType] = useState<string>("ALL");
  const [fromStationQuery, setFromStationQuery] = useState<string>("");
  const [toStationQuery, setToStationQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  if (!data || (!data.vacantBerths && !data.classSummary)) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{data?.message || data?.error || "Vacant berth chart data is currently unavailable."}</span>
      </div>
    );
  }

  const allBerths = data.vacantBerths || [];
  const classSummary = data.classSummary || {};
  const totalCount = data.totalVacantBerths ?? allBerths.length;
  const isSecondChartFrozen = Boolean(data.chartTwoDate);

  // Available unique boarding & destination stations in this chart
  const { availableFromStations, availableToStations } = React.useMemo(() => {
    const fromMap = new Map<string, { code: string; name: string; count: number }>();
    const toMap = new Map<string, { code: string; name: string; count: number }>();

    for (const b of allBerths) {
      const fromCode = (b.from || "").trim().toUpperCase();
      const toCode = (b.to || "").trim().toUpperCase();

      if (fromCode) {
        const fromName = b.fromStationName || MAJOR_STATIONS[fromCode] || fromCode;
        const existing = fromMap.get(fromCode) || { code: fromCode, name: fromName, count: 0 };
        existing.count += 1;
        fromMap.set(fromCode, existing);
      }

      if (toCode) {
        const toName = b.toStationName || MAJOR_STATIONS[toCode] || toCode;
        const existing = toMap.get(toCode) || { code: toCode, name: toName, count: 0 };
        existing.count += 1;
        toMap.set(toCode, existing);
      }
    }

    const fromList = Array.from(fromMap.values()).sort((a, b) => b.count - a.count);
    const toList = Array.from(toMap.values()).sort((a, b) => b.count - a.count);

    return { availableFromStations: fromList, availableToStations: toList };
  }, [allBerths]);

  // Available berth filters with counts for the selected class and station search
  const availableBerthFilters = React.useMemo(() => {
    const counts: Record<string, number> = { ALL: 0, LOWER_ALL: 0 };
    const normalizedFrom = fromStationQuery.trim().toLowerCase();
    const normalizedTo = toStationQuery.trim().toLowerCase();

    for (const b of allBerths) {
      if (selectedClass !== "ALL" && b.classCode !== selectedClass) continue;

      if (normalizedFrom) {
        const code = (b.from || "").toLowerCase();
        const name = (b.fromStationName || MAJOR_STATIONS[b.from?.toUpperCase() || ""] || "").toLowerCase();
        if (!code.includes(normalizedFrom) && !name.includes(normalizedFrom)) continue;
      }

      if (normalizedTo) {
        const code = (b.to || "").toLowerCase();
        const name = (b.toStationName || MAJOR_STATIONS[b.to?.toUpperCase() || ""] || "").toLowerCase();
        if (!code.includes(normalizedTo) && !name.includes(normalizedTo)) continue;
      }

      counts.ALL = (counts.ALL || 0) + 1;
      const type = resolveBerthType(b.berthNumber, b.classCode, b.berthCode);
      const code = type.code || "OTHER";
      counts[code] = (counts[code] || 0) + 1;
      if (type.isLower) {
        counts.LOWER_ALL = (counts.LOWER_ALL || 0) + 1;
      }
    }

    const list: Array<{ code: string; label: string; shortLabel: string; count: number }> = [];
    for (const item of STANDARD_BERTH_FILTERS) {
      const cnt = counts[item.code] ?? 0;
      if (item.code === "ALL") {
        list.push({ ...item, count: cnt });
      } else if (item.code === "LOWER_ALL") {
        if (counts.LB > 0 && counts.SL > 0) {
          list.push({ ...item, count: cnt });
        }
      } else if (cnt > 0) {
        list.push({ ...item, count: cnt });
      }
    }

    return list;
  }, [allBerths, selectedClass, fromStationQuery, toStationQuery]);

  const filteredBerths = React.useMemo(() => {
    const normalizedFrom = fromStationQuery.trim().toLowerCase();
    const normalizedTo = toStationQuery.trim().toLowerCase();

    return allBerths.filter((b) => {
      if (selectedClass !== "ALL" && b.classCode !== selectedClass) return false;
      if (selectedBerthType !== "ALL") {
        const type = resolveBerthType(b.berthNumber, b.classCode, b.berthCode);
        if (selectedBerthType === "LOWER_ALL") {
          if (!type.isLower) return false;
        } else if (type.code !== selectedBerthType) {
          return false;
        }
      }

      if (normalizedFrom) {
        const code = (b.from || "").toLowerCase();
        const name = (b.fromStationName || MAJOR_STATIONS[b.from?.toUpperCase() || ""] || "").toLowerCase();
        if (!code.includes(normalizedFrom) && !name.includes(normalizedFrom)) {
          return false;
        }
      }

      if (normalizedTo) {
        const code = (b.to || "").toLowerCase();
        const name = (b.toStationName || MAJOR_STATIONS[b.to?.toUpperCase() || ""] || "").toLowerCase();
        if (!code.includes(normalizedTo) && !name.includes(normalizedTo)) {
          return false;
        }
      }

      return true;
    });
  }, [allBerths, selectedClass, selectedBerthType, fromStationQuery, toStationQuery]);

  const handleClassSelect = (cls: string) => { setSelectedClass(cls); setSelectedBerthType("ALL"); };
  const handleBerthTypeSelect = (code: string) => { setSelectedBerthType((prev) => (prev === code ? "ALL" : code)); };

  const handleSwapStations = () => {
    const temp = fromStationQuery;
    setFromStationQuery(toStationQuery);
    setToStationQuery(temp);
  };

  const handleResetFilters = () => {
    setSelectedClass("ALL");
    setSelectedBerthType("ALL");
    setFromStationQuery("");
    setToStationQuery("");
  };

  const handleCopy = () => {
    const classText = Object.entries(classSummary)
      .filter(([_, cnt]) => (cnt as number) > 0)
      .map(([cls, cnt]) => `${cls}: ${cnt}`)
      .join(", ");
    const hubInfo = data.remoteStation ? ` | 🏢 Charting Hub: ${data.remoteStation}` : "";
    const text = `🚆 Train ${data.trainNumber} (${data.trainName || "Express"})\n📍 Boarding: ${data.boardingStation || data.from} ➔ ${data.to}${hubInfo}\n💺 Vacant Berths: ${totalCount} seats available\n🏷️ Class: ${classText || "Available"}\n🕒 Chart 1: ${formatChartTime(data.chartOneDate) || "Prepared"} | Chart 2: ${data.chartTwoDate ? formatChartTime(data.chartTwoDate) : "15-30m before dep"}\n🔗 Check on ConfirmRoute: ${typeof window !== "undefined" ? window.location.href : "https://confirmroute.com"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const classText = Object.entries(classSummary)
      .filter(([_, cnt]) => (cnt as number) > 0)
      .map(([cls, cnt]) => `${cls}: ${cnt}`)
      .join(", ");
    const hubInfo = data.remoteStation ? ` | *Charting Hub:* ${data.remoteStation}` : "";
    const text = `*ConfirmRoute Vacant Berths Alert* 🚆\n*Train ${data.trainNumber} - ${data.trainName || ""}*\n📍 *Boarding:* ${data.boardingStation || data.from} ➔ ${data.to}${hubInfo}\n💺 *Vacant Berths:* ${totalCount} seats available\n🏷️ *Classes:* ${classText || "Available"}\n🕒 *Final 2nd Chart:* ${data.chartTwoDate ? formatChartTime(data.chartTwoDate) : "Freezes 15-30m before departure"}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-md shadow-black/20 text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Armchair className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-100 flex-wrap">
              <span>{data.trainNumber}</span>
              {data.trainName && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="truncate max-w-[180px] sm:max-w-[280px] text-slate-200">
                    {data.trainName}
                  </span>
                </>
              )}
            </div>
            {(data.from || data.to) && (
              <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {formatStationDisplay(data.from || "")} → {formatStationDisplay(data.to || "")}
                {(data as any).totalDuration && ` · ${(data as any).totalDuration}`}
                {((data as any).totalDistance || (data as any).distance) && ` · ${(data as any).totalDistance || (data as any).distance} km`}
                {data.boardingStation && data.boardingStation !== data.from && (
                  <span className="ml-1 text-slate-400">
                    · Boarding: <span className="text-slate-200 font-medium">{formatStationDisplay(data.boardingStation)}</span>
                  </span>
                )}
                {data.remoteStation && (
                  <span className="ml-1 text-sky-400 font-medium">
                    · Hub: {formatStationDisplay(data.remoteStation, data.remoteStationName)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chart Status & Share Actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {data.isChartPrepared ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                Chart Prepared
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                Chart Pending
              </span>
            )}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy berths summary"
              className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              title="Share on WhatsApp"
              className="p-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>

          {data.departureStatus?.hasDeparted ? (
            <span className="text-[10px] text-rose-300 font-medium bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              Online Closed · Train Passed
            </span>
          ) : isSecondChartFrozen ? (
            <span className="text-[10px] text-amber-300 font-medium bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              TTE Spot Allotment · 2nd Chart Frozen
            </span>
          ) : data.isChartPrepared ? (
            <span className="text-[10px] text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              10% Off Base Fare · Zero Tatkal Extra
            </span>
          ) : null}
        </div>
      </div>

      {/* IRCTC Charting Timeline & Booking Window */}
      <VacantBerthTimeline
        chartOneDate={data.chartOneDate}
        chartTwoDate={data.chartTwoDate}
        remoteStation={data.remoteStation}
        remoteStationName={data.remoteStationName}
        nextRemoteStation={data.nextRemoteStation}
        nextRemoteStationName={data.nextRemoteStationName}
        boardingStation={data.boardingStation}
        departureStatus={data.departureStatus}
      />

      {/* Source/Boarding & Destination Search Box */}
      <VacantBerthStationSearch
        fromQuery={fromStationQuery}
        toQuery={toStationQuery}
        onFromChange={setFromStationQuery}
        onToChange={setToStationQuery}
        onSwap={handleSwapStations}
        onClear={() => {
          setFromStationQuery("");
          setToStationQuery("");
        }}
        availableFromStations={availableFromStations}
        availableToStations={availableToStations}
        matchCount={filteredBerths.length}
        totalCount={totalCount}
      />

      {/* Class & Berth Position Filter Rows */}
      <div className="space-y-2 pt-1">
        {/* Class Filter Row */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-medium text-slate-300">Filter by Travel Class</span>
            <span className="font-semibold text-emerald-400">{filteredBerths.length} shown</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleClassSelect("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors border ${
                selectedClass === "ALL"
                  ? "bg-slate-200 text-slate-900 border-white shadow-sm"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              All Classes ({totalCount})
            </button>
            {Object.entries(classSummary).map(([cls, count]) => (
              <button
                key={cls}
                type="button"
                onClick={() => handleClassSelect(cls)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors border ${
                  selectedClass === cls
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                }`}
              >
                {cls} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Berth Type Filter Row (LB, MB, UB, SL, SU, etc.) */}
        {availableBerthFilters.length > 1 && (
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="font-medium text-slate-300">Filter by Berth Position</span>
              {selectedBerthType !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setSelectedBerthType("ALL")}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline font-medium"
                >
                  Clear berth filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableBerthFilters.map((opt) => {
                const isSelected = selectedBerthType === opt.code;
                const style = BERTH_PILL_STYLES[opt.code] || BERTH_PILL_STYLES.ALL;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleBerthTypeSelect(opt.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs shrink-0 transition-colors border ${
                      isSelected ? style.active : style.inactive
                    }`}
                  >
                    {opt.shortLabel} ({opt.count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Berths List Grid */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredBerths.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800/60 p-4">
            <p className="font-medium text-slate-300">No vacant berths match the selected filters.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
            >
              Reset filters (Show all {totalCount} berths)
            </button>
          </div>
        ) : (
          filteredBerths.slice(0, 50).map((b, idx) => (
            <VacantBerthRow
              key={`${b.coachName}-${b.berthNumber}-${idx}`}
              berth={b}
              index={idx}
              onSelectBerthType={handleBerthTypeSelect}
            />
          ))
        )}
        {filteredBerths.length > 50 && (
          <div className="text-center py-1.5 text-[11px] text-slate-500">
            Showing first 50 of {filteredBerths.length} vacant berths
          </div>
        )}
      </div>

      {/* Helpful Tip Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Available via Current Booking or onboard TTE</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">IRCTC PRS Charting</span>
      </div>
    </div>
  );
});
