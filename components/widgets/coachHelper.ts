/**
 * Cleans raw railway coach strings like "SL:S7", "3A:B2", "En:", "GS:S1", or ":S7"
 * into a clean, human-readable coach identifier like "S7", "B2", "ENG", "GS".
 */
export function cleanCoachToken(rawToken: string | null | undefined): string {
  if (!rawToken || typeof rawToken !== "string") return "";
  const token = rawToken.trim();
  if (!token) return "";

  if (token.includes(":")) {
    const parts = token.split(":").map((p) => p.trim());
    const prefix = (parts[0] || "").toUpperCase();
    const suffix = (parts[1] || "").toUpperCase();

    // If suffix exists and is a valid coach identifier (e.g. S7, B2, A1, H1, GS1, PC, etc.)
    if (suffix) {
      if (suffix === "ENG" || suffix === "LOCO" || suffix === "L" || suffix === "EN") return "ENG";
      return suffix;
    }

    // If suffix is empty (e.g. "En:", "GS:", "SLR:", "PC:", "CC:")
    if (prefix === "EN" || prefix === "ENG" || prefix === "LOCO") return "ENG";
    if (prefix) return prefix;
  }

  const upper = token.toUpperCase();
  if (upper === "EN" || upper === "LOCO") return "ENG";
  return upper;
}

export function getCoachColor(code: string, type?: string): string {
  const upper = cleanCoachToken(code);
  const typeUpper = (type || "").toUpperCase();

  if (upper === "ENG" || upper === "LOCO" || upper === "SLR" || upper === "L" || typeUpper.includes("ENGINE")) {
    return "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/35 hover:border-amber-400/80";
  }
  if (upper.startsWith("GEN") || upper.startsWith("GS") || upper.startsWith("UR") || typeUpper.includes("GENERAL")) {
    return "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500";
  }
  if (upper === "PC" || upper.startsWith("PANTRY") || typeUpper.includes("PANTRY")) {
    return "bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900/80 hover:border-amber-500";
  }
  // Executive class coaches (EC, EA, E)
  if (upper.startsWith("EA") || upper.startsWith("EC") || upper === "E" || typeUpper.includes("EXECUTIVE")) {
    return "bg-purple-950/60 text-purple-300 border-purple-800/60 hover:bg-purple-900/80 hover:border-purple-400";
  }
  // Sleeper (S1–S12, SL)
  if (upper.startsWith("S") || upper === "SL" || typeUpper.includes("SLEEPER")) {
    return "bg-sky-950/60 text-sky-300 border-sky-800/60 hover:bg-sky-900/90 hover:border-sky-400 hover:text-sky-200";
  }
  // 3A / 3E (B, M prefix)
  if (upper.startsWith("B") || upper.startsWith("M") || typeUpper.includes("3A") || typeUpper.includes("3E")) {
    return "bg-indigo-950/60 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900/90 hover:border-indigo-400 hover:text-indigo-200";
  }
  // 2A (A prefix)
  if (upper.startsWith("A") || typeUpper.includes("2A")) {
    return "bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/90 hover:border-emerald-400 hover:text-emerald-200";
  }
  // 1A / Composite (H, HA prefix)
  if (upper.startsWith("H") || typeUpper.includes("1A") || typeUpper.includes("FIRST")) {
    return "bg-rose-950/60 text-rose-300 border-rose-800/60 hover:bg-rose-900/90 hover:border-rose-400 hover:text-rose-200";
  }
  // Chair Car (CC, C prefix)
  if (upper.startsWith("C") || typeUpper.includes("CHAIR") || typeUpper.includes("CC")) {
    return "bg-cyan-950/60 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/90 hover:border-cyan-400 hover:text-cyan-200";
  }
  return "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200";
}

/**
 * Splits a space- or comma-separated coachPosition string into clean coach tokens.
 * Handles patterns like "L SLR GS S1 S2 PC B1", "En:ENG,GS:GS1,SL:S7", ",En:,GS:,GS:S1,SL:S2"
 */
export function parseCoachPosition(rawSequence: string | null | undefined): string[] {
  if (!rawSequence || typeof rawSequence !== "string") return [];
  return rawSequence
    .trim()
    .split(/[,\s]+/)
    .map((token) => cleanCoachToken(token))
    .filter((token) => token.length > 0);
}
