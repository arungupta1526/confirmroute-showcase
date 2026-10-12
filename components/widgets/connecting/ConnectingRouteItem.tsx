"use client";

import React from "react";
import { ArrowRight, Clock, TrainFront, Share2, Copy, Check } from "lucide-react";
import { formatStationDisplay } from "../stationHelper";
import { formatDualTime } from "../trainTimeHelper";
import { formatTrainShareMessage, openWhatsAppShare, copyShareText } from "@/src/utils/shareRouteHelper";
import {
  sortAvailabilityByClass,
  formatSeatsOptions,
  computeCombinedFareSummary,
  getConnectingSeatStatusStyle,
} from "./connectingClassHelper";

interface Props {
  conn: any;
  idx: number;
  source: string;
  destination: string;
  date: string;
  selectedClass?: string;
  copiedIdx: number | null;
  setCopiedIdx: (idx: number | null) => void;
}

export const ConnectingRouteItem = React.memo(function ConnectingRouteItem({
  conn,
  idx,
  source,
  destination,
  date,
  selectedClass = "all",
  copiedIdx,
  setCopiedIdx,
}: Props) {
  const isBothConfirmed =
    conn.leg1?.availability?.some((a: any) => String(a.status || "").toUpperCase().includes("AVL") || (a.seats ?? 0) > 0) &&
    conn.leg2?.availability?.some((a: any) => String(a.status || "").toUpperCase().includes("AVL") || (a.seats ?? 0) > 0);

  const leg1Sorted = React.useMemo(
    () =>
      sortAvailabilityByClass(
        (conn.leg1?.availability || []).filter(
          (a: any) => !String(a.status || "").toUpperCase().includes("DEPARTED")
        )
      ),
    [conn.leg1?.availability]
  );

  const leg2Sorted = React.useMemo(
    () =>
      sortAvailabilityByClass(
        (conn.leg2?.availability || []).filter(
          (a: any) => !String(a.status || "").toUpperCase().includes("DEPARTED")
        )
      ),
    [conn.leg2?.availability]
  );

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
      {/* Layover Highlight Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-200">
            Via Transfer Hub:{" "}
            <span className="text-sky-300 font-semibold">
              {formatStationDisplay(conn.hubStationCode, conn.hubStationName)}
            </span>
          </span>
          {conn.totalDurationFormatted && (
            <span className="text-[11px] text-slate-400 font-normal">
              · Total: {conn.totalDurationFormatted}
            </span>
          )}
          {((conn.totalDistance != null && conn.totalDistance > 0) ||
            ((conn.leg1?.distance || 0) + (conn.leg2?.distance || 0) > 0)) && (
            <span className="text-[11px] text-slate-400 font-normal">
              · {conn.totalDistance || ((conn.leg1?.distance || 0) + (conn.leg2?.distance || 0))} km
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {isBothConfirmed ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 text-[10px] font-semibold flex items-center gap-1">
              ✨ Both Confirmed
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-sky-950/70 text-sky-300 border border-sky-800/60 text-[10px] font-medium flex items-center gap-1">
              🎫 Mix / General Ticket
            </span>
          )}
          {(() => {
            const layover = conn.layoverMinutes ?? 0;
            const isIdeal = layover >= 40 && layover <= 180;
            const isLong = layover > 300;
            const badgeClass = isIdeal
              ? "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
              : isLong
              ? "bg-amber-950/70 text-amber-300 border-amber-800/60"
              : "bg-sky-950/70 text-sky-300 border-sky-800/60";
            const label = isIdeal
              ? `${conn.layoverFormatted} (Ideal Layover)`
              : isLong
              ? `${conn.layoverFormatted} (Long Wait)`
              : `${conn.layoverFormatted} Layover`;

            return (
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${badgeClass}`}
              >
                <Clock className="w-3 h-3" />
                {label}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Leg 1 */}
      {conn.leg1 && (
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-sky-300 truncate max-w-[240px] sm:max-w-[320px]">
              <TrainFront className="w-3.5 h-3.5 shrink-0" /> Leg 1: #{conn.leg1.trainNumber} {conn.leg1.trainName}
            </span>
            <span className="text-slate-400 text-[11px] shrink-0">
              {conn.leg1.durationFormatted || "-"}
              {conn.leg1.distance ? ` · ${conn.leg1.distance} km` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="max-w-[160px] sm:max-w-[210px]">
              <span className="font-semibold text-slate-100">{formatDualTime(conn.leg1.departureTime)}</span>
              <div className="text-[10px] text-slate-400 truncate">
                {formatStationDisplay(conn.leg1.fromStnCode, conn.leg1.fromStnName)}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <div className="text-right max-w-[160px] sm:max-w-[210px]">
              <span className="font-semibold text-slate-100">{formatDualTime(conn.leg1.arrivalTime)}</span>
              <div className="text-[10px] text-slate-400 truncate">
                {formatStationDisplay(conn.leg1.toStnCode, conn.leg1.toStnName)}
              </div>
            </div>
          </div>

          {/* Leg 1 Availability */}
          {leg1Sorted.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-850">
              <span className="text-[10px] text-slate-500 font-medium">Seats:</span>
              {leg1Sorted.slice(0, 5).map((a: any, aIdx: number) => {
                const isSelected = selectedClass !== "all" && a.travelClass === selectedClass;
                return (
                  <span
                    key={aIdx}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition ${getConnectingSeatStatusStyle(
                      a.status,
                      a.seats,
                      isSelected
                    )}`}
                  >
                    {a.travelClass}: {a.status || "Check"} {a.fare ? `(₹${a.fare})` : ""}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Leg 2 */}
      {conn.leg2 && (
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-sky-300 truncate max-w-[240px] sm:max-w-[320px]">
              <TrainFront className="w-3.5 h-3.5 shrink-0" /> Leg 2: #{conn.leg2.trainNumber} {conn.leg2.trainName}
            </span>
            <span className="text-slate-400 text-[11px] shrink-0">
              {conn.leg2.durationFormatted || "-"}
              {conn.leg2.distance ? ` · ${conn.leg2.distance} km` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="max-w-[160px] sm:max-w-[210px]">
              <span className="font-semibold text-slate-100">{formatDualTime(conn.leg2.departureTime)}</span>
              <div className="text-[10px] text-slate-400 truncate">
                {formatStationDisplay(conn.leg2.fromStnCode, conn.leg2.fromStnName)}
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <div className="text-right max-w-[160px] sm:max-w-[210px]">
              <span className="font-semibold text-slate-100">{formatDualTime(conn.leg2.arrivalTime)}</span>
              <div className="text-[10px] text-slate-400 truncate">
                {formatStationDisplay(conn.leg2.toStnCode, conn.leg2.toStnName)}
              </div>
            </div>
          </div>

          {/* Leg 2 Availability */}
          {leg2Sorted.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-850">
              <span className="text-[10px] text-slate-500 font-medium">Seats:</span>
              {leg2Sorted.slice(0, 5).map((a: any, aIdx: number) => {
                const isSelected = selectedClass !== "all" && a.travelClass === selectedClass;
                return (
                  <span
                    key={aIdx}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition ${getConnectingSeatStatusStyle(
                      a.status,
                      a.seats,
                      isSelected
                    )}`}
                  >
                    {a.travelClass}: {a.status || "Check"} {a.fare ? `(₹${a.fare})` : ""}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Share & Copy Action Row */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
        {(() => {
          const getShareMessage = () => {
            const isSpecificClass = Boolean(selectedClass && selectedClass !== "all");
            const leg1Selected = isSpecificClass
              ? leg1Sorted.find((a: any) => a.travelClass === selectedClass)
              : null;
            const leg2Selected = isSpecificClass
              ? leg2Sorted.find((a: any) => a.travelClass === selectedClass)
              : null;

            return formatTrainShareMessage({
              fromStation: formatStationDisplay(source),
              toStation: formatStationDisplay(destination),
              date: date,
              totalDuration: conn.totalDurationFormatted,
              totalDistance:
                conn.totalDistance ||
                (conn.leg1?.distance || 0) + (conn.leg2?.distance || 0) ||
                undefined,
              combinedFareSummary: computeCombinedFareSummary(
                leg1Sorted,
                leg2Sorted,
                selectedClass || "all"
              ),
              connectingLegs: [
                {
                  trainNumber: conn.leg1?.trainNumber || "N/A",
                  trainName: conn.leg1?.trainName,
                  fromStation: formatStationDisplay(conn.leg1?.fromStnCode, conn.leg1?.fromStnName),
                  toStation: formatStationDisplay(conn.leg1?.toStnCode, conn.leg1?.toStnName),
                  travelClass: leg1Selected ? leg1Selected.travelClass : undefined,
                  status: leg1Selected ? leg1Selected.status : undefined,
                  fare: leg1Selected ? leg1Selected.fare : undefined,
                  seatOptions: !isSpecificClass ? formatSeatsOptions(leg1Sorted) : undefined,
                  layoverDuration: conn.layoverFormatted,
                },
                {
                  trainNumber: conn.leg2?.trainNumber || "N/A",
                  trainName: conn.leg2?.trainName,
                  fromStation: formatStationDisplay(conn.leg2?.fromStnCode, conn.leg2?.fromStnName),
                  toStation: formatStationDisplay(conn.leg2?.toStnCode, conn.leg2?.toStnName),
                  travelClass: leg2Selected ? leg2Selected.travelClass : undefined,
                  status: leg2Selected ? leg2Selected.status : undefined,
                  fare: leg2Selected ? leg2Selected.fare : undefined,
                  seatOptions: !isSpecificClass ? formatSeatsOptions(leg2Sorted) : undefined,
                },
              ],
            });
          };

          return (
            <>
              <button
                type="button"
                onClick={() => openWhatsAppShare(getShareMessage())}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 transition cursor-pointer whitespace-nowrap shrink-0"
                title="Share this itinerary on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await copyShareText(getShareMessage());
                  setCopiedIdx(idx);
                  setTimeout(() => setCopiedIdx(null), 2000);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition cursor-pointer whitespace-nowrap shrink-0 ${
                  copiedIdx === idx
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
                }`}
                title={copiedIdx === idx ? "Copied to clipboard!" : "Copy itinerary to clipboard"}
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
});
