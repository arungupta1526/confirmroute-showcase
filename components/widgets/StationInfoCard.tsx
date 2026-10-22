"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Phone, MapPin, Mountain, Layers, ExternalLink, Navigation, Compass, Gauge } from "lucide-react";
import type { StationInfoDetails } from "@/src/types";

interface Props {
  data: {
    query?: string;
    resolved?: string | null;
    stationName?: string;
    matchCount?: number;
    stationInfo?: StationInfoDetails;
    suggestions?: Array<{ stationCode: string; stationName: string }>;
  };
}

export const StationInfoCard = React.memo(function StationInfoCard({ data }: Props) {
  const [imgError, setImgError] = useState(false);
  const info = data?.stationInfo;
  const code = info?.code || data?.resolved || "";
  const name = info?.name || data?.stationName || code;
  const suggestions = data?.suggestions || [];
  const otherSuggestions = suggestions.filter((s) => s.stationCode !== code);

  if (!info && !data?.resolved) {
    return null;
  }

  const handleSuggestionClick = (stnCode: string, stnName: string) => {
    if (typeof window === "undefined") return;
    const prompt = `Station code and details of ${stnName} (${stnCode})`;
    window.dispatchEvent(
      new CustomEvent("confirmroute:send-prompt", { detail: { prompt } })
    );
  };

  const photoToDisplay =
    (!imgError && (info?.photoUrl || info?.galleryPhotoUrl || (code ? `/api/media/station/${code}.webp` : null))) || null;

  return (
    <div className="my-3 font-sans rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3.5 shadow-lg shadow-black/25">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-slate-100">{name}</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                {code}
              </span>
              {info?.hindiName && (
                <span className="text-xs text-slate-400 font-normal">
                  ({info.hindiName})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
              {info?.zone && <span>Zone: <strong className="text-slate-300">{info.zone}</strong></span>}
              {info?.division && <span>· Div: <strong className="text-slate-300">{info.division}</strong></span>}
              {info?.category && (
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 uppercase tracking-wide">
                  {info.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {info?.platforms !== undefined && (
          <div className="text-right shrink-0 ml-auto">
            <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg whitespace-nowrap">
              {info.platforms} Platforms
            </div>
          </div>
        )}
      </div>

      {/* Photo Preview & Key Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {photoToDisplay && (
          <div className="sm:col-span-1 relative rounded-xl overflow-hidden border border-slate-800 aspect-[4/3] bg-slate-900 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/media/station/${code}.webp`}
              alt={`${name} railway station`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e) => {
                if (photoToDisplay && e.currentTarget.src !== photoToDisplay) {
                  e.currentTarget.src = photoToDisplay;
                } else {
                  setImgError(true);
                }
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300">
              <span className="truncate">Station Preview (Community Archives)</span>
              <Link
                href="/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-sky-300 underline underline-offset-2 shrink-0 ml-1"
              >
                IP Policy
              </Link>
            </div>
          </div>
        )}

        <div className={photoToDisplay ? "sm:col-span-2 space-y-2" : "sm:col-span-3 space-y-2"}>
          {/* Elevation & Platforms Metric Badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            {info?.elevationM !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                <span>Elevation: <strong>{info.elevationM}m MSL</strong></span>
              </span>
            )}
            {info?.platforms !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Platforms: <strong>{info.platforms}</strong></span>
              </span>
            )}
            {info?.speedMax !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Track MPS: <strong>{info.speedMax} km/h</strong></span>
              </span>
            )}
          </div>

          {/* Address & Phone */}
          {info?.address && (
            <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/50 border border-slate-800/80 p-2.5 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] text-slate-300">{info.address}</div>
            </div>
          )}

          {info?.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/50 border border-slate-800/80 px-2.5 py-1.5 rounded-xl">
              <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-[11px] text-slate-300 font-mono">Enquiry: {info.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Other Satellite / Metro Stations in same area */}
      {otherSuggestions.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Other Stations in this Cluster / Area:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
            {otherSuggestions.slice(0, 6).map((sugg) => (
              <button
                key={sugg.stationCode}
                type="button"
                onClick={() => handleSuggestionClick(sugg.stationCode, sugg.stationName)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-sky-300 transition shrink-0 cursor-pointer"
              >
                <span className="font-mono text-sky-400 font-bold">{sugg.stationCode}</span>
                <span className="truncate max-w-[120px]">{sugg.stationName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Station Map Link & Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex-wrap gap-2">
        <span>Official IR Station Node #{code}</span>
        <div className="flex items-center gap-3">
          {info?.lat && info?.lon && (
            <a
              href={`https://maps.google.com/?q=${info.lat},${info.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              <span>Google Maps</span>
            </a>
          )}
          {info?.stationUrl && (
            <a
              href={info.stationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Station GIS Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
});
