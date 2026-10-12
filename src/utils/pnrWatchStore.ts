/**
 * PNR Watchlist & Latest Indian Railways Charting Schedule Engine
 *
 * Official Indian Railways Chart Preparation Rules (Ministry of Railways):
 * 1. First Reservation Chart:
 *    - Slot A (Departures 05:01 to 14:00 hrs): Prepared by 20:00 hrs (08:00 PM IST) on the previous day.
 *    - Slot B (Departures 14:01 to 05:00 hrs next day): Prepared at least 10 hours before scheduled departure.
 *    - Always calculated from the train's ORIGINATING station, not intermediate boarding points.
 * 2. Second & Final Reservation Chart:
 *    - Prepared 30 minutes before departure from originating/remote charting stations.
 *    - Vacant berths remain bookable under "Current Availability" until the second chart is prepared.
 */

export interface WatchedPnrItem {
  pnr: string;
  trainNumber?: string;
  trainName?: string;
  doj?: string;
  fromStationCode?: string;
  toStationCode?: string;
  departureTime?: string;
  status?: string;
  addedAt: string;
}

export interface ChartingScheduleInfo {
  firstChartTime: string;
  finalChartTime: string;
  ruleExplanation: string;
  isFirstChartLikelyPrepared: boolean;
  isFinalChartLikelyPrepared: boolean;
}

const PNR_STORAGE_KEY = "confirmroute_watched_pnrs_v1";

export function getWatchedPnrs(): WatchedPnrItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PNR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isPnrWatched(pnr: string): boolean {
  if (!pnr) return false;
  const list = getWatchedPnrs();
  return list.some((item) => item.pnr === pnr);
}

export function toggleWatchPnr(item: WatchedPnrItem): boolean {
  if (typeof window === "undefined" || !item.pnr) return false;
  try {
    const list = getWatchedPnrs();
    const existingIndex = list.findIndex((p) => p.pnr === item.pnr);

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      localStorage.setItem(PNR_STORAGE_KEY, JSON.stringify(list));
      return false; // Unwatched
    } else {
      list.unshift(item);
      localStorage.setItem(PNR_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
      return true; // Now watched
    }
  } catch {
    return false;
  }
}

/**
 * Calculates accurate chart preparation timeline using latest IRCTC rules
 */
export function calculateChartingSchedule(departureTime?: string, doj?: string): ChartingScheduleInfo {
  let depHour = 12;
  let depMin = 0;

  if (departureTime && departureTime.includes(":")) {
    const [h, m] = departureTime.split(":").map((v) => parseInt(v.trim(), 10));
    if (!isNaN(h)) depHour = h;
    if (!isNaN(m)) depMin = m;
  }

  // Indian Railways Revised Charting Rules:
  // Slot 1: Departing between 05:01 and 14:00 -> 1st chart at 08:00 PM (20:00 IST) previous day
  // Slot 2: Departing between 14:01 and 05:00 -> 1st chart at least 10 hours prior
  const depMinutesTotal = depHour * 60 + depMin;
  const isMorningSlot = depMinutesTotal >= 301 && depMinutesTotal <= 840; // 05:01 (301m) to 14:00 (840m)

  let firstChartTimeText = "";
  let ruleExplanation = "";

  if (isMorningSlot) {
    firstChartTimeText = "08:00 PM (Previous Day)";
    ruleExplanation = "Official Rule: For trains departing between 05:01 and 14:00, 1st chart is prepared at 08:00 PM (20:00 IST) on the previous day from the originating station.";
  } else {
    // 10 hours prior
    let firstChartH = (depHour - 10 + 24) % 24;
    const ampm = firstChartH >= 12 ? "PM" : "AM";
    const displayH = firstChartH % 12 === 0 ? 12 : firstChartH % 12;
    firstChartTimeText = `~${String(displayH).padStart(2, "0")}:${String(depMin).padStart(2, "0")} ${ampm} (10 hrs prior)`;
    ruleExplanation = "Official Rule: For departures between 14:01 and 05:00, 1st chart is prepared at least 10 hours prior to departure from the train's originating station.";
  }

  // Second chart: 30 mins prior
  let finalH = depHour;
  let finalM = depMin - 30;
  if (finalM < 0) {
    finalM += 60;
    finalH = (finalH - 1 + 24) % 24;
  }
  const finalAmpm = finalH >= 12 ? "PM" : "AM";
  const finalDisplayH = finalH % 12 === 0 ? 12 : finalH % 12;
  const finalChartTimeText = `${String(finalDisplayH).padStart(2, "0")}:${String(finalM).padStart(2, "0")} ${finalAmpm} (30 mins prior)`;

  return {
    firstChartTime: firstChartTimeText,
    finalChartTime: finalChartTimeText,
    ruleExplanation,
    isFirstChartLikelyPrepared: false,
    isFinalChartLikelyPrepared: false,
  };
}
