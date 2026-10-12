"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client";
import { extractStationCode } from "@/components/widgets/stationHelper";

export interface SavedJourney {
  id: string;
  origin: string;
  destination: string;
  travel_class?: string;
  created_at: string;
}

// Global module-level store for saved journeys
let cachedJourneys: SavedJourney[] | null = null;
let lastFetchTime = 0;
let inflightJourneysPromise: Promise<SavedJourney[]> | null = null;
const CACHE_TTL_MS = 30_000; // 30s cache TTL

const listeners = new Set<() => void>();

function notifyListeners() {
  if (typeof window === "undefined") return;
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
  window.dispatchEvent(
    new CustomEvent("confirmroute:saved-routes-updated", {
      detail: { journeys: cachedJourneys || [] },
    })
  );
}

async function getClientAccessToken(): Promise<string | undefined> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return undefined;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token;
  } catch {
    return undefined;
  }
}

export async function fetchSavedJourneysGlobal(
  tokenOverride?: string,
  force: boolean = false
): Promise<SavedJourney[]> {
  const now = Date.now();
  if (!force && cachedJourneys !== null && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedJourneys;
  }

  if (inflightJourneysPromise) {
    const res = await inflightJourneysPromise;
    return res || [];
  }

  inflightJourneysPromise = (async (): Promise<SavedJourney[]> => {
    try {
      const token = tokenOverride || (await getClientAccessToken());
      if (!token) {
        cachedJourneys = [];
        lastFetchTime = Date.now();
        return [];
      }

      const res = await fetch("/api/user/saved-journeys", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        const list: SavedJourney[] = json.journeys || [];
        const changed = !cachedJourneys || cachedJourneys.length !== list.length || cachedJourneys.some((j, i) => j.id !== list[i]?.id);
        cachedJourneys = list;
        lastFetchTime = Date.now();
        if (changed) {
          notifyListeners();
        }
        return list;
      }
    } catch (err) {
      console.warn("[useSavedRoutes] Failed to fetch saved journeys:", err);
    } finally {
      inflightJourneysPromise = null;
    }
    return cachedJourneys || [];
  })();

  const result = await inflightJourneysPromise;
  return result || [];
}

export function isRouteSavedHelper(
  journeys: SavedJourney[] | null,
  origin?: string | null,
  destination?: string | null
): boolean {
  if (!journeys || !origin || !destination) return false;
  const srcCode = extractStationCode(origin);
  const dstCode = extractStationCode(destination);
  if (!srcCode || !dstCode) return false;

  return journeys.some((j) => {
    const jSrc = extractStationCode(j.origin);
    const jDst = extractStationCode(j.destination);
    return jSrc === srcCode && jDst === dstCode;
  });
}

export function useSavedRoutes(accessToken?: string) {
  const [, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(cachedJourneys === null);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  // Fetch initial journeys on mount or when accessToken changes
  useEffect(() => {
    let mounted = true;
    fetchSavedJourneysGlobal(accessToken)
      .then(() => {
        if (mounted) setIsLoading(false);
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const journeys = useMemo(() => cachedJourneys || [], [cachedJourneys]);

  const isSaved = useCallback(
    (origin?: string | null, destination?: string | null) => {
      return isRouteSavedHelper(cachedJourneys, origin, destination);
    },
    []
  );

  const getSavedJourney = useCallback(
    (origin?: string | null, destination?: string | null): SavedJourney | undefined => {
      if (!cachedJourneys || !origin || !destination) return undefined;
      const srcCode = extractStationCode(origin);
      const dstCode = extractStationCode(destination);
      return cachedJourneys.find((j) => {
        const jSrc = extractStationCode(j.origin);
        const jDst = extractStationCode(j.destination);
        return jSrc === srcCode && jDst === dstCode;
      });
    },
    []
  );

  const saveRoute = useCallback(
    async (
      origin: string,
      destination: string,
      travelClass?: string
    ): Promise<{ success: boolean; error?: string; alreadySaved?: boolean; requiresAuth?: boolean }> => {
      const token = accessToken || (await getClientAccessToken());
      if (!token) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("confirmroute:open-account-modal", { detail: { tab: "auth" } })
          );
        }
        return {
          success: false,
          error: "Please sign in to save routes",
          requiresAuth: true,
        };
      }

      const srcCode = extractStationCode(origin);
      const dstCode = extractStationCode(destination);

      try {
        const res = await fetch("/api/user/saved-journeys", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            origin: srcCode,
            destination: dstCode,
            travelClass,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          return { success: false, error: json.error || "Failed to save route" };
        }

        if (json.journey) {
          const newJourney: SavedJourney = json.journey;
          if (!cachedJourneys) cachedJourneys = [];
          // Avoid duplicate in local state
          const exists = cachedJourneys.some((j) => j.id === newJourney.id);
          if (!exists) {
            cachedJourneys = [newJourney, ...cachedJourneys];
            notifyListeners();
          }
        } else {
          await fetchSavedJourneysGlobal(token, true);
        }

        return { success: true, alreadySaved: Boolean(json.alreadySaved) };
      } catch (err: any) {
        return { success: false, error: err?.message || "Network error" };
      }
    },
    [accessToken]
  );

  const deleteRoute = useCallback(
    async (id: string): Promise<boolean> => {
      const token = accessToken || (await getClientAccessToken());
      if (!token) return false;

      try {
        const res = await fetch(`/api/user/saved-journeys?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          if (cachedJourneys) {
            cachedJourneys = cachedJourneys.filter((j) => j.id !== id);
            notifyListeners();
          }
          return true;
        }
      } catch (err) {
        console.warn("[useSavedRoutes] Delete error:", err);
      }
      return false;
    },
    [accessToken]
  );

  const toggleRoute = useCallback(
    async (
      origin: string,
      destination: string,
      travelClass?: string
    ): Promise<{ saved: boolean; error?: string }> => {
      const existing = getSavedJourney(origin, destination);
      if (existing) {
        const deleted = await deleteRoute(existing.id);
        return { saved: !deleted };
      }
      const res = await saveRoute(origin, destination, travelClass);
      return { saved: res.success, error: res.error };
    },
    [getSavedJourney, deleteRoute, saveRoute]
  );

  const refreshJourneys = useCallback(() => {
    return fetchSavedJourneysGlobal(accessToken, true);
  }, [accessToken]);

  return {
    journeys,
    isLoading,
    isSaved,
    getSavedJourney,
    saveRoute,
    deleteRoute,
    toggleRoute,
    refreshJourneys,
  };
}
