/**
 * ConfirmRoute Showcase Plan Configuration
 * Lightweight client presentation definitions for showcase mode.
 * Contains ZERO proprietary payment pricing, payment gateway IDs, or billing ledgers.
 */

export type PlanTierId =
  | "guest"
  | "traveler_free"
  | "traveler_pro"
  | "developer_pro";

export interface PlanTierConfig {
  id: string;
  name: string;
  searchLimit: number;
  searchAllowance: string;
  maxSavedRoutes: number;
}

export function getPlanConfig(planId?: string | null): PlanTierConfig {
  const normalized = (planId || "traveler_free").toLowerCase().trim();
  if (normalized.includes("guest") || normalized === "anonymous") {
    return {
      id: "guest",
      name: "Guest Traveler",
      searchLimit: 15,
      searchAllowance: "15 Daily Searches",
      maxSavedRoutes: 5,
    };
  }
  if (normalized.includes("pro") || normalized.includes("dev")) {
    return {
      id: "traveler_pro",
      name: "Traveler Pro",
      searchLimit: 999999,
      searchAllowance: "Unlimited Searches",
      maxSavedRoutes: 50,
    };
  }
  return {
    id: "traveler_free",
    name: "Registered Traveler",
    searchLimit: 50,
    searchAllowance: "50 Daily Searches",
    maxSavedRoutes: 20,
  };
}

export function getMaxSavedRoutes(planId?: string | null): number {
  const normalized = (planId || "").toLowerCase();
  if (normalized.includes("pro") || normalized.includes("dev")) return 50;
  if (normalized.includes("guest")) return 5;
  return 20;
}

export function isProPlan(planId?: string | null): boolean {
  return Boolean(planId && (planId.includes("pro") || planId.includes("dev")));
}

export function isDeveloperPlan(planId?: string | null): boolean {
  return Boolean(planId && planId.includes("developer"));
}
