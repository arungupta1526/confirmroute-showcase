/**
 * Station helper providing formatting helpers to display friendly station names alongside
 * station codes across all MCP widget cards.
 */

import { MAJOR_STATIONS } from "./majorStationsData";

export { MAJOR_STATIONS };

/**
 * Clean up redundant suffixes from station names for concise display.
 */
function cleanStationName(name: string): string {
  if (typeof name !== "string") return "";
  return name
    .replace(/([^\s])\(/g, "$1 (")
    .replace(/\)\s*([^\s\)])/g, ") $1")
    .replace(/\s+Railway\s+Station$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Format station display with both name and code: "New Delhi (NDLS)".
 * Prioritizes explicitly provided station name, falls back to dictionary lookup.
 */
export function formatStationDisplay(
  codeOrName?: string | null,
  fallbackName?: string | null
): string {
  if (codeOrName == null) return "";

  const trimmed = typeof codeOrName === "string" ? codeOrName.trim() : String(codeOrName).trim();
  if (!trimmed) return "";
  const upper = trimmed.toUpperCase();

  // If a known station name was provided explicitly
  if (fallbackName && typeof fallbackName === "string" && fallbackName.trim()) {
    const clean = cleanStationName(fallbackName);
    if (upper.length <= 5 && /^[A-Z0-9]+$/.test(upper)) {
      if (clean.toUpperCase().endsWith(`(${upper})`)) {
        return clean;
      }
      return `${clean} (${upper})`;
    }
    return clean;
  }

  // Check if trimmed matches an IRCTC station code in our dictionary
  if (MAJOR_STATIONS[upper]) {
    return `${cleanStationName(MAJOR_STATIONS[upper])} (${upper})`;
  }

  // If input looks like an IRCTC station code (2-5 uppercase chars)
  if (/^[A-Z]{2,5}$/.test(upper)) {
    return upper;
  }

  // Input is already a station name
  return cleanStationName(trimmed);
}

/**
 * Extract canonical station code from code, formatted string ("New Delhi (NDLS)"), or station name.
 */
export function extractStationCode(input?: string | null): string {
  if (input == null) return "";
  const trimmed = typeof input === "string" ? input.trim() : String(input).trim();
  if (!trimmed) return "";

  // Check if string contains parentheses like "New Delhi (NDLS)"
  const parenMatch = trimmed.match(/\(([A-Z0-9]{2,6})\)/i);
  if (parenMatch) return parenMatch[1].toUpperCase();

  const upper = trimmed.toUpperCase();
  // Check if it's already a code (2-5 alphanumeric)
  if (/^[A-Z0-9]{2,6}$/.test(upper)) {
    return upper;
  }

  // Check in dictionary by station name
  for (const [code, name] of Object.entries(MAJOR_STATIONS)) {
    if (name.toUpperCase() === upper || cleanStationName(name).toUpperCase() === upper) {
      return code;
    }
  }

  return upper;
}

/**
 * Returns just the clean station name (or code if name is unknown).
 */
export function getStationNameOnly(
  codeOrName?: string | null,
  fallbackName?: string | null
): string {
  if (codeOrName == null) return "";
  if (fallbackName && typeof fallbackName === "string" && fallbackName.trim()) {
    return cleanStationName(fallbackName);
  }

  const trimmed = typeof codeOrName === "string" ? codeOrName.trim() : String(codeOrName).trim();
  const upper = trimmed.toUpperCase();
  if (MAJOR_STATIONS[upper]) return MAJOR_STATIONS[upper];

  return cleanStationName(trimmed);
}

/**
 * Parse running days into an array of 7 weekdays with active status.
 */
export interface RunningDayItem {
  key: string;
  label: string;
  fullName: string;
  runs: boolean;
}

const WEEKDAYS = [
  { key: "Mon", label: "M", fullName: "Monday" },
  { key: "Tue", label: "T", fullName: "Tuesday" },
  { key: "Wed", label: "W", fullName: "Wednesday" },
  { key: "Thu", label: "T", fullName: "Thursday" },
  { key: "Fri", label: "F", fullName: "Friday" },
  { key: "Sat", label: "S", fullName: "Saturday" },
  { key: "Sun", label: "S", fullName: "Sunday" },
];

export function parseRunningDays(
  runningDays?: string | Record<string, boolean> | null
): RunningDayItem[] {
  if (!runningDays) {
    return WEEKDAYS.map((w) => ({ ...w, runs: true }));
  }

  // If it's an object { Mon: true, Tue: false, ... }
  if (typeof runningDays === "object") {
    return WEEKDAYS.map((w) => ({
      ...w,
      runs: Boolean(
        (runningDays as Record<string, boolean>)[w.key] ??
          (runningDays as Record<string, boolean>)[w.fullName]
      ),
    }));
  }

  const str = String(runningDays).trim();

  // If 7-character binary string (e.g. "1111111" where 1st char usually represents Mon or Sun)
  if (/^[01]{7}$/.test(str)) {
    return WEEKDAYS.map((w, idx) => ({
      ...w,
      runs: str.charAt(idx) === "1",
    }));
  }

  // If comma or space separated list of day abbreviations (e.g. "Mon, Wed, Fri")
  const upperStr = str.toUpperCase();
  return WEEKDAYS.map((w) => ({
    ...w,
    runs: upperStr.includes(w.key.toUpperCase()) || upperStr.includes(w.fullName.toUpperCase()),
  }));
}

/**
 * Format a date string with weekday name (e.g. "15-10-2026" -> "15 Oct (Thu)").
 */
export function formatDateWithWeekday(dateStr?: string | null): string {
  if (dateStr == null) return "";

  const trimmed = typeof dateStr === "string" ? dateStr.trim() : String(dateStr).trim();
  if (!trimmed) return "";

  // Try parsing DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  let dateObj: Date | null = null;

  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    dateObj = new Date(year, month, day);
  } else {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return trimmed;
  }

  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });

  return `${dayNum} ${monthName} (${dayName})`;
}

/**
 * Parse a date string ("DD-MM-YYYY", "D-M-YYYY", "YYYY-MM-DD") into epoch milliseconds for reliable sorting.
 */
export function parseDateTimestamp(dateStr?: string | null): number {
  if (dateStr == null) return 0;
  const trimmed = typeof dateStr === "string" ? dateStr.trim() : String(dateStr).trim();
  if (!trimmed) return 0;

  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  const parsed = new Date(trimmed).getTime();
  return isNaN(parsed) ? 0 : parsed;
}
