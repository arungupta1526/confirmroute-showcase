"use client";

import React from "react";
import { TrainFront, Info, Search, X, Sparkles } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";

interface CoachItem {
  code: string;
  type: string;
  position: number;
}

interface Props {
  data: {
    trainNumber?: string;
    trainName?: string;
    source?: string;
    sourceCode?: string;
    sourceName?: string;
    destination?: string;
    destinationCode?: string;
    destinationName?: string;
    totalDuration?: string;
    totalDistance?: number | null;
    totalCoaches?: number;
    rakeType?: string;
    regularLocoLink?: string;
    traction?: string;
    couplingType?: string;
    maintenanceDepot?: string;
    historicalIntroducedDate?: string;
    avgSpeed?: number;
    reversalPoints?: string[];
    coachSequence?: string[];
    coaches?: CoachItem[];
    message?: string;
  };
}

import { getCoachColor } from "./coachHelper";

export const CoachPositionCard = React.memo(function CoachPositionCard({ data }: Props) {
  if (!data || (!data.coaches && !data.coachSequence)) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        {data?.message || "Coach position data unavailable for this train."}
      </div>
    );
  }

  const coaches: CoachItem[] = React.useMemo(() => {
    if (Array.isArray(data.coaches) && data.coaches.length > 0) {
      return data.coaches
        .map((c: any, idx: number) => ({
          code: String(c.code || c.coachCode || "").trim(),
          type: String(c.type || c.coachType || "").trim(),
          position: typeof c.position === "number" ? c.position : idx + 1,
        }))
        .filter((c) => Boolean(c.code));
    }
    if (Array.isArray(data.coachSequence) && data.coachSequence.length > 0) {
      return data.coachSequence
        .map((code, idx) => ({
          code: String(code || "").trim(),
          type: String(code || "").trim(),
          position: idx + 1,
        }))
        .filter((c) => Boolean(c.code));
    }
    return [];
  }, [data.coaches, data.coachSequence]);

  const [searchCoach, setSearchCoach] = React.useState("");
  const cleanSearch = searchCoach.trim().toUpperCase();
  const matchedCoach = cleanSearch
    ? coaches.find((c) => (c.code || "").toUpperCase() === cleanSearch)
    : null;

  const trackScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (matchedCoach && trackScrollRef.current) {
      const container = trackScrollRef.current;
      const targetEl = document.getElementById(`coach-pos-${matchedCoach.position}-${matchedCoach.code}`);
      if (targetEl && container) {
        const targetRect = targetEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetCenterOffset = targetRect.left - containerRect.left + targetRect.width / 2;
        const scrollDelta = targetCenterOffset - containerRect.width / 2;
        container.scrollTo({
          left: Math.max(0, container.scrollLeft + scrollDelta),
          behavior: "smooth",
        });
      }
    }
  }, [matchedCoach]);

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400">
            <TrainFront className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
              <span>{data.trainNumber}</span>
              {data.trainName && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="truncate max-w-[200px] sm:max-w-[320px]">{data.trainName}</span>
                </>
              )}
            </div>
            {(data.source || data.sourceCode || data.destination || data.destinationCode) && (
              <div className="text-[11px] text-slate-400">
                {formatStationDisplay(data.source || data.sourceCode, data.sourceName)} → {formatStationDisplay(data.destination || data.destinationCode, data.destinationName)}
                {data.totalDuration && ` · ${data.totalDuration}`}
                {data.totalDistance && ` · ${data.totalDistance} km`}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            {coaches.length} Coaches
          </span>
        </div>
      </div>

      {/* Rake Technical Specs Badges */}
      {(data.rakeType || data.regularLocoLink || data.traction || data.maintenanceDepot) && (
        <div className="flex flex-wrap items-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px]">
          {data.rakeType && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded">
              <span>Rake:</span>
              <span>{data.rakeType}</span>
            </span>
          )}
          {data.regularLocoLink && (
            <span className="inline-flex items-center gap-1 font-medium text-sky-300 bg-sky-950/50 border border-sky-800/60 px-2 py-0.5 rounded">
              <span>Loco:</span>
              <span className="font-mono">{data.regularLocoLink}</span>
            </span>
          )}
          {data.traction && (
            <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded">
              <span>{data.traction}</span>
            </span>
          )}
          {data.maintenanceDepot && (
            <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/40 border border-slate-700/40 px-2 py-0.5 rounded">
              <span>PM:</span>
              <span className="font-mono">{data.maintenanceDepot}</span>
            </span>
          )}
          {data.couplingType && (
            <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/40 border border-slate-700/40 px-2 py-0.5 rounded">
              <span>Coupler:</span>
              <span>{data.couplingType}</span>
            </span>
          )}
          {data.avgSpeed && (
            <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded font-mono">
              <span>Speed:</span>
              <span>{data.avgSpeed} km/h</span>
            </span>
          )}
          {data.reversalPoints && data.reversalPoints.length > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded font-mono">
              <span>Reversal:</span>
              <span>{data.reversalPoints.join(", ")}</span>
            </span>
          )}
        </div>
      )}

      {/* Locate My Coach Search Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex items-center flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            <input
              id="locate-coach-input"
              type="text"
              placeholder="Locate coach (e.g. B2, S9, A1)..."
              value={searchCoach}
              onChange={(e) => setSearchCoach(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
              maxLength={6}
            />
            {searchCoach && (
              <button
                type="button"
                onClick={() => setSearchCoach("")}
                className="absolute right-2 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-1 justify-end">
            {matchedCoach ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[11px] font-medium animate-in fade-in">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>
                  Coach <strong>{matchedCoach.code}</strong> is #{matchedCoach.position} from engine
                  {matchedCoach.type && <span className="text-amber-400/80 ml-1">· {matchedCoach.type}</span>}
                </span>
              </span>
            ) : cleanSearch ? (
              <span className="text-[11px] text-rose-400/90 italic">
                Coach &quot;{cleanSearch}&quot; not found in rake
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1">
                Tip: Click any coach block to inspect
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Coach Sequence Track */}
      <div>
        <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span>Engine (Loco)</span>
            <span className="text-slate-600">→</span>
            <span className="text-slate-500">Scroll horizontally to view complete rake</span>
          </div>
        </div>
        <div ref={trackScrollRef} className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Locomotive Icon (only rendered if rake does not already include engine in sequence) */}
          {(!coaches[0] || !/^(ENG|LOCO|L)$/i.test(coaches[0].code)) && (
            <div className="flex flex-col items-center shrink-0">
              <div className="w-12 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-[11px] font-bold">
                ENG
              </div>
              <span className="text-[9px] text-amber-400/80 mt-0.5 font-medium">Front</span>
            </div>
          )}

          {/* Coach Blocks */}
          {coaches.map((c, i) => {
            const coachCode = c.code || "";
            const isTarget = Boolean(cleanSearch && coachCode.toUpperCase() === cleanSearch);
            const colorClass = getCoachColor(coachCode, c.type);
            const isFirstEngine = i === 0 && /^(ENG|LOCO|L)$/i.test(coachCode);
            return (
              <div
                key={i}
                id={`coach-pos-${c.position}-${coachCode}`}
                onClick={() => setSearchCoach(cleanSearch === coachCode ? "" : coachCode)}
                className="flex flex-col items-center shrink-0 cursor-pointer"
                title={`Coach ${coachCode}: ${c.type} (#${c.position}) - Click to inspect`}
              >
                <div
                  className={`w-11 h-10 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-150 ${
                    isTarget
                      ? "ring-2 ring-amber-400 bg-amber-500/30 text-amber-200 border-amber-400 scale-110 shadow-lg shadow-amber-500/20 z-10"
                      : `${colorClass} hover:scale-110 hover:shadow-lg hover:shadow-black/50 hover:z-10`
                  }`}
                >
                  {coachCode}
                </div>
                <span className={`text-[9px] mt-0.5 transition-colors ${isTarget ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                  {isFirstEngine ? "Front" : `#${c.position}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rake Legend */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-sky-500/80" /> Sleeper (S)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-indigo-500/80" /> 3rd AC (B/M)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-emerald-500/80" /> 2nd AC (A)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-rose-500/80" /> 1st AC (H)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-purple-500/80" /> Executive AC (EC/EA)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-amber-500/80" /> Pantry (PC)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-slate-700" /> General / Guard (SLR)
        </span>
      </div>
    </div>
  );
});
