"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Train, SearchResult } from "@/src/types";
import { TrainFront, Clock, Bookmark, BookmarkCheck, Share2, Copy, CheckCircle2 } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";
import { useCurrentISTTime, isTodayJourney, partitionTrainsByTime, parseDepartureMinutes } from "./trainTimeHelper";
import { TrainCardItem } from "./TrainCardItem";
import { TerminalFilterPills } from "./TerminalFilterPills";
import { ClassFilterPills } from "./ClassFilterPills";
import { useSavedRoutes } from "@/src/hooks/useSavedRoutes";
import { formatTrainListShareMessage, openWhatsAppShare, copyShareText } from "@/src/utils/shareRouteHelper";
import { ConnectingTrainsCard } from "./ConnectingTrainsCard";

interface Props {
  data: SearchResult;
}

export const TrainListCard = React.memo(function TrainListCard({ data }: Props) {
  const { isSaved, toggleRoute } = useSavedRoutes();
  const isRouteSaved = isSaved(data?.source, data?.destination);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<string | "all">("all");
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");

  // Dynamic real-time IST time (refreshes on mount, on focus, and every 60s)
  const { totalMinutes, formattedTime } = useCurrentISTTime();
  const isToday = useMemo(() => isTodayJourney(data?.date), [data?.date]);

  // Partition trains into upcoming and departed based on current time
  const { upcoming, departed, nextTrainNumber } = useMemo(() => {
    return partitionTrainsByTime(data?.trains || [], isToday, totalMinutes);
  }, [data?.trains, isToday, totalMinutes]);

  const hasDepartedTrains = isToday && departed.length > 0;

  // Default to "upcoming" for today's searches with departed trains, otherwise "all"
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "all">(() => {
    return hasDepartedTrains && upcoming.length > 0 ? "upcoming" : "all";
  });

  // Keep filter synced if journey date changes
  useEffect(() => {
    if (hasDepartedTrains && upcoming.length > 0) {
      setTimeFilter("upcoming");
    } else {
      setTimeFilter("all");
    }
  }, [hasDepartedTrains, upcoming.length]);

  const nextTrainRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the next upcoming train within the internal card container (never hijack page scroll)
  useEffect(() => {
    if (timeFilter === "all" && nextTrainRef.current && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        const target = nextTrainRef.current;
        if (container && target) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
          container.scrollTo({
            top: Math.max(0, offsetTop - container.clientHeight / 2 + targetRect.height / 2),
            behavior: "smooth",
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [timeFilter, nextTrainNumber]);

  const handleToggleSave = async () => {
    if (isSaving || !data?.source || !data?.destination) return;
    setIsSaving(true);
    try {
      const res = await toggleRoute(
        data.source,
        data.destination,
        (data as any).filters?.travelClass || undefined
      );
      if (res.error) {
        setSaveFeedback(res.error);
        setTimeout(() => setSaveFeedback(null), 3000);
      }
    } catch {
      setSaveFeedback("Network error");
      setTimeout(() => setSaveFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getRouteShareText = () => {
    const originText = formatStationDisplay(data.source);
    const destText = formatStationDisplay(data.destination);
    const count = data.trainCount ?? data.trains?.length ?? 0;
    const trainsToShare = data?.trains || [];
    return formatTrainListShareMessage({
      fromStation: originText,
      toStation: destText,
      date: data.date,
      trainCount: count,
      trains: trainsToShare.map((t) => ({
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        fromStation: t.fromStnCode,
        toStation: t.toStnCode,
        duration: t.durationFormatted || t.duration,
        availability: t.availability?.map((a) => ({
          travelClass: a.travelClass,
          status: a.status,
          fare: a.fare,
        })),
      })),
    });
  };

  if (!data || !data.trains || data.trains.length === 0) {
    if ((data as any).connectingResult && (data as any).connectingResult.connections?.length > 0) {
      return (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-xs text-amber-300">
            No direct trains found for this route. Showing verified 2-leg connecting trains below:
          </div>
          <ConnectingTrainsCard data={(data as any).connectingResult} />
        </div>
      );
    }

    const hasStations = Boolean(data?.source && data?.destination);
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
        {hasStations
          ? `No trains found for ${formatStationDisplay(data.source)} to ${formatStationDisplay(data.destination)}${data?.date ? ` on ${data.date}` : ""}.`
          : "Search result details are summarized in the response above. Enter a new query for live availability."}
      </div>
    );
  }

  const timeFilteredTrains = timeFilter === "upcoming" ? (upcoming.length > 0 ? upcoming : data.trains) : data.trains;
  const terminalFilteredTrains = selectedTerminal === "all"
    ? timeFilteredTrains
    : timeFilteredTrains.filter((t) => t.fromStnCode === selectedTerminal);

  const displayedTrains = useMemo(() => {
    // 1. By default ("All Classes"): strictly sort chronologically by departure time (00:00 -> 23:59)
    if (selectedClass === "all") {
      return [...terminalFilteredTrains].sort((a, b) => {
        return parseDepartureMinutes(a.departureTime) - parseDepartureMinutes(b.departureTime);
      });
    }

    // 2. When specific class selected (e.g. SL, 3A, 2A): filter & sort by Available > RAC > Waiting List > Regret
    const filtered = terminalFilteredTrains.filter((t) => {
      if (Array.isArray(t.availability) && t.availability.length > 0) {
        return t.availability.some((a) => a.travelClass?.toUpperCase() === selectedClass.toUpperCase());
      }
      if (Array.isArray((t as any).classes)) {
        return (t as any).classes.some((c: string) => String(c).toUpperCase() === selectedClass.toUpperCase());
      }
      return false;
    });

    const getStatusPriority = (statusStr: string, seats?: number | null): number => {
      const upper = statusStr.toUpperCase();
      if (upper.includes("NOT AVAILABLE") || upper.includes("REGRET") || upper.includes("CANCEL")) {
        return 4;
      }
      if (upper.startsWith("AVL") || upper.includes("AVAILABLE") || upper.includes("CURR_AVBL") || (seats ?? 0) > 0) {
        return 1;
      }
      if (upper.startsWith("RAC") || upper.includes("RAC")) {
        return 2;
      }
      if (upper.startsWith("WL") || upper.includes("WAITLIST") || upper.includes("WL")) {
        return 3;
      }
      return 4;
    };

    // 4-tier Priority: Available (1) -> RAC (2) -> Waiting List (3) -> Not Available (4)
    return [...filtered].sort((a, b) => {
      const availA = a.availability?.find((x) => x.travelClass?.toUpperCase() === selectedClass.toUpperCase());
      const availB = b.availability?.find((x) => x.travelClass?.toUpperCase() === selectedClass.toUpperCase());

      const rankA = getStatusPriority(String(availA?.status || ""), availA?.seats);
      const rankB = getStatusPriority(String(availB?.status || ""), availB?.seats);
      if (rankA !== rankB) return rankA - rankB;

      // Tie breaker for Available: more seats first, then earlier departure time
      if (rankA === 1) {
        const seatsA = availA?.seats ?? 0;
        const seatsB = availB?.seats ?? 0;
        if (seatsA !== seatsB) return seatsB - seatsA;
        return parseDepartureMinutes(a.departureTime) - parseDepartureMinutes(b.departureTime);
      }

      // Tie breaker for RAC / WL: higher confirmation chance first, then earlier departure time
      if (rankA === 2 || rankA === 3) {
        const chanceA = availA?.confirmChance ?? 0;
        const chanceB = availB?.confirmChance ?? 0;
        if (chanceA !== chanceB) return chanceB - chanceA;
        return parseDepartureMinutes(a.departureTime) - parseDepartureMinutes(b.departureTime);
      }

      // Fallback tie breaker: departure time
      return parseDepartureMinutes(a.departureTime) - parseDepartureMinutes(b.departureTime);
    });
  }, [terminalFilteredTrains, selectedClass]);

  return (
    <div className="my-3 space-y-3 font-sans">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-railway-400">
            <TrainFront className="w-4 h-4 text-sky-400" />
            {data.trainCount ?? data.trains.length} Trains ({formatStationDisplay(data.source)} → {formatStationDisplay(data.destination)}
            {data.trains[0]?.distance ? ` · ${data.trains[0].distance} km` : ""})
          </span>
          {typeof data.lowestTrainFare === "number" && data.lowestTrainFare > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
              From ₹{data.lowestTrainFare}
            </span>
          )}
          {(data.sourceCityHasWifi || data.destinationCityHasWifi) && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-950/60 text-sky-400 border border-sky-800/60">
              📶 Station Wi-Fi
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline mr-1 text-slate-400">Date: {data.date}</span>

          {/* Save Route Button - Icon on Mobile, Icon + Label on Desktop */}
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label={isRouteSaved ? "Remove from saved journeys" : "Save this route to favorites"}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer whitespace-nowrap shrink-0 ${
              isRouteSaved
                ? "bg-emerald-950 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60"
                : saveFeedback
                ? "bg-rose-950 text-rose-300 border-rose-800/60"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/70"
            }`}
            title={isRouteSaved ? "Saved in Journeys (Click to remove)" : "Save Route to Saved Journeys"}
          >
            {isRouteSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline text-emerald-300">Saved</span>
              </>
            ) : saveFeedback ? (
              <span className="text-[10px]">{saveFeedback}</span>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Route"}</span>
              </>
            )}
          </button>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={() => openWhatsAppShare(getRouteShareText())}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/50 transition cursor-pointer whitespace-nowrap shrink-0"
            title="Share route on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={async () => {
              await copyShareText(getRouteShareText());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer whitespace-nowrap shrink-0 ${
              copied
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/70"
            }`}
            title={copied ? "Copied to clipboard!" : "Copy route details"}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline text-emerald-300 text-[10px]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Multi-Terminal Metro Cluster Filter Pills */}
      <TerminalFilterPills
        trains={data.trains}
        selectedTerminal={selectedTerminal}
        onSelectTerminal={setSelectedTerminal}
      />

      {/* Travel Class Filter Pills (SL, 3A, 2A, etc. with availability indicator) */}
      <ClassFilterPills
        trains={terminalFilteredTrains}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
      />

      {displayedTrains.length === 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
          No trains found for class <span className="font-bold text-emerald-400">{selectedClass}</span>. Click &quot;All Classes&quot; to view all options.
        </div>
      )}

      {/* Smart Time Filter Tabs (when searching today and some trains departed) */}
      {hasDepartedTrains && (
        <div className="flex items-center justify-between gap-2 px-1 text-xs">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setTimeFilter("upcoming")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                timeFilter === "upcoming"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                timeFilter === "all"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Trains ({data.trains.length})
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>IST: {formattedTime}</span>
          </div>
        </div>
      )}

      {/* Train List Container with Auto-Scroll Ref */}
      <div
        ref={scrollContainerRef}
        className="grid gap-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin"
      >
        {displayedTrains.map((train: Train) => {
          const isDeparted = isToday && departed.some((d) => d.trainNumber === train.trainNumber);
          const isNextUpcoming = isToday && train.trainNumber === nextTrainNumber;

          return (
            <React.Fragment key={train.trainNumber}>
              {/* Current Time Divider when viewing All Trains */}
              {timeFilter === "all" && isNextUpcoming && departed.length > 0 && (
                <div
                  ref={nextTrainRef}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-semibold shadow-md scroll-mt-2"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                    <span>Current Time: {formattedTime} IST</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400/90 bg-sky-900/50 px-2 py-0.5 rounded border border-sky-700/50">
                    Upcoming Departures Below ↓
                  </span>
                </div>
              )}

              <TrainCardItem
                train={train}
                isDeparted={isDeparted}
                isNextUpcoming={isNextUpcoming}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* Informative footer note if upcoming filter is active */}
      {timeFilter === "upcoming" && hasDepartedTrains && (
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>
            Showing {upcoming.length} upcoming trains for today ({departed.length} departed).
          </span>
          <button
            type="button"
            onClick={() => setTimeFilter("all")}
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 font-medium cursor-pointer"
          >
            Show all {data.trains.length} trains
          </button>
        </div>
      )}
    </div>
  );
});
