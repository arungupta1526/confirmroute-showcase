"use client";

import React, { useState } from "react";
import { Trophy, TrendingUp, Map, Building2, Star } from "lucide-react";

interface LeaderboardItem {
  trainNo?: string;
  name: string;
  trainNumbers?: string;
  metric: number;
  averageRating?: string;
}

interface LeaderboardCategory {
  title: string;
  icon?: string;
  suffix?: string;
  items: LeaderboardItem[];
}

interface Props {
  data: {
    status?: boolean;
    generatedAt?: string;
    leaderboards: LeaderboardCategory[];
  };
}

export const TrainLeaderboardsCard = React.memo(function TrainLeaderboardsCard({ data }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  if (!data || !data.leaderboards || data.leaderboards.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        No railway leaderboard data available.
      </div>
    );
  }

  const activeCat = data.leaderboards[activeTab] || data.leaderboards[0];

  const getTabIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("rated")) return <Star className="w-3.5 h-3.5" />;
    if (t.includes("popular")) return <TrendingUp className="w-3.5 h-3.5" />;
    if (t.includes("zone")) return <Map className="w-3.5 h-3.5" />;
    return <Building2 className="w-3.5 h-3.5" />;
  };

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">National Railway Leaderboards</h4>
            <p className="text-[11px] text-slate-400">Top ranked trains & railway operations across India</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {data.leaderboards.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === idx
                ? "bg-sky-950 text-sky-300 border border-sky-700/60 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            {getTabIcon(cat.title)}
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Ranked Items List */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {(activeCat.items || []).slice(0, 10).map((item, idx) => {
          const trainNumber = item.trainNo || (item as any).train_no;
          const trainNumbers = item.trainNumbers || (item as any).train_numbers;
          const rating = item.averageRating || (item as any).average_rating;
          const suffix = activeCat.suffix || (activeCat.title.toLowerCase().includes("rated") ? " ratings" : "");

          return (
            <div
              key={idx}
              className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-2 text-xs hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    idx === 0
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : idx === 1
                      ? "bg-slate-300 text-slate-950"
                      : idx === 2
                      ? "bg-amber-700 text-slate-100"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1 truncate">
                  <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                    {trainNumber && (
                      <span className="font-mono text-sky-400 text-[11px] shrink-0">#{trainNumber}</span>
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  {trainNumbers && (
                    <div className="text-[10px] text-slate-500 font-mono truncate">{trainNumbers}</div>
                  )}
                </div>
              </div>

              <div className="text-right whitespace-nowrap flex items-center gap-2 shrink-0">
                {rating && (
                  <span className="flex items-center gap-0.5 text-[11px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    <Star className="w-3 h-3 fill-emerald-400" />
                    {rating}
                  </span>
                )}
                <span className="font-mono font-medium text-slate-300 text-xs">
                  {item.metric?.toLocaleString()} {suffix}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
