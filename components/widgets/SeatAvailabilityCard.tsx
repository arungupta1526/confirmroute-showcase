"use client";

import React, { useState } from "react";
import { SearchResult, Train } from "@/src/types";
import { TrainFront, Ticket, Sparkles, CheckCircle2, Clock, IndianRupee, Bookmark, BookmarkCheck, Share2, Copy, Utensils } from "lucide-react";
import { formatStationDisplay, formatDateWithWeekday, parseRunningDays } from "./stationHelper";
import { formatDualTime } from "./trainTimeHelper";
import { formatTrainShareMessage, openWhatsAppShare, copyShareText } from "@/src/utils/shareRouteHelper";
import { useSavedRoutes } from "@/src/hooks/useSavedRoutes";

interface Props {
  data: SearchResult | (Partial<Train> & { trains?: Train[]; train?: Train; date?: string; source?: string; destination?: string; quota?: string });
}

export const SeatAvailabilityCard = React.memo(function SeatAvailabilityCard({ data }: Props) {
  const { isSaved, toggleRoute } = useSavedRoutes();
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  // Handles both a SearchResult with 1 train or direct train object
  const raw = data as (SearchResult & { train?: Train; trainNumber?: string; source?: string; destination?: string; quota?: string });
  const train: Train | undefined = raw.trains?.[0] || raw.train || (raw.trainNumber ? (data as unknown as Train) : undefined);

  if (!train) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        Seat availability details unavailable.
      </div>
    );
  }

  const activeQuota = raw.quota || (train.availability && train.availability[0]?.quota) || "GN";
  const origin = train.fromStnCode || raw.source || "";
  const destination = train.toStnCode || raw.destination || "";
  const isRouteSaved = isSaved(origin, destination);

  const handleToggleSave = async () => {
    if (isSaving || !origin || !destination) return;
    setIsSaving(true);
    try {
      const topAvail = train.availability?.[0];
      const res = await toggleRoute(origin, destination, topAvail?.travelClass);
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

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-md shadow-black/20">
      {/* Train Header */}
      <div className="border-b border-slate-800 pb-3 space-y-2">
        {/* Top Row: Train Identity + Rating on Left / Actions on Right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
              <TrainFront className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="font-mono font-bold text-sky-300 shrink-0">#{train.trainNumber}</span>
              <span className="text-slate-500 shrink-0">·</span>
              <span className="truncate font-semibold text-slate-100">{train.trainName}</span>
              {train.hasPantry && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50 flex items-center gap-1 shrink-0 ml-1">
                  <Utensils className="w-2.5 h-2.5" /> Pantry
                </span>
              )}
              {train.trainRating != null && !isNaN(Number(train.trainRating)) && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[10px] font-semibold shrink-0 ml-1">
                  ★ {Number(train.trainRating).toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Save Route, WhatsApp, Copy */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={isSaving}
              aria-label={isRouteSaved ? "Remove from saved journeys" : "Save this journey to favorites"}
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

            <button
              type="button"
              onClick={() => {
                const topAvail = train.availability?.[0];
                const msg = formatTrainShareMessage({
                  trainNumber: train.trainNumber,
                  trainName: train.trainName,
                  fromStation: formatStationDisplay(train.fromStnCode || data.source, train.fromStnName),
                  toStation: formatStationDisplay(train.toStnCode || data.destination, train.toStnName),
                  date: data.date,
                  departureTime: train.departureTime,
                  arrivalTime: train.arrivalTime,
                  travelClass: topAvail?.travelClass,
                  status: topAvail?.status,
                  confirmationChance: topAvail?.confirmChance ?? undefined,
                  fare: topAvail?.fare != null ? Number(topAvail.fare) : undefined,
                });
                openWhatsAppShare(msg);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/50 transition cursor-pointer whitespace-nowrap shrink-0"
              title="Share route on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const topAvail = train.availability?.[0];
                const msg = formatTrainShareMessage({
                  trainNumber: train.trainNumber,
                  trainName: train.trainName,
                  fromStation: formatStationDisplay(train.fromStnCode || data.source, train.fromStnName),
                  toStation: formatStationDisplay(train.toStnCode || data.destination, train.toStnName),
                  date: data.date,
                  departureTime: train.departureTime,
                  arrivalTime: train.arrivalTime,
                  travelClass: topAvail?.travelClass,
                  status: topAvail?.status,
                  confirmationChance: topAvail?.confirmChance ?? undefined,
                  fare: topAvail?.fare != null ? Number(topAvail.fare) : undefined,
                });
                await copyShareText(msg);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer whitespace-nowrap shrink-0 ${
                copied
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/70"
              }`}
              title={copied ? "Copied to clipboard!" : "Copy train details"}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 text-[10px]">Copied!</span>
                </>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Metadata Bar: Station Route + Distance + Duration + Date + Quota */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap pl-0.5">
          <span className="font-semibold text-slate-200 inline-flex items-center flex-wrap">
            <span>{formatStationDisplay(train.fromStnCode || data.source, train.fromStnName)}</span>
            <span className="text-slate-500 mx-1.5 font-normal">→</span>
            <span>{formatStationDisplay(train.toStnCode || data.destination, train.toStnName)}</span>
          </span>
          {(train.durationFormatted || train.duration) && (
            <>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                {train.durationFormatted || train.duration}
              </span>
            </>
          )}
          {train.distance && (
            <>
              <span className="text-slate-600">·</span>
              <span>{train.distance} km</span>
            </>
          )}
          {data.date && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{formatDateWithWeekday(data.date) || data.date}</span>
            </>
          )}
          {activeQuota && (
            <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 text-[10px] font-mono border border-sky-800/50 shrink-0">
              {activeQuota} Quota
            </span>
          )}
          {train.runningDays && (
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-slate-500 mr-0.5">Runs:</span>
              {parseRunningDays(train.runningDays).map((day, dIdx) => (
                <span
                  key={dIdx}
                  title={day.fullName}
                  className={`w-3.5 h-3.5 flex items-center justify-center rounded text-[8px] font-bold ${
                    day.runs
                      ? "bg-sky-950 text-sky-300 border border-sky-800/50"
                      : "text-slate-600 bg-slate-900/40"
                  }`}
                >
                  {day.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timings */}
      <div className="flex items-center justify-between px-2.5 text-xs bg-slate-900/40 py-2 rounded-lg border border-slate-800/50">
        <div className="max-w-[155px] sm:max-w-[200px]">
          <span className="font-bold text-slate-200">{formatDualTime(train.departureTime)}</span>
          <div className="text-[10px] text-slate-400 truncate">
            {formatStationDisplay(train.fromStnCode || data.source, train.fromStnName)}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{train.durationFormatted || train.duration || "Direct"}</span>
        </div>
        <div className="text-right max-w-[155px] sm:max-w-[200px]">
          <span className="font-bold text-slate-200">{formatDualTime(train.arrivalTime)}</span>
          <div className="text-[10px] text-slate-400 truncate">
            {formatStationDisplay(train.toStnCode || data.destination, train.toStnName)}
          </div>
        </div>
      </div>

      {/* Class Availabilities Grid */}
      {train.availability && train.availability.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-sky-400" />
            <span>Live Class Availabilities</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {train.availability.map((cls, idx) => {
              const statusStr = String(cls.status || "").toUpperCase();
              const isNotAvailable =
                statusStr.includes("NOT AVAILABLE") ||
                statusStr.includes("REGRET") ||
                statusStr.includes("CANCEL") ||
                statusStr.includes("NOT_AVAILABLE");
              const isAvail =
                !isNotAvailable &&
                (statusStr.includes("AVL") ||
                  statusStr.includes("AVAILABLE") ||
                  statusStr.includes("CURR_AVBL") ||
                  (cls.seats ?? 0) > 0);
              const isRac = !isNotAvailable && statusStr.includes("RAC");
              const isWl = !isNotAvailable && statusStr.includes("WL");

              const pillColor = isAvail
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : isRac
                ? "bg-sky-950/70 border-sky-700/80 text-sky-300"
                : isWl
                ? "bg-amber-950/40 border-amber-900/60 text-amber-300"
                : isNotAvailable
                ? "bg-rose-950/30 border-rose-900/50 text-rose-400/90"
                : "bg-slate-900 border-slate-800 text-slate-300";

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between ${pillColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{cls.travelClass}</span>
                    {cls.fare != null && (
                      <span className="text-[11px] flex items-center font-medium opacity-90">
                        <IndianRupee className="w-2.5 h-2.5 inline" />
                        {cls.fare}
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-xs mt-1.5 tracking-tight">{cls.status || "Check"}</div>
                  {cls.seats != null && cls.seats > 0 && cls.seats <= 5 && (
                    <div className="text-[10px] mt-1 text-amber-300 font-bold flex items-center gap-1">
                      <span>⚡ Only {cls.seats} left!</span>
                    </div>
                  )}
                  {cls.confirmChance != null && cls.confirmChance > 0 && (
                    <div className="text-[10px] mt-1 text-sky-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{cls.confirmChance}% Confirm</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Footer: 60-Day Trend Button */}
      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400">Planning advance travel?</span>
        <button
          type="button"
          onClick={() => {
            const prompt = `Show 60-day availability calendar for train ${train.trainNumber} from ${origin} to ${destination}`;
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("confirmroute:send-prompt", { detail: { prompt } })
              );
            }
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 transition cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>View 60-Day Trend</span>
        </button>
      </div>
    </div>
  );
});
