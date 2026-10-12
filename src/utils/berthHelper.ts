/**
 * Official Indian Railways Berth Type Resolver
 * Accurately determines berth position (LB, MB, UB, SL, SU, SM) based on standard
 * coach bay layout formulas when IRCTC PRS returns empty/whitespace berthCode.
 */

export interface BerthTypeInfo {
  code: string; // "LB" | "MB" | "UB" | "SL" | "SU" | "SM" | "WS" | "SEAT" | "CB" | "CP" | ""
  label: string; // "Lower" | "Middle" | "Upper" | "Side Lower" | "Side Upper" | ...
  isLower: boolean;
}

export interface BerthFilterOption {
  code: string;
  label: string;
  shortLabel: string;
}

export const STANDARD_BERTH_FILTERS: BerthFilterOption[] = [
  { code: "ALL", label: "All Berths", shortLabel: "All" },
  { code: "LB", label: "Lower (LB)", shortLabel: "LB · Lower" },
  { code: "MB", label: "Middle (MB)", shortLabel: "MB · Middle" },
  { code: "UB", label: "Upper (UB)", shortLabel: "UB · Upper" },
  { code: "SL", label: "Side Lower (SL)", shortLabel: "SL · Side Lower" },
  { code: "SU", label: "Side Upper (SU)", shortLabel: "SU · Side Upper" },
  { code: "SM", label: "Side Middle (SM)", shortLabel: "SM · Side Middle" },
  { code: "SEAT", label: "Seat", shortLabel: "Seat" },
  { code: "LOWER_ALL", label: "All Lower (LB+SL)", shortLabel: "Any Lower" },
];

export const BERTH_BADGE_CLASSES: Record<string, string> = {
  LB: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60 font-semibold",
  MB: "bg-amber-950/70 text-amber-300 border-amber-800/60 font-semibold",
  UB: "bg-sky-950/70 text-sky-300 border-sky-800/60 font-semibold",
  SL: "bg-teal-950/70 text-teal-300 border-teal-800/60 font-semibold",
  SU: "bg-indigo-950/70 text-indigo-300 border-indigo-800/60 font-semibold",
  SM: "bg-violet-950/70 text-violet-300 border-violet-800/60 font-semibold",
  SEAT: "bg-blue-950/70 text-blue-300 border-blue-800/60 font-semibold",
  WS: "bg-cyan-950/70 text-cyan-300 border-cyan-800/60 font-semibold",
  CB: "bg-purple-950/70 text-purple-300 border-purple-800/60 font-semibold",
  CP: "bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-800/60 font-semibold",
};

export const BERTH_PILL_STYLES: Record<string, { active: string; inactive: string }> = {
  ALL: {
    active: "bg-slate-200 text-slate-950 border-white shadow-sm font-bold",
    inactive: "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800",
  },
  LB: {
    active: "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-emerald-400 border-emerald-800/40 hover:bg-slate-800",
  },
  MB: {
    active: "bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-amber-300 border-amber-800/40 hover:bg-slate-800",
  },
  UB: {
    active: "bg-sky-400 text-slate-950 border-sky-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-sky-300 border-sky-800/40 hover:bg-slate-800",
  },
  SL: {
    active: "bg-teal-400 text-slate-950 border-teal-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-teal-300 border-teal-800/40 hover:bg-slate-800",
  },
  SU: {
    active: "bg-indigo-400 text-slate-950 border-indigo-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-indigo-300 border-indigo-800/40 hover:bg-slate-800",
  },
  SM: {
    active: "bg-violet-400 text-slate-950 border-violet-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-violet-300 border-violet-800/40 hover:bg-slate-800",
  },
  SEAT: {
    active: "bg-blue-400 text-slate-950 border-blue-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-blue-300 border-blue-800/40 hover:bg-slate-800",
  },
  LOWER_ALL: {
    active: "bg-emerald-400 text-slate-950 border-emerald-300 shadow-sm font-bold",
    inactive: "bg-slate-900/90 text-emerald-300 border-emerald-800/50 hover:bg-slate-800",
  },
};

export function resolveBerthType(
  berthNumber: number,
  classCode: string,
  serverCode?: string | null
): BerthTypeInfo {
  const trimmed = serverCode?.trim().toUpperCase();
  if (trimmed === "L" || trimmed === "LB" || trimmed === "LOWER") {
    return { code: "LB", label: "Lower", isLower: true };
  }
  if (trimmed === "U" || trimmed === "UB" || trimmed === "UPPER") {
    return { code: "UB", label: "Upper", isLower: false };
  }
  if (trimmed === "M" || trimmed === "MB" || trimmed === "MIDDLE") {
    return { code: "MB", label: "Middle", isLower: false };
  }
  if (trimmed === "SL" || trimmed === "SLB" || trimmed === "SIDE LOWER") {
    return { code: "SL", label: "Side Lower", isLower: true };
  }
  if (trimmed === "SU" || trimmed === "SUB" || trimmed === "SIDE UPPER") {
    return { code: "SU", label: "Side Upper", isLower: false };
  }
  if (trimmed === "SM" || trimmed === "SMB" || trimmed === "SIDE MIDDLE") {
    return { code: "SM", label: "Side Middle", isLower: false };
  }
  if (trimmed === "WS" || trimmed === "WINDOW" || trimmed === "W") {
    return { code: "WS", label: "Window", isLower: false };
  }
  if (trimmed === "SEAT" || trimmed === "CHAIR" || trimmed === "S") {
    return { code: "SEAT", label: "Seat", isLower: false };
  }
  if (trimmed === "CB" || trimmed === "CABIN") {
    return { code: "CB", label: "Cabin", isLower: false };
  }
  if (trimmed === "CP" || trimmed === "COUPE") {
    return { code: "CP", label: "Coupe", isLower: false };
  }

  const num = Number(berthNumber);
  if (!num || isNaN(num)) return { code: "", label: "Berth", isLower: false };

  const cls = (classCode || "").toUpperCase();

  // Chair Car & Sitting (CC, 2S, EC, EA, EV): Seat based
  if (cls === "CC" || cls === "2S" || cls === "EC" || cls === "EA" || cls === "EV") {
    return { code: "SEAT", label: "Seat", isLower: false };
  }

  // 1A (AC First Class): 2 or 4 berths per coupe/cabin
  if (cls === "1A") {
    return num % 2 === 1
      ? { code: "LB", label: "Lower", isLower: true }
      : { code: "UB", label: "Upper", isLower: false };
  }

  // 2A: 6 berths per bay (1,3 LB, 2,4 UB, 5 SL, 6 SU)
  if (cls === "2A") {
    const mod = num % 6;
    if (mod === 1 || mod === 3) return { code: "LB", label: "Lower", isLower: true };
    if (mod === 2 || mod === 4) return { code: "UB", label: "Upper", isLower: false };
    if (mod === 5) return { code: "SL", label: "Side Lower", isLower: true };
    if (mod === 0) return { code: "SU", label: "Side Upper", isLower: false };
  } 

  // 3E (AC 3 Economy): 9 berths per bay
  if (cls === "3E") {
    const mod = num % 9;
    if (mod === 1 || mod === 4) return { code: "LB", label: "Lower", isLower: true };
    if (mod === 2 || mod === 5) return { code: "MB", label: "Middle", isLower: false };
    if (mod === 3 || mod === 6) return { code: "UB", label: "Upper", isLower: false };
    if (mod === 7) return { code: "SL", label: "Side Lower", isLower: true };
    if (mod === 8) return { code: "SM", label: "Side Middle", isLower: false };
    if (mod === 0) return { code: "SU", label: "Side Upper", isLower: false };
  }

  // 3A, SL (Sleeper Class - ICF 72 berths & LHB 80 berths): Standard 8-berth bay
  // 1, 4: Lower (LB) | 2, 5: Middle (MB) | 3, 6: Upper (UB) | 7: Side Lower (SL) | 8/0: Side Upper (SU)
  const mod = num % 8;
  if (mod === 1 || mod === 4) return { code: "LB", label: "Lower", isLower: true };
  if (mod === 2 || mod === 5) return { code: "MB", label: "Middle", isLower: false };
  if (mod === 3 || mod === 6) return { code: "UB", label: "Upper", isLower: false };
  if (mod === 7) return { code: "SL", label: "Side Lower", isLower: true };
  if (mod === 0) return { code: "SU", label: "Side Upper", isLower: false };

  return { code: "", label: "Berth", isLower: false };
}

export function formatChartTime(dtStr?: string | null): string {
  if (!dtStr) return "";
  try {
    const parts = dtStr.trim().split(" ");
    if (parts.length === 2) {
      const [h, m] = parts[1].split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    }
  } catch {}
  return dtStr;
}

