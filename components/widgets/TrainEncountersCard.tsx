"use client";

import React, { useState } from "react";
import { ArrowRight, Clock, MapPin, Zap, ShieldAlert, FastForward, Repeat } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";

interface EncounterStationRef {
  code: string;
  name: string;
}

interface EncounterItem {
  trainNo: string;
  trainName: string;
  runningDays?: string;
  runningDaysLabel?: string;
  encounterDay: number;
  encounterTime: string;
  atStation: EncounterStationRef;
  between?: {
    from: string;
    fromName: string;
    to: string;
    toName: string;
  };
  sharedRoute?: {
    from: string;
    to: string;
  };
}

interface Props {
  data: {
    status?: boolean;
    trainNumber: string;
    trainName: string;
    journeyStart?: { day: number; time: string };
    journeyEnd?: { day: number; time: string };
    counts?: {
      overtakenBy: number;
      overtakes: number;
      crossings: number;
    };
    overtakenBy?: EncounterItem[];
    overtakes?: EncounterItem[];
    crossingsSample?: EncounterItem[];
    crossings?: EncounterItem[];
    initialTab?: "overtaken_by" | "overtakes" | "crossings";
  };
}

export const TrainEncountersCard = React.memo(function TrainEncountersCard({ data }: Props) {
  const [activeTab, setActiveTab] = useState<"overtaken_by" | "overtakes" | "crossings">(() => {
    if (data?.initialTab) return data.initialTab;
    if (data?.counts?.overtakenBy && data.counts.overtakenBy > 0) return "overtaken_by";
    if (data?.counts?.overtakes && data.counts.overtakes > 0) return "overtakes";
    if (data?.counts?.crossings && data.counts.crossings > 0) return "crossings";
    return "overtaken_by";
  });

  if (!data || !data.counts) {
    return null;
  }

  const overtakenBy = data.overtakenBy || [];
  const overtakes = data.overtakes || [];
  const crossings = data.crossingsSample || data.crossings || [];

  const currentList =
    activeTab === "overtaken_by"
      ? overtakenBy
      : activeTab === "overtakes"
      ? overtakes
      : crossings;

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">
              {data.trainNumber} - {data.trainName}
            </h4>
            <p className="text-[11px] text-slate-400">
              Scheduled Route Encounters, Priority Passes & Crossings
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("overtaken_by")}
          className={`p-2.5 rounded-xl border text-left transition ${
            activeTab === "overtaken_by"
              ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Overtaken By</span>
          </div>
          <div className="text-lg font-black mt-0.5 text-amber-400">
            {data.counts.overtakenBy}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overtakes")}
          className={`p-2.5 rounded-xl border text-left transition ${
            activeTab === "overtakes"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <FastForward className="w-3.5 h-3.5 text-emerald-400" />
            <span>Overtakes</span>
          </div>
          <div className="text-lg font-black mt-0.5 text-emerald-400">
            {data.counts.overtakes}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("crossings")}
          className={`p-2.5 rounded-xl border text-left transition ${
            activeTab === "crossings"
              ? "bg-sky-950/40 border-sky-500/40 text-sky-300"
              : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Repeat className="w-3.5 h-3.5 text-sky-400" />
            <span>Crossings</span>
          </div>
          <div className="text-lg font-black mt-0.5 text-sky-400">
            {data.counts.crossings}
          </div>
        </button>
      </div>

      {/* Sample count notice for crossings */}
      {activeTab === "crossings" && data.counts.crossings > crossings.length && crossings.length > 0 && (
        <div className="text-[10px] text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <span>Key scheduled route crossings ({crossings.length} shown)</span>
          <span className="text-slate-500 font-mono">Total on route: {data.counts.crossings}</span>
        </div>
      )}

      {/* Encounter List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {currentList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800/60">
            {activeTab === "overtaken_by"
              ? "No trains overtake this train (Highest priority route precedence) ✨"
              : "No encounters in this category."}
          </div>
        ) : (
          currentList.map((item, idx) => (
            <div
              key={`${item.trainNo}-${idx}`}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-mono text-[11px]">
                    {item.trainNo}
                  </span>
                  <span className="truncate max-w-[200px]">{item.trainName}</span>
                </div>
                {item.runningDaysLabel && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400">
                    {item.runningDaysLabel}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>
                    At {formatStationDisplay(item.atStation.name, item.atStation.code)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {item.encounterTime} (Day {item.encounterDay})
                  </span>
                </div>
                {item.sharedRoute && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>Route:</span>
                    <span>{item.sharedRoute.from}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span>{item.sharedRoute.to}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
