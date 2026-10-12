"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Calendar, GitBranch, LayoutGrid, Clock, Radar, Bot, Compass, ArrowRight } from "lucide-react";
import { COACH_LIST, COACH_BERTHS_MAP } from "./coachBerthsData";

export function LandingCapabilities() {
  const [selectedCoach, setSelectedCoach] = useState<string>("B1");
  const coaches = COACH_LIST;
  const activeCoachData = COACH_BERTHS_MAP[selectedCoach] || COACH_BERTHS_MAP["B1"];

  return (
    <section id="capabilities" className="py-16 bg-slate-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Real-Time Data & Advanced Railway AI</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Powerful <span className="text-emerald-400">Features</span> for Every Traveller
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need for a smoother, smarter and stress-free Indian Railways journey.
          </p>
        </div>

        {/* 4 Interactive Feature Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Confirmation Probability Engine */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-5">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate sm:text-clip">Seat Confirmation Prediction</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 sm:line-clamp-none">AI prediction using historical confirmation trends</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0 whitespace-nowrap">
                Live Engine
              </span>
            </div>

            {/* Radial Gauge & Stat Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-white">12301 Rajdhani Express</div>
                <div className="text-[11px] text-slate-400">WL 12 → <strong className="text-emerald-400 font-medium">Predicted: Confirm ✨</strong></div>
                <div className="text-[10px] text-slate-500">Based on 140+ charted departures</div>
              </div>

              {/* Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400"
                    strokeDasharray="87, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-extrabold text-white">87%</span>
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">Chance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 60-Day Availability Calendar */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-5">
            <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate sm:text-clip">60-Day Availability Calendar</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 sm:line-clamp-none">Spot confirmed date clusters across 2 months</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] shrink-0 whitespace-nowrap self-start sm:self-auto pl-10.5 sm:pl-0">
                <span className="flex items-center gap-1 text-emerald-400 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> High</span>
                <span className="flex items-center gap-1 text-amber-400 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Med</span>
                <span className="flex items-center gap-1 text-rose-400 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Low</span>
              </div>
            </div>

            {/* Calendar Mini Heatmap Grid */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Upcoming Travel Dates</span>
                <span className="text-teal-400">October 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="text-slate-400 font-semibold">{d}</span>
                ))}
                {[
                  { day: "12", bg: "bg-slate-800 text-slate-300" },
                  { day: "13", bg: "bg-slate-800 text-slate-300" },
                  { day: "14", bg: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold" },
                  { day: "15", bg: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold" },
                  { day: "16", bg: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold" },
                  { day: "17", bg: "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold" },
                  { day: "18", bg: "bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-2 rounded-lg ${item.bg}`}>
                    {item.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: 2-Leg Smart Route Suggestions */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-5">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate sm:text-clip">2-Leg Smart Break-Journey</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 sm:line-clamp-none">Find alternative connections when direct trains are full</p>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold shrink-0 whitespace-nowrap bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                NDLS → PNBE
              </span>
            </div>

            {/* 2-Leg Routes Visual */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">Leg 1: New Delhi → Prayagraj Jn</div>
                  <div className="text-[10px] text-slate-400 truncate">Leg 2: Prayagraj Jn → Patna Jn</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0 whitespace-nowrap">
                  Higher Chance
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">Leg 1: New Delhi → Mirzapur</div>
                  <div className="text-[10px] text-slate-400 truncate">Leg 2: Mirzapur → Patna Jn</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[10px] font-bold shrink-0 whitespace-nowrap">
                  Good Option
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Coach & Berth Layout Inspector */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate sm:text-clip">Coach & Berth Layout Inspector</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 sm:line-clamp-none">View exact bogie sequence, berth types & vacant seats</p>
                </div>
              </div>
            </div>

            {/* Coach Tab Bar & Berths */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {coaches.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCoach(c)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition shrink-0 ${
                      selectedCoach === c
                        ? "bg-emerald-500 text-slate-950 shadow"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Active Coach Info Banner */}
              <div className="flex items-center justify-between text-[11px] px-1 gap-2">
                <span className="font-semibold text-slate-300 min-w-0 truncate">
                  Coach <strong className="text-white">{selectedCoach}</strong> <span className="text-slate-500">•</span> <span className="text-slate-400">{activeCoachData.type}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 whitespace-nowrap">
                  {activeCoachData.availableCount} Vacant
                </span>
              </div>

              {/* Berths Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
                {activeCoachData.berths.map((b) => (
                  <div
                    key={`${selectedCoach}-${b.num}`}
                    className={`p-1.5 rounded-lg border transition-all duration-200 ${
                      b.status === "available"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-sm shadow-emerald-500/5"
                        : b.status === "rac"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-500"
                    }`}
                  >
                    {b.num}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1 text-emerald-400 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Available</span>
                <span className="flex items-center gap-1 text-amber-400 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> RAC</span>
                <span className="flex items-center gap-1 text-slate-500 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Booked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
