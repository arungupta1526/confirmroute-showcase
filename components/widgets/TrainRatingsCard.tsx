"use client";

import React, { useState } from "react";
import { Star, Utensils, Sparkles, Clock, Users, MessageSquareQuote, ChevronDown, ChevronUp } from "lucide-react";
import { formatStationDisplay } from "./stationHelper";

interface Props {
  data: {
    trainNumber?: string;
    trainName?: string;
    source?: string;
    sourceCode?: string;
    sourceName?: string;
    destination?: string;
    destinationCode?: string;
    destinationName?: string;
    totalDuration?: string;
    totalDistance?: number | null;
    ratings?: {
      overall: number | null;
      food: number | null;
      punctuality: number | null;
      cleanliness: number | null;
      ratingCount: number | null;
      writtenReviewCount?: number | null;
      reviews?: Array<{
        authorLabel: string;
        rating: number;
        text: string;
        updatedAt: string;
      }>;
      baseline?: {
        rating: number;
        tier: string;
      } | null;
    };
    ratingText?: string;
  };
}

function RatingBar({ label, value, icon: Icon, color }: { label: string; value: number | null; icon: any; color: string }) {
  const score = value != null ? Number(value) : 0;
  const percentage = Math.min(100, Math.max(0, (score / 5) * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          {label}
        </span>
        <span className="font-semibold text-slate-200">
          {score > 0 ? `${score.toFixed(1)} / 5.0` : "N/A"}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 4 ? "bg-emerald-400" : score >= 3 ? "bg-amber-400" : "bg-rose-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export const TrainRatingsCard = React.memo(function TrainRatingsCard({ data }: Props) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!data || !data.ratings) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        No passenger review ratings available for this train.
      </div>
    );
  }

  const { overall, food, punctuality, cleanliness, ratingCount, reviews = [] } = data.ratings;
  const writtenReviews = reviews.filter((r) => r.text && r.text.trim().length > 0);
  const displayedReviews = showAllReviews ? writtenReviews : writtenReviews.slice(0, 2);

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4 shadow-md shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
            <span>#{data.trainNumber}</span>
            {data.trainName && (
              <>
                <span className="text-slate-500">·</span>
                <span className="truncate max-w-[200px] sm:max-w-[320px]">{data.trainName}</span>
              </>
            )}
          </div>
          {(data.source || data.sourceCode || data.destination || data.destinationCode) && (
            <div className="text-[11px] text-slate-400">
              {formatStationDisplay(data.source || data.sourceCode, data.sourceName)} → {formatStationDisplay(data.destination || data.destinationCode, data.destinationName)}
              {data.totalDuration && ` · ${data.totalDuration}`}
              {data.totalDistance && ` · ${data.totalDistance} km`}
            </div>
          )}
        </div>

        {overall != null && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold text-sm">
            <Star className="w-4 h-4 fill-emerald-400" />
            <span>{Number(overall).toFixed(1)}</span>
            {data.ratings?.baseline?.tier && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                {data.ratings.baseline.tier}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        <RatingBar label="Cleanliness" value={cleanliness} icon={Sparkles} color="text-sky-400" />
        <RatingBar label="Food Quality" value={food} icon={Utensils} color="text-amber-400" />
        <RatingBar label="Punctuality" value={punctuality} icon={Clock} color="text-purple-400" />
      </div>

      {/* Real Passenger Written Reviews */}
      {writtenReviews.length > 0 && (
        <div className="pt-2 border-t border-slate-900 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-sky-400" />
              Verified Passenger Feedback ({writtenReviews.length})
            </span>
            {writtenReviews.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5"
              >
                {showAllReviews ? "Show less" : `View all ${writtenReviews.length}`}
                {showAllReviews ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {displayedReviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/70 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-300">{rev.authorLabel}</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Star className="w-3 h-3 fill-emerald-400" />
                    <span>{rev.rating}/5</span>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed italic">
                  "{rev.text}"
                </p>
                {rev.updatedAt && (
                  <div className="text-[10px] text-slate-500 text-right">
                    {rev.updatedAt.split(" ")[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer / Review Count */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {ratingCount ? `${ratingCount.toLocaleString()} passenger ratings` : "Verified traveler ratings"}
        </span>
        <span className="text-slate-400 font-medium">{data.ratingText || "ConfirmRoute Passenger Index"}</span>
      </div>
    </div>
  );
});
