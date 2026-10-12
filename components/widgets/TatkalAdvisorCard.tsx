"use client";

import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert, Wallet, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import type { TatkalAdvisorResult } from "@/src/types";
import { formatStationDisplay } from "./stationHelper";

interface TatkalAdvisorCardProps {
  data: TatkalAdvisorResult;
}

export const TatkalAdvisorCard: React.FC<TatkalAdvisorCardProps> = ({ data }) => {
  if (!data || !data.bookingWindow) return null;

  const { bookingWindow, preparationChecklist, rulesAndRefundPolicy, fallbackStrategies } = data;
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(bookingWindow.bookingOpenIso).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [bookingWindow.bookingOpenIso]);

  return (
    <div className="w-full my-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-xl text-slate-100 text-xs sm:text-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              Tatkal Strategy Advisor
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal border border-amber-500/30">
                Train #{data.trainNumber} • {data.travelClass}
              </span>
            </h3>
            {data.fromStation && data.toStation && (
              <p className="text-xs text-slate-400 mt-0.5">
                {formatStationDisplay(data.fromStation)} → {formatStationDisplay(data.toStation)}
              </p>
            )}
          </div>
        </div>

        {/* Countdown Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700">
          <span className="text-[11px] text-slate-400">Opens:</span>
          <span className="font-mono font-bold text-amber-400">
            {bookingWindow.bookingDate} @ {bookingWindow.bookingTime}
          </span>
        </div>
      </div>

      {/* Live Countdown Clock if window is in future */}
      {timeLeft ? (
        <div className="my-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Booking Window Countdown:
          </span>
          <div className="font-mono text-sm sm:text-base font-bold text-amber-300 tracking-wider">
            {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
          </div>
        </div>
      ) : (
        <div className="my-3 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          Tatkal booking window is currently open or past opening time for this date!
        </div>
      )}

      {/* Critical Preparation Checklist */}
      <div className="mt-3 space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Key Tatkal Preparation Rules
        </h4>

        {/* Master list lockout warning */}
        <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-200">Master List Lockout: </span>
            {preparationChecklist.masterListWarning}{" "}
            <span className="underline font-bold">Lockout window: {preparationChecklist.lockoutWindow}</span>
          </div>
        </div>

        {/* Recommended Wallet Method */}
        <div className="p-2.5 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200 text-xs flex items-start gap-2">
          <Wallet className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sky-100 flex items-center gap-2">
              Payment Choice: {preparationChecklist.recommendedPayment.primary}
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">Fastest</span>
            </div>
            <p className="text-sky-300/80 mt-0.5">{preparationChecklist.recommendedPayment.reason}</p>
          </div>
        </div>

        {/* Actionable Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {preparationChecklist.bookingTips.map((tip, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-1.5 text-slate-300 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules and Refund Policy */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-[11px] space-y-1">
        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Official Railway Tatkal Cancellation & Refund Rules:
        </div>
        <p>• {rulesAndRefundPolicy.confirmedRefund}</p>
        <p>• {rulesAndRefundPolicy.waitlistRefund}</p>
        <p>• {rulesAndRefundPolicy.railwayDelayRefund}</p>
      </div>

      {/* Fallback Strategies */}
      {fallbackStrategies && fallbackStrategies.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium">Backup Plan (If Tatkal Exhausts):</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {fallbackStrategies.map((fb, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 cursor-pointer transition-colors"
                title={fb.description}
              >
                {fb.title} <ArrowRight className="h-3 w-3 text-slate-400" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
