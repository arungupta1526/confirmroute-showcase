"use client";

import React, { useState, useMemo } from "react";
import { ConnectingTrainsResult } from "@/src/types";
import { GitMerge, ArrowRight, Bookmark, BookmarkCheck, Clock, TrainFront, CheckCircle2 } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { useSavedRoutes } from "@/src/hooks/useSavedRoutes";
import { ConnectingRouteItem } from "./connecting/ConnectingRouteItem";
import { ConnectingLastMileAddon } from "./connecting/ConnectingLastMileAddon";
import { CLASS_FILTER_ORDER, LAYOVER_SLOTS, computeItineraryScore } from "./connecting/connectingClassHelper";
import { useCurrentISTTime, isTodayJourney, parseDepartureMinutes } from "./trainTimeHelper";

function isSeatConfirmed(a?: { status?: string; seats?: number }): boolean {
  if (!a) return false;
  const s = String(a.status || "").toUpperCase();
  return s.includes("AVL") || s.includes("RAC") || s.includes("CURR_AVL") || (a.seats ?? 0) > 0;
}

interface Props {
  data: ConnectingTrainsResult;
}

export const ConnectingTrainsCard = React.memo(function ConnectingTrainsCard({ data }: Props) {
  const { isSaved, toggleRoute } = useSavedRoutes();
  const isRouteSaved = isSaved(data?.source, data?.destination);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Dynamic real-time IST clock for filtering departed trains on today's journey
  const { totalMinutes } = useCurrentISTTime();
  const isToday = useMemo(() => isTodayJourney(data?.date), [data?.date]);

  // Reactive base connections: when journey is today, dynamically filter out trains whose Leg 1
  // has already departed before the current IST minute. 0-min buffer ensures passengers on the platform
  // don't miss imminent departures, but trains naturally roll off as time advances without extra pills!
  const liveConnections = useMemo(() => {
    if (!data?.connections) return [];
    if (!isToday) return data.connections;
    return data.connections.filter((c) => {
      const dep1 = parseDepartureMinutes(c.leg1?.departureTime);
      return dep1 >= totalMinutes;
    });
  }, [data?.connections, isToday, totalMinutes]);

  // Three-Window architecture: "all" (Next Trains) | "one-confirmed" (80% Users) | "confirmed" (Both Confirmed)
  const [activeTier, setActiveTier] = useState<"all" | "one-confirmed" | "confirmed">("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedLayoverSlot, setSelectedLayoverSlot] = useState<string>("all");

  const totalConfirmedCount = useMemo(() => {
    return liveConnections.filter(
      (c) => c.tier === "CONFIRMED_SEATS" || c.hasConfirmedSeats
    ).length;
  }, [liveConnections]);

  const oneConfirmedCount = useMemo(() => {
    return liveConnections.filter((c) => {
      if (c.tier === "CONFIRMED_SEATS" || c.tier === "MIX_OR_GENERAL" || c.hasConfirmedSeats) return true;
      const leg1Conf = (c.leg1?.availability || []).some(
        (a: any) => isSeatConfirmed(a)
      );
      const leg2Conf = (c.leg2?.availability || []).some(
        (a: any) => isSeatConfirmed(a)
      );
      return leg1Conf || leg2Conf;
    }).length;
  }, [liveConnections]);

  if (!data || !data.connections || data.connections.length === 0) {
    const srcDisplay = formatStationDisplay(data?.source);
    const dstDisplay = formatStationDisplay(data?.destination);
    const dateText = data?.date || "today";

    return (
      <div className="my-3 font-sans rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <GitMerge className="w-4 h-4 text-sky-400" />
            <span>2-Leg Connecting Route Finder</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Date: {dateText}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70 space-y-2 text-xs">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span>{srcDisplay}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">[Hub Junction]</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>{dstDisplay}</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            No active 2-leg connecting trains found through intermediate hubs for this date. Today&apos;s evening trains may have already departed or are undergoing maintenance.
          </p>
        </div>

        {data?.lastMileAddon && <ConnectingLastMileAddon addon={data.lastMileAddon} />}

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
          <span className="font-medium text-slate-300">💡 Pro Tips:</span>
          <span>Check for tomorrow or an advance date</span>
          <span>•</span>
          <span>Try checking major junction terminals</span>
        </div>
      </div>
    );
  }

  // 1. Filter by Active Window (Tier)
  const tierConnections = useMemo(() => {
    if (activeTier === "confirmed") {
      return liveConnections.filter(
        (c) => c.tier === "CONFIRMED_SEATS" || c.hasConfirmedSeats
      );
    }
    if (activeTier === "one-confirmed") {
      return liveConnections.filter((c) => {
        if (c.tier === "CONFIRMED_SEATS" || c.tier === "MIX_OR_GENERAL" || c.hasConfirmedSeats) return true;
        const leg1Conf = (c.leg1?.availability || []).some(
          (a: any) => isSeatConfirmed(a)
        );
        const leg2Conf = (c.leg2?.availability || []).some(
          (a: any) => isSeatConfirmed(a)
        );
        return leg1Conf || leg2Conf;
      });
    }
    return liveConnections;
  }, [liveConnections, activeTier]);

  const availableOrigins = useMemo(() => {
    const map = new Map<string, string>();
    for (const conn of tierConnections) {
      const code = conn.leg1?.fromStnCode;
      if (code && !map.has(code)) {
        map.set(code, conn.leg1?.fromStnName || code);
      }
    }
    return Array.from(map.entries());
  }, [tierConnections]);

  const availableHubs = useMemo(() => {
    const map = new Map<string, string>();
    for (const conn of tierConnections) {
      if (conn.hubStationCode && !map.has(conn.hubStationCode)) {
        map.set(conn.hubStationCode, conn.hubStationName || conn.hubStationCode);
      }
    }
    return Array.from(map.entries());
  }, [tierConnections]);

  // 2. Filter by origin terminal if active
  const originFilteredConnections = useMemo(() => {
    return selectedOrigin === "all"
      ? tierConnections
      : tierConnections.filter((c) => c.leg1?.fromStnCode === selectedOrigin);
  }, [tierConnections, selectedOrigin]);

  // 3. Filter by hub if active
  const hubFilteredConnections = useMemo(() => {
    return selectedHub === "all"
      ? originFilteredConnections
      : originFilteredConnections.filter((c) => c.hubStationCode === selectedHub);
  }, [originFilteredConnections, selectedHub]);

  // 4. Compute matching class counts (strictly verified by tier: confirmed seats on both legs in Both Confirmed)
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cls of CLASS_FILTER_ORDER) counts[cls] = 0;
    for (const conn of hubFilteredConnections) {
      for (const cls of CLASS_FILTER_ORDER) {
        if (activeTier === "confirmed") {
          // In Both Confirmed: that specific class MUST have confirmed seats on BOTH legs!
          const leg1Conf = (conn.leg1?.availability || []).some(
            (a: any) => a.travelClass === cls && isSeatConfirmed(a)
          );
          const leg2Conf = (conn.leg2?.availability || []).some(
            (a: any) => a.travelClass === cls && isSeatConfirmed(a)
          );
          if (leg1Conf && leg2Conf) {
            counts[cls] = (counts[cls] || 0) + 1;
          }
        } else if (activeTier === "one-confirmed") {
          // In 1-Leg Confirmed: that class must have confirmed seats on at least 1 leg!
          const leg1Conf = (conn.leg1?.availability || []).some(
            (a: any) => a.travelClass === cls && isSeatConfirmed(a)
          );
          const leg2Conf = (conn.leg2?.availability || []).some(
            (a: any) => a.travelClass === cls && isSeatConfirmed(a)
          );
          if (leg1Conf || leg2Conf) {
            counts[cls] = (counts[cls] || 0) + 1;
          }
        } else {
          // In Next Trains: class must be available on both legs
          const leg1Has = (conn.leg1?.availability || []).some((a: any) => a.travelClass === cls);
          const leg2Has = (conn.leg2?.availability || []).some((a: any) => a.travelClass === cls);
          if (leg1Has && leg2Has) {
            counts[cls] = (counts[cls] || 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [hubFilteredConnections, activeTier]);

  const activeClassFilters = useMemo(() => {
    return CLASS_FILTER_ORDER.filter((cls) => (classCounts[cls] || 0) > 0);
  }, [classCounts]);

  // 5. Compute layover slot counts
  const layoverCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "same-train": 0,
      "lt-2": 0,
      "2-4": 0,
      "4-8": 0,
      "8-12": 0,
    };
    for (const conn of hubFilteredConnections) {
      if (conn.isSameTrain) counts["same-train"]++;
      const m = conn.layoverMinutes ?? 0;
      if (!conn.isSameTrain && m <= 120) counts["lt-2"]++;
      if (!conn.isSameTrain && m > 120 && m <= 240) counts["2-4"]++;
      if (!conn.isSameTrain && m > 240 && m <= 480) counts["4-8"]++;
      if (!conn.isSameTrain && m > 480 && m <= 720) counts["8-12"]++;
    }
    return counts;
  }, [hubFilteredConnections]);

  // 6. Final filtered connections with 3-tier persona sorting & Option A Station Priority
  const filteredConnections = useMemo(() => {
    const list = hubFilteredConnections.filter((conn) => {
      if (selectedLayoverSlot !== "all") {
        if (selectedLayoverSlot === "same-train") {
          if (!conn.isSameTrain) return false;
        } else {
          if (conn.isSameTrain) return false;
          const slot = LAYOVER_SLOTS.find((s) => s.id === selectedLayoverSlot);
          if (slot) {
            const m = conn.layoverMinutes ?? 0;
            if (m < slot.minMinutes || m > slot.maxMinutes) return false;
          }
        }
      }
      if (selectedClass !== "all") {
        if (activeTier === "confirmed") {
          const leg1Conf = (conn.leg1?.availability || []).some(
            (a: any) => a.travelClass === selectedClass && isSeatConfirmed(a)
          );
          const leg2Conf = (conn.leg2?.availability || []).some(
            (a: any) => a.travelClass === selectedClass && isSeatConfirmed(a)
          );
          if (!leg1Conf || !leg2Conf) return false;
        } else if (activeTier === "one-confirmed") {
          const leg1Conf = (conn.leg1?.availability || []).some(
            (a: any) => a.travelClass === selectedClass && isSeatConfirmed(a)
          );
          const leg2Conf = (conn.leg2?.availability || []).some(
            (a: any) => a.travelClass === selectedClass && isSeatConfirmed(a)
          );
          if (!leg1Conf && !leg2Conf) return false;
        } else {
          const leg1Has = (conn.leg1?.availability || []).some((a: any) => a.travelClass === selectedClass);
          const leg2Has = (conn.leg2?.availability || []).some((a: any) => a.travelClass === selectedClass);
          if (!leg1Has || !leg2Has) return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const reqSrc = (data?.source || "").trim().toUpperCase();

      // =========================================================================
      // TAB 3: "confirmed" (Both Confirmed Seats)
      // Users specifically want guaranteed confirmed berths with minimal layover & fast travel time.
      // Same-train confirmed split journeys get top priority.
      // =========================================================================
      if (activeTier === "confirmed") {
        const aSameConfirmed = a.isSameTrain && (a.tier === "CONFIRMED_SEATS" || a.hasConfirmedSeats);
        const bSameConfirmed = b.isSameTrain && (b.tier === "CONFIRMED_SEATS" || b.hasConfirmedSeats);
        if (aSameConfirmed && !bSameConfirmed) return -1;
        if (bSameConfirmed && !aSameConfirmed) return 1;

        if (a.isSameTrain && !b.isSameTrain) return -1;
        if (b.isSameTrain && !a.isSameTrain) return 1;

        // Station Priority (Option A): user's requested terminal first
        const aIsExact = Boolean(reqSrc && a.leg1?.fromStnCode?.toUpperCase() === reqSrc);
        const bIsExact = Boolean(reqSrc && b.leg1?.fromStnCode?.toUpperCase() === reqSrc);
        if (aIsExact && !bIsExact) return -1;
        if (bIsExact && !aIsExact) return 1;

        if ((a.layoverMinutes ?? 0) !== (b.layoverMinutes ?? 0)) {
          return (a.layoverMinutes ?? 0) - (b.layoverMinutes ?? 0);
        }
        return (a.totalDurationMinutes ?? 0) - (b.totalDurationMinutes ?? 0);
      }

      // =========================================================================
      // TAB 2: "one-confirmed" (1-Leg Confirmed - 80% General Public Users)
      // Dynamic Leg 1 Distance Coverage Ratio (Highest first: Prayagraj 80% > Lucknow 62% > Kanpur 56%)
      // =========================================================================
      if (activeTier === "one-confirmed") {
        const d1A = a.leg1?.distance || 0;
        const totalA = a.totalDistance || (d1A + (a.leg2?.distance || 0));
        const ratioA = totalA > 0 ? d1A / totalA : 0;

        const d1B = b.leg1?.distance || 0;
        const totalB = b.totalDistance || (d1B + (b.leg2?.distance || 0));
        const ratioB = totalB > 0 ? d1B / totalB : 0;

        // Group by coverage ratio (significant threshold: 5% difference)
        if (Math.abs(ratioA - ratioB) >= 0.05) {
          return ratioB - ratioA; // Higher coverage ratio first! E.g. PRYJ (80%) before CNB (56%)
        }

        // Within same coverage tier, Station Priority (Option A): requested station first
        const aIsExact = Boolean(reqSrc && a.leg1?.fromStnCode?.toUpperCase() === reqSrc);
        const bIsExact = Boolean(reqSrc && b.leg1?.fromStnCode?.toUpperCase() === reqSrc);
        if (aIsExact && !bIsExact) return -1;
        if (bIsExact && !aIsExact) return 1;

        // Then shortest layover then duration
        if ((a.layoverMinutes ?? 0) !== (b.layoverMinutes ?? 0)) {
          return (a.layoverMinutes ?? 0) - (b.layoverMinutes ?? 0);
        }
        return (a.totalDurationMinutes ?? 0) - (b.totalDurationMinutes ?? 0);
      }

      // =========================================================================
      // TAB 1: "all" (Next Trains / Immediate Departure)
      // Strictly Departure Time (Earliest First) + Option A Station Priority
      // (NO forced isSameTrain override!)
      // =========================================================================
      // 1. Station Priority (Option A): User requested station (e.g. NDLS) first
      const aIsExact = Boolean(reqSrc && a.leg1?.fromStnCode?.toUpperCase() === reqSrc);
      const bIsExact = Boolean(reqSrc && b.leg1?.fromStnCode?.toUpperCase() === reqSrc);
      if (aIsExact && !bIsExact) return -1;
      if (bIsExact && !aIsExact) return 1;

      // 2. Strictly Departure Time (Earliest First: 04:20 ➔ 06:10 ➔ 07:30 ➔ ...)
      const depA = parseDepartureMinutes(a.leg1?.departureTime);
      const depB = parseDepartureMinutes(b.leg1?.departureTime);
      if (depA !== depB) {
        return depA - depB;
      }
      return (a.layoverMinutes ?? 0) - (b.layoverMinutes ?? 0);
    });
  }, [hubFilteredConnections, selectedOrigin, selectedLayoverSlot, selectedClass, activeTier, data?.source]);

  const handleToggleSave = async () => {
    if (isSaving || !data?.source || !data?.destination) return;
    setIsSaving(true);
    try {
      await toggleRoute(data.source, data.destination);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="my-3 font-sans space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5 text-sky-400">
          <GitMerge className="w-4 h-4 text-sky-400" />
          {liveConnections.length} Connecting Routes ({formatStationDisplay(data.source)} → Hub → {formatStationDisplay(data.destination)})
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline mr-1 text-slate-400">Date: {data.date}</span>
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label={isRouteSaved ? "Remove from saved journeys" : "Save this route to favorites"}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer whitespace-nowrap shrink-0 ${
              isRouteSaved
                ? "bg-emerald-950 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/70"
            }`}
          >
            {isRouteSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline text-emerald-300">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Route"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Three-Window Architecture: Next Trains vs 1-Leg Confirmed (80% Users) vs Both Confirmed */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 mx-1">
        <button
          type="button"
          onClick={() => {
            setActiveTier("all");
            setSelectedHub("all");
            setSelectedOrigin("all");
          }}
          className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTier === "all"
              ? "bg-sky-600 text-white shadow-sm shadow-sky-900/50"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Next Trains</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/80 text-sky-200 shrink-0">
            {liveConnections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTier("one-confirmed");
            setSelectedHub("all");
            setSelectedOrigin("all");
          }}
          className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTier === "one-confirmed"
              ? "bg-amber-600 text-white shadow-sm shadow-amber-900/50"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <TrainFront className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1-Leg Confirmed (80%)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/80 text-amber-200 shrink-0">
            {oneConfirmedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTier("confirmed");
            setSelectedHub("all");
            setSelectedOrigin("all");
          }}
          className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTier === "confirmed"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Both Confirmed</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/80 text-emerald-200 shrink-0">
            {totalConfirmedCount}
          </span>
        </button>
      </div>

      {/* Last-Mile Addon for Rural Branch Railheads (e.g. BUF -> ROU, BXLL -> CPU) */}
      {data.lastMileAddon && <ConnectingLastMileAddon addon={data.lastMileAddon} />}

      {/* IRCTC Linking Pro-Tip Banner */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-sky-950/30 border border-sky-850/60 text-[11px] text-sky-200/90 leading-relaxed mx-1">
        <span className="text-sky-400 shrink-0 font-bold">💡 Pro-Tip:</span>
        <span>
          Book via IRCTC&apos;s <strong className="text-sky-100 font-semibold">&ldquo;Connecting Journey Booking&rdquo;</strong> to link both PNRs. If Leg 1 is delayed causing a missed connection, you get a 100% full refund on Leg 2!
        </span>
      </div>

      {/* Boarding Station Filter Pills (Option A Priority) */}
      {availableOrigins.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs px-1 no-scrollbar scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Boarding:</span>
          <button
            type="button"
            onClick={() => setSelectedOrigin("all")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
              selectedOrigin === "all"
                ? "bg-sky-950 text-sky-300 border-sky-700 font-semibold"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            All Terminals ({tierConnections.length})
          </button>
          {availableOrigins.map(([code, name]) => {
            const count = tierConnections.filter((c) => c.leg1?.fromStnCode === code).length;
            const displayName = formatStationDisplay(code, name);
            const isExact = Boolean(data?.source && code.toUpperCase() === data.source.toUpperCase());
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedOrigin(code)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
                  selectedOrigin === code
                    ? "bg-sky-950 text-sky-300 border-sky-700 font-semibold"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {isExact ? `★ ${displayName}` : displayName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Hub Filter Pills */}
      {availableHubs.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs px-1 no-scrollbar scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Filter Hub:</span>
          <button
            type="button"
            onClick={() => setSelectedHub("all")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
              selectedHub === "all"
                ? "bg-sky-950 text-sky-300 border-sky-700 font-semibold"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            All ({tierConnections.length})
          </button>
          {availableHubs.map(([code, name]) => {
            const count = tierConnections.filter((c) => c.hubStationCode === code).length;
            const displayName = formatStationDisplay(code, name);
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedHub(code)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
                  selectedHub === code
                    ? "bg-sky-950 text-sky-300 border-sky-700 font-semibold"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {displayName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Class Matching Filter Pills */}
      {activeClassFilters.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs px-1 no-scrollbar scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Class Match:</span>
          <button
            type="button"
            onClick={() => setSelectedClass("all")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
              selectedClass === "all"
                ? "bg-indigo-950 text-indigo-300 border-indigo-700 font-semibold"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            All Classes ({hubFilteredConnections.length})
          </button>
          {activeClassFilters.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
                selectedClass === cls
                  ? "bg-indigo-950 text-indigo-300 border-indigo-700 font-semibold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {cls} ({classCounts[cls]})
            </button>
          ))}
        </div>
      )}

      {/* Layover Duration Slot Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs px-1 no-scrollbar scrollbar-none">
        <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-400" />
          Layover:
        </span>
        <button
          type="button"
          onClick={() => setSelectedLayoverSlot("all")}
          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer shrink-0 ${
            selectedLayoverSlot === "all"
              ? "bg-amber-950 text-amber-300 border-amber-700 font-semibold"
              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          All ({hubFilteredConnections.length})
        </button>
        {LAYOVER_SLOTS.map((slot) => {
          const count = layoverCounts[slot.id] || 0;
          const isSelected = selectedLayoverSlot === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={count === 0}
              onClick={() => setSelectedLayoverSlot(slot.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition shrink-0 ${
                count === 0
                  ? "bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed opacity-50"
                  : isSelected
                  ? "bg-amber-950 text-amber-300 border-amber-700 font-semibold cursor-pointer"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 cursor-pointer"
              }`}
            >
              {slot.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Route Cards List */}
      <div className="grid gap-3 max-h-[480px] overflow-y-auto pr-1">
        {filteredConnections.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>
              {isToday && (data?.connections?.length || 0) > 0 && liveConnections.length === 0
                ? "All connecting departures for today have passed. Please check tomorrow or an upcoming journey date."
                : activeTier === "confirmed"
                ? "No confirmed seats found on both legs. Switch to 'All Routes & Mix' tab to view running trains and unreserved options."
                : "No connecting routes found matching the selected filters."}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTier("all");
                setSelectedHub("all");
                setSelectedClass("all");
                setSelectedLayoverSlot("all");
              }}
              className="text-sky-400 hover:underline cursor-pointer font-medium"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredConnections.map((conn, idx) => (
            <ConnectingRouteItem
              key={idx}
              conn={conn}
              idx={idx}
              source={data.source}
              destination={data.destination}
              date={data.date}
              selectedClass={selectedClass}
              copiedIdx={copiedIdx}
              setCopiedIdx={setCopiedIdx}
            />
          ))
        )}
      </div>
    </div>
  );
});
