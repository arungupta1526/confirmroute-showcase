import { Station } from "../types";
import { MAJOR_STATIONS } from "../config/majorStations.config";

const REGIONAL_STATION_DICTIONARY: Record<string, string> = {
  SCL: "Silchar",
  BPB: "Badarpur",
  KXJ: "Karimganj",
  KTX: "Katakhal",
  NHLN: "Naharlagun",
  AGTL: "Agartala",
  SANG: "Sairang",
  BHRB: "Bairabi",
  MZS: "Murkongselek",
  ARCL: "Arunachal",
};

/**
 * Station autocomplete via proxy to backend or high-speed local major stations catalog.
 * 100% free of web scrapers or third-party scraper tokens.
 */
export async function lookupStations(query: string): Promise<Station[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 1. Try proxying to private backend gateway if configured
  const backendUrl = (
    process.env.RAILWAY_GATEWAY_URL ||
    process.env.BACKEND_API_URL ||
    ""
  ).trim().replace(/\/+$/, "");

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/api/stations/search?q=${encodeURIComponent(trimmed)}`, {
        headers: {
          ...(process.env.RAILWAY_GATEWAY_SECRET
            ? { "x-gateway-secret": process.env.RAILWAY_GATEWAY_SECRET }
            : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.stations) && json.stations.length > 0) {
          return json.stations.map((s: any) => ({
            stationCode: s.code || s.stationCode,
            stationName: s.name || s.stationName,
            city: s.city ?? null,
            state: s.state ?? null,
            isMajor: Boolean(s.isMajor),
          }));
        }
      }
    } catch {
      // Local dictionary fallback below
    }
  }

  // 2. High-speed local dictionary fallback
  const upper = trimmed.toUpperCase();
  const results: Station[] = [];

  for (const [code, name] of Object.entries(MAJOR_STATIONS)) {
    if (code.startsWith(upper) || name.toUpperCase().includes(upper)) {
      results.push({
        stationCode: code,
        stationName: name,
        city: null,
        state: null,
        isMajor: true,
      });
      if (results.length >= 15) break;
    }
  }

  return results;
}

/**
 * Find the best matching station from search results based on query.
 */
export function findBestStation(matches: Station[], query: string): Station | null {
  if (!matches || matches.length === 0) return null;
  const upper = query.trim().toUpperCase();

  // 1. Exact match for station code (e.g. NDLS, BSBS, PNBE, BXR, DLN, BPL)
  const exactCode = matches.find((m) => m.stationCode.toUpperCase() === upper);
  if (exactCode) return exactCode;

  // 2. Exact match for station name or city
  const exactName = matches.find(
    (m) => m.stationName.toUpperCase() === upper || (m.city && m.city.toUpperCase() === upper)
  );
  if (exactName) return exactName;

  // 3. Prefix match: station name starts with query
  const prefixMatch = matches.find(
    (m) =>
      m.stationName.toUpperCase().startsWith(upper) ||
      (m.city && m.city.toUpperCase().startsWith(upper))
  );
  if (prefixMatch) return prefixMatch;

  // 4. Word boundary match
  const escapedUpper = upper.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRegex = new RegExp(`(^|\\s)${escapedUpper}(\\s|$)`, "i");
  const wordMatch = matches.find(
    (m) => wordRegex.test(m.stationName) || (m.city && wordRegex.test(m.city))
  );
  if (wordMatch) return wordMatch;

  // 5. Prefer major station
  const major = matches.find((m) => m.isMajor);
  if (major) return major;

  return matches[0];
}

/**
 * Resolve a user-supplied origin/destination (code or city name) to a single IRCTC station code.
 */
export async function resolveStationCode(input: string): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Station code or name cannot be empty.");
  }

  try {
    const matches = await lookupStations(trimmed);
    const best = findBestStation(matches, trimmed);
    if (best) return best.stationCode;
  } catch {
    // Fall back to direct dictionary matches below
  }

  const lower = trimmed.toLowerCase();
  const known = Object.entries(REGIONAL_STATION_DICTIONARY).find(([code, name]) => {
    const cleanName = name.toLowerCase().replace(/\s+jn|\s+cantt|\s+central/g, "");
    return (
      cleanName === lower ||
      cleanName.startsWith(lower) ||
      cleanName.includes(lower) ||
      code.toLowerCase() === lower
    );
  });
  if (known) return known[0];

  if (/^[A-Za-z]{2,5}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  throw new Error(`No station found matching "${input}". Try a more specific name or the station code.`);
}

/**
 * Dynamically resolve any IRCTC station code to its friendly station name.
 */
export async function resolveStationName(code: string): Promise<string> {
  const upper = code.trim().toUpperCase();
  if (MAJOR_STATIONS[upper]) {
    return MAJOR_STATIONS[upper];
  }
  if (REGIONAL_STATION_DICTIONARY[upper]) {
    return REGIONAL_STATION_DICTIONARY[upper];
  }
  return upper;
}
