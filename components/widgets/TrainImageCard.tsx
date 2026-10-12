"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Camera, Image as ImageIcon, Sparkles, Info } from "lucide-react";

interface Props {
  data: {
    status?: boolean;
    trainNumber: string;
    imageUrl?: string | null;
    images?: string[];
    matchType?: string;
  };
}

export const TrainImageCard = React.memo(function TrainImageCard({ data }: Props) {
  const allImages = data.images && data.images.length > 0 ? data.images : (data.imageUrl ? [data.imageUrl] : []);
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!data || allImages.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
        No photographs available for Train #{data?.trainNumber}.
      </div>
    );
  }

  const currentImg = allImages[selectedIdx] || allImages[0];

  return (
    <div className="my-3 font-sans rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl shadow-black/30">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
              <span className="font-mono text-sky-400">#{data.trainNumber}</span>
              <span>Locomotive & Rake Gallery</span>
            </div>
            <span className="text-[11px] text-slate-400">Authentic Indian Railways on-track photography</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {data.matchType && (
            <span className="text-[10px] text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded-full font-mono uppercase">
              {data.matchType.replace("_", " ")}
            </span>
          )}
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Verified Rake
          </span>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
        <img
          src={`/api/media/train/${data.trainNumber}.webp?idx=${selectedIdx}`}
          alt={`Train ${data.trainNumber} Locomotive Rake`}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            if (currentImg && e.currentTarget.src !== currentImg) {
              e.currentTarget.src = currentImg;
            }
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-3 text-[11px] text-slate-300 font-medium">
          Photo {selectedIdx + 1} of {allImages.length}
        </div>
      </div>

        {/* Thumbnails Strip if multiple photos */}
        {allImages.length > 1 && (
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative rounded-md overflow-hidden flex-shrink-0 w-16 h-11 border-2 transition ${
                  selectedIdx === idx
                    ? "border-sky-500 shadow-md shadow-sky-500/20 scale-105"
                    : "border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={`/api/media/train/${data.trainNumber}.webp?idx=${idx}`}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (img && e.currentTarget.src !== img) {
                      e.currentTarget.src = img;
                    }
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Photo Attribution & IP Policy Bar */}
        <div className="px-3 py-2 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-slate-400">
              Train identification preview &bull; Photo credit: Railfan community archives.
            </span>
          </div>
          <Link
            href="/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-sky-300 underline underline-offset-2 shrink-0 text-[10px] transition"
          >
            IP Policy
          </Link>
        </div>
      </div>
    );
  });
