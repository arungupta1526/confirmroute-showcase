import { useState, useEffect } from "react";
import { Train } from "@/src/types";

/**
 * Parses any time string (e.g. "06:25", "16:30", "04:30 PM", "12:15 AM")
 * into total elapsed minutes from midnight (0 to 1439).
 */
export function parseDepartureMinutes(timeStr?: string): number {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");
  const match = clean.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isNaN(hours) || isNaN(minutes)) return 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Formats any 24-hour railway time or raw time string (e.g. "16:50", "04:50")
 * into the dual-format accessible string: "04:50 PM (16:50)".
 */
export function formatDualTime(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "-";
  const trimmed = timeStr.trim();
  if (!trimmed || trimmed === "-") return "-";

  // Check for "HH:MM" (24-hour railway time)
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    if (hours >= 0 && hours <= 24) {
      const period = hours >= 12 && hours < 24 ? "PM" : "AM";
      const hours12 = hours % 12 === 0 ? 12 : hours % 12;
      const pad12 = String(hours12).padStart(2, "0");
      const pad24 = String(hours === 24 ? 0 : hours).padStart(2, "0");
      const show24 = hours >= 13 || hours === 0;
      return show24 ? `${pad12}:${minutes} ${period} (${pad24}:${minutes})` : `${pad12}:${minutes} ${period}`;
    }
  }

  // If already contains AM or PM (e.g. "04:50 PM" or "4:50 PM")
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    const hours12 = parseInt(match12[1], 10);
    const minutes = match12[2];
    const period = match12[3].toUpperCase();
    let hours24 = hours12;
    if (period === "PM" && hours12 < 12) hours24 += 12;
    if (period === "AM" && hours12 === 12) hours24 = 0;
    const pad12 = String(hours12).padStart(2, "0");
    const pad24 = String(hours24).padStart(2, "0");
    const show24 = hours24 >= 13 || hours24 === 0;
    return show24 ? `${pad12}:${minutes} ${period} (${pad24}:${minutes})` : `${pad12}:${minutes} ${period}`;
  }

  return trimmed;
}

/**
 * Retrieves the current Indian Standard Time (IST / Asia/Kolkata)
 * elapsed minutes and a human-readable dual-formatted string: "04:50 PM (16:50)".
 */
export function getCurrentISTTime(): { totalMinutes: number; formattedTime: string } {
  const now = new Date();
  const timeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  const hour24Str = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const [hStr, mStr] = hour24Str.split(":");
  const hours24 = parseInt(hStr, 10);
  const totalMinutes = hours24 * 60 + parseInt(mStr, 10);
  const show24 = hours24 >= 13 || hours24 === 0;
  const formattedTime = show24 ? `${timeStr} (${hour24Str})` : timeStr;

  return { totalMinutes, formattedTime };
}

/**
 * Checks whether a given journey date (DD-MM-YYYY or YYYY-MM-DD) matches today's date in IST.
 */
export function isTodayJourney(dateStr?: string): boolean {
  if (!dateStr) return false;
  const cleaned = dateStr.trim();

  const todayIST = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date())
    .replace(/\//g, "-");

  // Direct match for DD-MM-YYYY
  if (cleaned === todayIST) return true;

  // Handle YYYY-MM-DD
  const ymdMatch = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const formattedYMD = `${ymdMatch[3].padStart(2, "0")}-${ymdMatch[2].padStart(2, "0")}-${ymdMatch[1]}`;
    return formattedYMD === todayIST;
  }

  return false;
}

/**
 * Partitions a list of trains into departed and upcoming based on IST time.
 */
export function partitionTrainsByTime(
  trains: Train[],
  isToday: boolean,
  currentMinutes: number
): {
  upcoming: Train[];
  departed: Train[];
  nextTrainNumber?: string;
} {
  if (!isToday || !trains || trains.length === 0) {
    return {
      upcoming: trains,
      departed: [],
      nextTrainNumber: trains?.[0]?.trainNumber,
    };
  }

  const departed: Train[] = [];
  const upcoming: Train[] = [];

  for (const train of trains) {
    const depMins = parseDepartureMinutes(train.departureTime);
    if (depMins < currentMinutes) {
      departed.push(train);
    } else {
      upcoming.push(train);
    }
  }

  return {
    upcoming,
    departed,
    nextTrainNumber: upcoming[0]?.trainNumber,
  };
}

/**
 * Custom React hook that monitors real-time IST time.
 * Updates on component mount, periodically every 60s, and when the user refocuses the tab.
 */
export function useCurrentISTTime() {
  const [istTime, setIstTime] = useState(getCurrentISTTime);

  useEffect(() => {
    const update = () => setIstTime(getCurrentISTTime());
    // Refresh immediately on mount to reflect the exact load time
    update();

    const interval = setInterval(update, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        update();
      }
    };

    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return istTime;
}
