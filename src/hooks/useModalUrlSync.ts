"use client";

import { useState, useEffect } from "react";
import type { AccountTabType } from "@/components/account/AccountModalTabs";

export function useModalUrlSync() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<AccountTabType>("plan");
  const [accountModalPlan, setAccountModalPlan] = useState<string | undefined>(undefined);

  const handleOpenAccountModal = (
    tab: AccountTabType = "plan",
    plan?: string
  ) => {
    setAccountModalTab(tab);
    setAccountModalPlan(plan);
    setIsAccountModalOpen(true);
    setIsMcpModalOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("openAccount", "true");
      url.searchParams.set("tab", tab);
      if (tab === "plan" && plan) {
        url.searchParams.set("plan", plan);
      } else {
        url.searchParams.delete("plan");
      }
      url.searchParams.delete("mcpModal");
      window.history.pushState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
    }
  };

  const handleCloseAccountModal = () => {
    setIsAccountModalOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("openAccount");
      url.searchParams.delete("tab");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
    }
  };

  const handleOpenMcpModal = () => {
    setIsMcpModalOpen(true);
    setIsAccountModalOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mcpModal", "true");
      url.searchParams.delete("openAccount");
      url.searchParams.delete("tab");
      url.searchParams.delete("plan");
      window.history.pushState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
    }
  };

  const handleCloseMcpModal = () => {
    setIsMcpModalOpen(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("mcpModal");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
    }
  };

  // Synchronize modal open/close states with URL search params and popstate (Back/Forward)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncModalsFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openAccount") === "true") {
        const tab = params.get("tab");
        if (tab === "invoices") {
          window.location.href = "/account?tab=invoices";
          return;
        }
        if (tab === "auth") {
          window.location.href = "/auth?mode=signin&redirect=/account";
          return;
        }
        if (tab === "mcp" || tab === "plan") {
          setAccountModalTab(tab);
        }
        const plan = params.get("plan");
        if (plan) {
          setAccountModalPlan(plan);
        }
        setIsAccountModalOpen(true);
        setIsMcpModalOpen(false);
      } else if (params.get("mcpModal") === "true") {
        setIsMcpModalOpen(true);
        setIsAccountModalOpen(false);
      } else {
        setIsAccountModalOpen(false);
        setIsMcpModalOpen(false);
      }
    };

    syncModalsFromUrl();
    window.addEventListener("popstate", syncModalsFromUrl);
    return () => window.removeEventListener("popstate", syncModalsFromUrl);
  }, []);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    isMcpModalOpen,
    setIsMcpModalOpen,
    isAccountModalOpen,
    accountModalTab,
    accountModalPlan,
    handleOpenAccountModal,
    handleCloseAccountModal,
    handleOpenMcpModal,
    handleCloseMcpModal,
  };
}
