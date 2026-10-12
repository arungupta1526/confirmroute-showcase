/**
 * Connecting Class Matching & Sorting Helper
 * Implements class priority sorting (2S > SL > 3E > 3A > 2A > 1A > CC > EC),
 * multi-class seats line formatting for sharing, and combined fare calculations.
 */

export const CLASS_SORT_ORDER: Record<string, number> = {
  "2S": 10,
  "SL": 20,
  "3E": 30,
  "3A": 40,
  "2A": 50,
  "1A": 60,
  "CC": 70,
  "EC": 80,
  "EA": 90,
};

export const CLASS_FILTER_ORDER = ["2S", "SL", "3E", "3A", "2A", "1A", "CC", "EC"];

export interface LayoverSlot {
  id: string;
  label: string;
  minMinutes: number;
  maxMinutes: number;
}

export const LAYOVER_SLOTS: LayoverSlot[] = [
  { id: "lt-4", label: "< 4 hrs", minMinutes: 0, maxMinutes: 240 },
  { id: "4-8", label: "4–8 hrs", minMinutes: 240, maxMinutes: 480 },
  { id: "8-12", label: "8–12 hrs", minMinutes: 480, maxMinutes: 720 },
];

export interface ConnectingLegAvailability {
  travelClass: string;
  status?: string;
  seats?: number | null;
  fare?: number | null;
  [key: string]: any;
}

export function sortAvailabilityByClass<T extends ConnectingLegAvailability>(list: T[]): T[] {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const orderA = CLASS_SORT_ORDER[a.travelClass || ""] || 999;
    const orderB = CLASS_SORT_ORDER[b.travelClass || ""] || 999;
    return orderA - orderB;
  });
}

export function formatSeatsOptions(availability: any[]): string {
  const sorted = sortAvailabilityByClass(availability || []);
  if (sorted.length === 0) return "Check Live";
  return sorted
    .map((a) => {
      const fareStr = a.fare != null ? ` (₹${a.fare})` : "";
      return `${a.travelClass}: ${a.status || "AVL"}${fareStr}`;
    })
    .join(" | ");
}

export function computeCombinedFareSummary(
  leg1Avail: any[],
  leg2Avail: any[],
  selectedClass: string
): string {
  if (selectedClass !== "all") {
    const leg1Item = (leg1Avail || []).find((a) => a.travelClass === selectedClass);
    const leg2Item = (leg2Avail || []).find((a) => a.travelClass === selectedClass);
    const fare1 = leg1Item?.fare || 0;
    const fare2 = leg2Item?.fare || 0;
    const total = fare1 + fare2;
    if (total > 0) {
      return `₹${total.toLocaleString("en-IN")} (₹${fare1} + ₹${fare2}) [${selectedClass} Class]`;
    }
    return `[${selectedClass} Class] Check Live`;
  }

  const fares1 = (leg1Avail || []).map((a) => a.fare).filter((f): f is number => typeof f === "number" && f > 0);
  const fares2 = (leg2Avail || []).map((a) => a.fare).filter((f): f is number => typeof f === "number" && f > 0);

  if (fares1.length === 0 || fares2.length === 0) return "";

  const minFare = Math.min(...fares1) + Math.min(...fares2);
  const maxFare = Math.max(...fares1) + Math.max(...fares2);

  if (minFare === maxFare) {
    return `₹${minFare.toLocaleString("en-IN")}`;
  }
  return `From ₹${minFare.toLocaleString("en-IN")} to ₹${maxFare.toLocaleString("en-IN")}`;
}

/**
 * Returns distinct styling classes based on live seat availability status:
 * - Green (Emerald) for Confirmed/Available (AVL, CURR_AVL)
 * - Blue (Sky) for RAC
 * - Yellow/Amber for Waiting List (WL)
 * - Red (Rose) for Not Available / Regret
 * - Muted Slate/Gray for Train Departed
 * - Indigo for user-selected class
 */
export function getConnectingSeatStatusStyle(
  status?: string,
  seats?: number | null,
  isSelected?: boolean
): string {
  if (isSelected) {
    return "bg-indigo-950 text-indigo-200 border-indigo-500 font-bold shadow-sm shadow-indigo-500/20";
  }

  const s = String(status || "").toUpperCase();

  // 1. Train Departed
  if (s.includes("DEPARTED")) {
    return "bg-slate-900/80 border-slate-700/60 text-slate-400";
  }

  // 2. Not Available / Cancelled / Regret
  if (
    s.includes("NOT AVAILABLE") ||
    s.includes("REGRET") ||
    s.includes("CANCEL") ||
    s.includes("NOT_AVAILABLE")
  ) {
    return "bg-rose-950/40 border-rose-900/60 text-rose-300";
  }

  // 3. Available (AVL, AVAILABLE, CURR_AVL, CURR_AVBL, seats > 0)
  if (
    s.startsWith("AVL") ||
    s.includes("AVAILABLE") ||
    s.includes("CURR_AVBL") ||
    s.includes("CURR_AVL") ||
    (typeof seats === "number" && seats > 0)
  ) {
    return "bg-emerald-950/60 border-emerald-800/70 text-emerald-300";
  }

  // 4. RAC (Reservation Against Cancellation)
  if (s.startsWith("RAC") || s.includes("RAC")) {
    return "bg-sky-950/60 border-sky-800/70 text-sky-300";
  }

  // 5. Waiting List (WL, GNWL, RLWL, PQWL, TQWL, etc.)
  if (s.startsWith("WL") || s.includes("WL") || s.includes("WAIT")) {
    return "bg-amber-950/60 border-amber-800/70 text-amber-300";
  }

  // Fallback
  return "bg-slate-900 border-slate-800 text-slate-300";
}

/**
 * Compute an effective travel utility score for a connecting itinerary.
 * Lower score is better.
 * Balances total journey duration, layover fatigue, and reasonable distance detour.
 */
export function computeItineraryScore(
  conn: any,
  minDistance: number = 0
): number {
  const duration = conn.totalDurationMinutes ?? 600;
  const layover = conn.layoverMinutes ?? 0;
  const dist = conn.totalDistance || minDistance;

  let score = duration;

  // Layover fatigue penalty:
  // - 40m - 180m (3h): 0 penalty (comfortable, natural transfer)
  // - 180m - 300m (3h - 5h): moderate penalty (+0.5 min per extra minute)
  // - > 300m (> 5h): heavy penalty (+1.5 min per extra minute)
  if (layover > 300) {
    score += (layover - 300) * 1.5 + (300 - 180) * 0.5;
  } else if (layover > 180) {
    score += (layover - 180) * 0.5;
  }

  // Distance detour penalty: only +0.25 min per km extra.
  // This allows a faster route via a farther hub (+100-150 km) to win if it saves >= 45-60 mins of waiting!
  if (minDistance > 0 && dist > minDistance) {
    score += (dist - minDistance) * 0.25;
  }

  return score;
}

