"use client";

import React from "react";
import { PnrPassengerStatus } from "@/src/types";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

interface Props {
  passenger: PnrPassengerStatus;
  index: number;
}

export type PnrStatusCategory = "CONFIRMED" | "RAC" | "CANCELLED" | "WAITLIST";

export function getStatusCategory(statusRaw: string | undefined | null, coach?: string | null, berth?: string | number | null): PnrStatusCategory {
  const s = String(statusRaw || "").trim().toUpperCase();
  if (s.includes("CAN") || s.includes("MOD") || s.includes("CANCEL")) {
    return "CANCELLED";
  }
  if (s.includes("CNF") || s.includes("CONFIRM") || (Boolean(coach) && Boolean(berth))) {
    return "CONFIRMED";
  }
  if (s.startsWith("RAC") || s.includes(" RAC")) {
    return "RAC";
  }
  return "WAITLIST";
}

export const PnrStatusBadge = React.memo(function PnrStatusBadge({ passenger, index }: Props) {
  const cleanBooking = String(passenger.bookingStatus || "-").replace(/\s+/g, " ").trim();
  const cleanCurrent = String(passenger.currentStatus || cleanBooking || "-").replace(/\s+/g, " ").trim();
  const category = getStatusCategory(cleanCurrent, passenger.coach, passenger.berth);

  const getCategoryStyles = () => {
    switch (category) {
      case "CONFIRMED":
        return {
          badge: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
          label: cleanCurrent,
          tag: "Confirmed",
        };
      case "RAC":
        return {
          badge: "bg-sky-950/80 text-sky-300 border-sky-800/60",
          icon: <ShieldCheck className="w-3 h-3 text-sky-400" />,
          label: cleanCurrent,
          tag: "RAC (Seat Guaranteed)",
        };
      case "CANCELLED":
        return {
          badge: "bg-rose-950/80 text-rose-300 border-rose-800/60",
          icon: <XCircle className="w-3 h-3 text-rose-400" />,
          label: cleanCurrent,
          tag: "Cancelled / Modified",
        };
      case "WAITLIST":
      default:
        return {
          badge: "bg-amber-950/80 text-amber-300 border-amber-800/60",
          icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
          label: cleanCurrent,
          tag: "Waitlisted",
        };
    }
  };

  const style = getCategoryStyles();

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs hover:border-slate-700/80 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px] flex items-center justify-center font-bold">
          {passenger.number || index + 1}
        </span>
        <div>
          <div className="font-medium text-slate-200 flex items-center gap-1.5">
            <span>Booking: {cleanBooking}</span>
          </div>
          {passenger.prediction && (
            <div className="text-[10px] text-sky-400 mt-0.5">
              Prediction: {passenger.prediction}
            </div>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className={`font-semibold px-2.5 py-1 rounded text-[11px] inline-flex items-center gap-1.5 border shadow-sm ${style.badge}`}>
          {style.icon}
          <span>{style.label}</span>
        </div>

        {/* Berth & Coach info with RAC smart fallback */}
        {passenger.coach && passenger.berth ? (
          <div className="text-[10px] text-slate-300 mt-1 font-mono">
            Coach <span className="text-white font-bold">{passenger.coach}</span>, Berth <span className="text-white font-bold">{passenger.berth}</span> {passenger.berthCode ? `(${passenger.berthCode})` : ""}
          </div>
        ) : passenger.berth ? (
          <div className="text-[10px] text-sky-300/90 mt-1 font-mono">
            Seat/RAC No. <span className="text-white font-bold">{passenger.berth}</span> · Coach at charting
          </div>
        ) : passenger.coach ? (
          <div className="text-[10px] text-slate-300 mt-1 font-mono">
            Coach <span className="text-white font-bold">{passenger.coach}</span> · Berth at charting
          </div>
        ) : null}
      </div>
    </div>
  );
});
