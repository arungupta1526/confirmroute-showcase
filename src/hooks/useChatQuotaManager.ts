"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { DEFAULT_MODEL_ID } from "@/src/lib/models";
import { UserProfileData } from "@/src/hooks/useAuth";
import { getOrCreateAnonymousSessionId } from "@/src/lib/auth/deviceId";

interface UseChatQuotaManagerOptions {
  profile: UserProfileData | null;
  modelId: string;
  setModelId: (modelId: string) => void;
  refreshProfile: () => void;
}

/**
 * Manages anonymous guest session IDs, terminal log toggles,
 * dev unlimited quota bypass, and automatic Fast <-> Balanced model switches.
 */
export function useChatQuotaManager({
  profile,
  modelId,
  setModelId,
  refreshProfile,
}: UseChatQuotaManagerOptions) {
  const [enableTerminalLogs, setEnableTerminalLogs] = useState<boolean>(true);
  const [enableDevUnlimited, setEnableDevUnlimited] = useState<boolean>(false);

  const setModelIdRef = useRef(setModelId);
  useEffect(() => {
    setModelIdRef.current = setModelId;
  }, [setModelId]);

  /**
   * anonSessionId is read SYNCHRONOUSLY from localStorage & cookie via useMemo.
   * This ensures it is NEVER an empty string on the first render/request.
   * Cookie + localStorage synchronization ensures guest quota survives Wi-Fi hopping.
   */
  const anonSessionId = useMemo(() => {
    return getOrCreateAnonymousSessionId();
  }, []);

  // Sync client-side localStorage settings (logs + dev-unlimited toggles)
  useEffect(() => {
    const storedLogs = localStorage.getItem("confirmroute_terminal_logs");
    if (storedLogs !== null) {
      setEnableTerminalLogs(storedLogs !== "false");
    }

    const storedDev = localStorage.getItem("confirmroute_dev_unlimited");
    setEnableDevUnlimited(storedDev === "true");

    const handleDevUnlimitedEvent = (e: any) => {
      const enabled = Boolean(e?.detail?.enabled);
      setEnableDevUnlimited(enabled);
      if (enabled) {
        setModelIdRef.current(DEFAULT_MODEL_ID);
      }
    };

    const handleTerminalLogsEvent = (e: any) => {
      if (e?.detail?.enabled !== undefined) {
        setEnableTerminalLogs(Boolean(e.detail.enabled));
      }
    };

    window.addEventListener("confirmroute:dev-unlimited-changed", handleDevUnlimitedEvent);
    window.addEventListener("confirmroute:terminal-logs-changed", handleTerminalLogsEvent);
    return () => {
      window.removeEventListener("confirmroute:dev-unlimited-changed", handleDevUnlimitedEvent);
      window.removeEventListener("confirmroute:terminal-logs-changed", handleTerminalLogsEvent);
    };
  }, []);

  const handleToggleDevUnlimited = (val: boolean) => {
    setEnableDevUnlimited(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("confirmroute_dev_unlimited", String(val));
    }
    if (val) {
      setModelId(DEFAULT_MODEL_ID);
    }
    setTimeout(() => {
      refreshProfile();
    }, 50);
  };

  // Auto-shift model between Fast and Balanced models based on quota availability
  useEffect(() => {
    if (!profile) return;
    const hasQuota =
      enableDevUnlimited || profile.isDevUnlimited || (profile.remainingSearches ?? 0) > 0;
    if (hasQuota) {
      if (modelId === "gemma-4-31b-it") {
        setModelId(DEFAULT_MODEL_ID);
      }
    } else {
      if (modelId !== "gemma-4-31b-it") {
        setModelId("gemma-4-31b-it");
      }
    }
  }, [profile, enableDevUnlimited, modelId, setModelId]);

  return {
    anonSessionId,
    enableTerminalLogs,
    enableDevUnlimited,
    handleToggleDevUnlimited,
  };
}
