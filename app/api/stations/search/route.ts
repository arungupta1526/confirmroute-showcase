import { NextRequest, NextResponse } from "next/server";
import { lookupStations } from "@/src/utils/stations";
import { MAJOR_STATIONS } from "@/components/widgets/majorStationsData";

export const dynamic = "force-dynamic";

interface CachedStations {
  data: Array<{
    code: string;
    name: string;
    city: string | null;
    state: string | null;
    isMajor: boolean;
  }>;
  expiresAt: number;
}

const stationSearchCache = new Map<string, CachedStations>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2 || query.length > 50) {
    return NextResponse.json({ stations: [] });
  }

  const cacheKey = query.toLowerCase();
  const cached = stationSearchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ stations: cached.data });
  }

  try {
    const rawStations = await lookupStations(query);

    const stations = rawStations.map((s) => ({
      code: s.stationCode,
      name: s.stationName,
      city: s.city,
      state: s.state,
      isMajor: s.isMajor,
    }));

    // If upstream returns empty, fallback to local major stations dictionary match
    if (stations.length === 0) {
      const upperQuery = query.toUpperCase();
      for (const [code, name] of Object.entries(MAJOR_STATIONS)) {
        if (
          code.startsWith(upperQuery) ||
          name.toUpperCase().includes(upperQuery)
        ) {
          stations.push({
            code,
            name,
            city: null,
            state: null,
            isMajor: true,
          });
          if (stations.length >= 10) break;
        }
      }
    }

    // Keep cache bounded
    if (stationSearchCache.size > 200) {
      const oldestKey = stationSearchCache.keys().next().value;
      if (oldestKey) stationSearchCache.delete(oldestKey);
    }

    stationSearchCache.set(cacheKey, {
      data: stations,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({ stations });
  } catch (error) {
    console.error("[StationSearchAPI] Error resolving stations:", error);
    return NextResponse.json({ stations: [] });
  }
}
