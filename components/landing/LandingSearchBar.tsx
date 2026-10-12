"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, MapPin, ArrowRightLeft, Sparkles, AlertCircle, X } from "lucide-react";
import { StationAutocompleteInput } from "@/components/common/StationAutocompleteInput";

export function LandingSearchBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"avail" | "pnr" | "status" | "connecting">("avail");
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [pnrInput, setPnrInput] = useState("");
  const [trainInput, setTrainInput] = useState("");
  const [error, setError] = useState("");
  const lastStationSelectTimeRef = useRef<number>(0);

  const markStationSelected = () => {
    lastStationSelectTimeRef.current = Date.now();
  };

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    if (error) setError("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Fail-safe ghost click shield: Reject any submission occurring within 450ms of dropdown selection
    if (Date.now() - lastStationSelectTimeRef.current < 450) {
      return;
    }

    if (activeTab === "avail" || activeTab === "connecting") {
      const from = fromStation.trim();
      const to = toStation.trim();

      if (!from && !to) {
        setError("Please enter origin and destination stations.");
        return;
      }
      if (!from) {
        setError("Please enter origin station.");
        return;
      }
      if (!to) {
        setError("Please enter destination station.");
        return;
      }

      const prompt =
        activeTab === "avail"
          ? `Check train seat availability from ${from} to ${to} tomorrow`
          : `Find 2-leg connecting trains from ${from} to ${to}`;

      router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
      return;
    }

    if (activeTab === "pnr") {
      const cleanPnr = pnrInput.replace(/\D/g, "");
      if (!cleanPnr) {
        setError("Please enter your 10-digit IRCTC PNR number.");
        return;
      }
      if (cleanPnr.length !== 10) {
        setError("IRCTC PNR number must be exactly 10 digits.");
        return;
      }
      const prompt = `Check PNR status for ${cleanPnr}`;
      router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
      return;
    }

    if (activeTab === "status") {
      const val = trainInput.trim();
      if (!val) {
        setError("Please enter a 5-digit train number or train name (e.g. 12396 or Rajdhani).");
        return;
      }
      const prompt = `Live running status for ${val}`;
      router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
      return;
    }
  };

  const popularRoutes = [
    { from: "New Delhi (NDLS)", to: "Patna Jn (PNBE)" },
    { from: "Mumbai (MMCT)", to: "Surat (ST)" },
    { from: "Howrah (HWH)", to: "New Delhi (NDLS)" },
    { from: "Bengaluru (SBC)", to: "Chennai (MAS)" },
    { from: "Lucknow (LKO)", to: "Varanasi (BSB)" },
  ];

  return (
    <section id="search" className="py-8 bg-slate-950/80 border-y border-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Mode Tabs (Matched equal width grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 border-b border-slate-800 pb-3">
            {[
              { id: "avail", label: "Check Seat Availability" },
              { id: "connecting", label: "2-Leg Break Journey" },
              { id: "status", label: "Live Running Status" },
              { id: "pnr", label: "PNR Status" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setError("");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all flex items-center justify-center ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-300 hover:text-white bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {activeTab === "pnr" ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={pnrInput}
                      onChange={(e) => {
                        setPnrInput(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter 10-digit IRCTC PNR Number (e.g. 2362606355)"
                      maxLength={10}
                      className={`w-full pl-10 pr-9 py-3 rounded-xl bg-slate-950 border text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition ${
                        error
                          ? "border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30"
                          : "border-slate-700/80 focus:border-emerald-500"
                      }`}
                    />
                    {pnrInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setPnrInput("");
                          if (error) setError("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="Clear PNR"
                        aria-label="Clear PNR"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Check PNR Status</span>
                  </button>
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            ) : activeTab === "status" ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={trainInput}
                      onChange={(e) => {
                        setTrainInput(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter 5-digit Train Number or Name (e.g. 12396 or Rajdhani)"
                      className={`w-full pl-10 pr-9 py-3 rounded-xl bg-slate-950 border text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none transition ${
                        error
                          ? "border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30"
                          : "border-slate-700/80 focus:border-emerald-500"
                      }`}
                    />
                    {trainInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setTrainInput("");
                          if (error) setError("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="Clear train input"
                        aria-label="Clear train input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Track Train Delay</span>
                  </button>
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 lg:grid-cols-7 gap-3 items-center">
                  {/* From Station */}
                  <div className="relative z-30 sm:z-auto sm:col-span-5 lg:col-span-2">
                    <StationAutocompleteInput
                      value={fromStation}
                      onChange={(val) => {
                        setFromStation(val);
                        if (error) setError("");
                      }}
                      onSelect={markStationSelected}
                      hasError={Boolean(error && !fromStation.trim())}
                      placeholder={
                        activeTab === "connecting"
                          ? "Origin (e.g. New Delhi / NDLS)"
                          : "From (e.g. New Delhi / NDLS)"
                      }
                      icon={<MapPin className="w-3.5 h-3.5 text-emerald-400" />}
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center sm:col-span-2 lg:col-span-1">
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
                      title="Swap stations"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* To Station */}
                  <div className="relative z-20 sm:z-auto sm:col-span-5 lg:col-span-2">
                    <StationAutocompleteInput
                      value={toStation}
                      onChange={(val) => {
                        setToStation(val);
                        if (error) setError("");
                      }}
                      onSelect={markStationSelected}
                      hasError={Boolean(error && !toStation.trim())}
                      placeholder={
                        activeTab === "connecting"
                          ? "Destination (e.g. Patna / PNBE)"
                          : "To (e.g. Patna / PNBE)"
                      }
                      icon={<MapPin className="w-3.5 h-3.5 text-cyan-400" />}
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="sm:col-span-12 lg:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Search Trains</span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Popular Searches */}
          <div className="pt-3 mt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Popular:</span>
            {popularRoutes.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => {
                  setError("");
                  setFromStation(r.from);
                  setToStation(r.to);
                  setActiveTab("avail");
                }}
                className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition"
              >
                {r.from.split(" (")[0].replace(" Jn", "")} → {r.to.split(" (")[0].replace(" Jn", "")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
