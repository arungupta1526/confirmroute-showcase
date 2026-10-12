"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  Lock,
  Sparkles,
  ArrowRight,
  Clock,
  TrainFront,
  Search,
  WifiOff,
} from "lucide-react";

interface ToolNoticeCardProps {
  toolName: string;
  result: Record<string, any>;
}

export const TOOL_FRIENDLY_NAMES: Record<string, string> = {
  search_trains: "Train Search",
  get_seat_availability: "Seat Availability",
  get_live_running_status: "Live Running Status",
  get_connecting_trains: "Connecting Trains",
  get_availability_calendar: "Availability Trends",
  get_train_schedule: "Train Route Schedule",
  get_alternate_trains: "Alternate Trains",
  get_train_availability_calendar: "60-Day Availability Calendar",
  get_pnr_status: "PNR Passenger Status",
  getPnrStatus: "PNR Passenger Status",
  get_coach_position: "Coach Layout & Bogie Order",
  get_train_ratings: "Passenger Reviews & Ratings",
  compare_train_fares: "Fare Comparison",
  get_fastest_train: "Fastest Train Finder",
  get_pantry_and_amenities: "Pantry & Amenities",
  get_tatkal_advisor: "Tatkal Advisor",
  get_station_live_board: "Station Live Board",
  get_vacant_chart_berths: "Vacant Chart Berths",
  get_train_leaderboards: "Railway Leaderboards",
  get_train_image: "Train & Loco Photographs",
  get_train_encounters: "Train Encounters & Crossings",
  find_station_code: "Station Code Finder",
  find_nearby_terminal_trains: "Metro Cluster Terminals",
  filter_trains_by_time_window: "Time-Slot Trains",
};

export const ToolNoticeCard = React.memo(function ToolNoticeCard({
  toolName,
  result,
}: ToolNoticeCardProps) {
  const toolLabel = TOOL_FRIENDLY_NAMES[toolName] || toolName;

  // 1. Feature Plan Gate / Daily Cap Exceeded via __cap_blocked
  if (result.__cap_blocked) {
    const rawMsg = typeof result.message === "string" ? result.message : "";
    const cleanMsg = rawMsg
      .replace(/^⚠️\s*/, "")
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    return (
      <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-950 border border-amber-500/30 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
              <span>Plan Feature Gate</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {toolLabel}
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {cleanMsg || `${toolLabel} is not available on your current plan.`}
            </p>
          </div>
        </div>
        <Link
          href="/plan"
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>View Plans & Upgrade</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const rawError = typeof result.error === "string" ? result.error : "";
  const errorLower = rawError.toLowerCase();

  // 2. Quota / Plan limit mentioned in error text
  if (
    errorLower.includes("quota") ||
    errorLower.includes("limit reached") ||
    errorLower.includes("upgrade your plan") ||
    errorLower.includes("plan does not include")
  ) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-950 border border-amber-500/30 shadow-lg text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-amber-200 text-sm">
              Daily Limit Reached · {toolLabel}
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">{rawError}</p>
          </div>
        </div>
        <Link
          href="/plan"
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrade Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // 3. Flushed / Expired PNR
  if (
    (toolName === "get_pnr_status" || toolName === "getPnrStatus") &&
    (errorLower.includes("flushed") || errorLower.includes("not yet generated"))
  ) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-md text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Clock className="w-4 h-4" />
          <span>PNR Expired / Flushed by Railway PRS</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The Indian Railways PRS database has marked this PNR as <strong className="text-amber-300">flushed</strong> (the journey date has already passed) or it has not yet been generated in CRIS records. Please verify the 10-digit number.
        </p>
      </div>
    );
  }

  // 4. Train Not Found
  if (
    errorLower.includes("train not found") ||
    errorLower.includes("invalid train") ||
    errorLower.includes("no schedule found")
  ) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
          <TrainFront className="w-4 h-4" />
          <span>Train Not Found in Railway Timetable</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {rawError || "No active Indian Railways timetable record was found for this train number. Please verify the 5-digit train number."}
        </p>
      </div>
    );
  }

  // 5. Chart Not Yet Prepared
  if (
    errorLower.includes("chart not prepared") ||
    errorLower.includes("charting not completed")
  ) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Clock className="w-4 h-4" />
          <span>Reservation Chart Not Yet Prepared</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {rawError ||
            "First reservation charts are finalized by Indian Railways by 8:00 PM on the previous day for morning trains (05:01–14:00), or 8–10 hours before departure for other trains. The second (final) chart is prepared 30 minutes before departure from the originating station."}
        </p>
      </div>
    );
  }

  // 6. Station Not Recognized
  if (
    errorLower.includes("station") &&
    (errorLower.includes("not found") || errorLower.includes("invalid") || errorLower.includes("unknown"))
  ) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Search className="w-4 h-4" />
          <span>Station Code Not Recognized</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {rawError || "Could not resolve the station name or code. Please check the spelling or provide the official 3-to-4 letter IRCTC station code."}
        </p>
      </div>
    );
  }

  // 7. Network / Busy Gateway
  if (
    errorLower.includes("timeout") ||
    errorLower.includes("network") ||
    errorLower.includes("econnreset") ||
    errorLower.includes("unavailable")
  ) {
    return (
      <div className="my-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <WifiOff className="w-4 h-4" />
          <span>Railway Inquiry Gateway Busy</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The railway inquiry service responded with a temporary timeout or connection delay. Please retry your request in a few moments.
        </p>
      </div>
    );
  }

  // 8. General Railway Service Notice (Catch-all)
  return (
    <div className="my-3 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      <div>
        <div className="font-semibold text-rose-200">
          Railway Service Notice · {toolLabel}
        </div>
        <div className="text-rose-300/90 mt-0.5 leading-relaxed">
          {rawError || "Service temporarily unavailable."}
        </div>
      </div>
    </div>
  );
});
