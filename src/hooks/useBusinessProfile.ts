"use client";

import { useState, useEffect } from "react";
import { BusinessProfile, DEFAULT_BUSINESS_PROFILE } from "@/src/lib/settings/business-profile-service";

let cachedProfile: BusinessProfile | null = null;
let inflightPromise: Promise<BusinessProfile | null> | null = null;
const listeners = new Set<(p: BusinessProfile) => void>();

async function fetchProfile(force = false): Promise<BusinessProfile | null> {
  if (cachedProfile && !force) {
    return cachedProfile;
  }
  if (inflightPromise && !force) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
    try {
      const res = await fetch("/api/business-profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          cachedProfile = data.profile;
          listeners.forEach((fn) => fn(data.profile));
          return data.profile;
        }
      }
    } catch {
      // Fallback
    } finally {
      inflightPromise = null;
    }
    return null;
  })();

  return inflightPromise;
}

export function useBusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfile>(cachedProfile || DEFAULT_BUSINESS_PROFILE);
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    let isMounted = true;

    const handleUpdate = (updated: BusinessProfile) => {
      if (isMounted) {
        setProfile(updated);
        setLoading(false);
      }
    };
    listeners.add(handleUpdate);

    if (!cachedProfile) {
      fetchProfile().then((data) => {
        if (isMounted) {
          if (data) setProfile(data);
          setLoading(false);
        }
      });
    }

    const handleRefresh = () => {
      fetchProfile(true).then((data) => {
        if (isMounted && data) {
          setProfile(data);
        }
      });
    };

    window.addEventListener("confirmroute:business-profile-updated", handleRefresh);
    window.addEventListener("confirmroute:admin-refresh", handleRefresh);

    return () => {
      isMounted = false;
      listeners.delete(handleUpdate);
      window.removeEventListener("confirmroute:business-profile-updated", handleRefresh);
      window.removeEventListener("confirmroute:admin-refresh", handleRefresh);
    };
  }, []);

  return { profile, loading };
}
