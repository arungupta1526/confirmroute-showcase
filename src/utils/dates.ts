/** Convert an ISO date (YYYY-MM-DD) or DD-MM-YYYY or DD/MM/YYYY or single-digit formats to the API's DD-MM-YYYY format. */
export function normalizeDate(input: string): string {
  let trimmed = input.trim();
  // Handle multi-date strings passed by LLM (e.g., "08-09-2026, 09-09-2026" or "08-09-2026 and 09-09-2026")
  if (trimmed.includes(",")) {
    trimmed = trimmed.split(",")[0].trim();
  }
  if (trimmed.toLowerCase().includes(" and ")) {
    trimmed = trimmed.split(/ and /i)[0].trim();
  }

  // DD-MM-YYYY or D-M-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    return `${day}-${month}-${dmy[3]}`;
  }
  // YYYY-MM-DD or YYYY-M-D or YYYY/MM/DD
  const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const day = ymd[3].padStart(2, "0");
    const month = ymd[2].padStart(2, "0");
    return `${day}-${month}-${ymd[1]}`;
  }
  throw new Error(
    `Invalid date "${input}". Use DD-MM-YYYY (e.g. 28-06-2026) or YYYY-MM-DD.`
  );
}

/** Get tomorrow's date formatted as DD-MM-YYYY in Indian Standard Time (IST) */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(tomorrow);
  return parts.replace(/\//g, "-");
}

/**
 * Validates whether a travel date falls within the Indian Railways booking window (L3).
 * Indian Railways allows booking up to 120 days in advance (ARP) and strictly not in the past.
 */
export function validateBookingDateRange(
  input: string,
  maxAdvanceDays = 120
): { isValid: boolean; error?: string; doj?: string } {
  let doj: string;
  try {
    doj = normalizeDate(input);
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }

  const [dStr, mStr, yStr] = doj.split("-");
  const targetDate = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr)));

  // Current date in IST at 00:00:00 UTC for consistent day-based comparison
  const todayIST = getTodayDate();
  const [tD, tM, tY] = todayIST.split("-");
  const todayDate = new Date(Date.UTC(Number(tY), Number(tM) - 1, Number(tD)));

  const diffMs = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isValid: false,
      error: `Travel date ${doj} is in the past. Indian Railways only permits booking for today (${todayIST}) or future dates.`,
      doj,
    };
  }

  if (diffDays > maxAdvanceDays) {
    return {
      isValid: false,
      error: `Travel date ${doj} is ${diffDays} days in advance, exceeding the Indian Railways ${maxAdvanceDays}-day Advance Reservation Period (ARP).`,
      doj,
    };
  }

  return { isValid: true, doj };
}

/** Get today's date formatted as DD-MM-YYYY in Indian Standard Time (IST) */
export function getTodayDate(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  return parts.replace(/\//g, "-");
}

/** Get a date N days ahead in IST formatted as DD-MM-YYYY */
export function getFutureDateIST(daysAhead: number = 7): string {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(target);
  return parts.replace(/\//g, "-");
}

/** Get a date N days ahead in IST formatted as YYYY-MM-DD */
export function getFutureDateISO(daysAhead: number = 7): string {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
  return parts;
}

/** Get formatted current date for documentation headers (e.g. "September 19, 2026") */
export function getFormattedDocsDate(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

/** Get current Indian Standard Time (IST) date, time, and full formatted string */
export function getCurrentISTDateTime(): { date: string; time: string; full: string } {
  const now = new Date();
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now).replace(/\//g, "-");

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(now);

  return {
    date: dateParts,
    time: timeParts,
    full: `${dayOfWeek}, ${dateParts} at ${timeParts} IST`,
  };
}

export function formatDuration(mins: string | number): string {
  const m = typeof mins === "string" ? parseInt(mins, 10) : mins;
  if (!Number.isFinite(m)) return String(mins);
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function timeToMinutes(t: string): number {
  const parts = t.split(":");
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

/**
 * Formats any 24-hour railway time or raw time string (e.g. "16:50", "04:50")
 * into the dual-format accessible string: "04:50 PM (16:50)".
 */
export function formatDualTime(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "-";
  const trimmed = timeStr.trim();
  if (!trimmed || trimmed === "-") return "-";

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
 * Formats a message timestamp into a clean, human-friendly dual time string.
 * Example:
 * - Morning: "07:07 AM"
 * - Afternoon/Evening: "03:15 PM (15:15)"
 * - Midnight: "12:15 AM (00:15)"
 * - Previous days: "Sep 12, 03:15 PM (15:15)"
 */
export function formatMessageTimestamp(timestamp?: number | string | Date): string {
  if (!timestamp) return "";
  const d = typeof timestamp === "number" || typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  const pad12 = String(hours12).padStart(2, "0");
  const pad24 = String(hours).padStart(2, "0");
  const show24 = hours >= 13 || hours === 0;
  const timeStr = show24 ? `${pad12}:${minutes} ${period} (${pad24}:${minutes})` : `${pad12}:${minutes} ${period}`;

  if (isToday) {
    return timeStr;
  }
  const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${dateStr}, ${timeStr}`;
}


