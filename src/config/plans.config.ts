/**
 * ConfirmRoute Universal Dynamic Plan Configuration
 *
 * Central source of truth for all plan tiers, pricing, search quotas,
 * allowed AI models count, saved routes limits, and MCP access across the entire app.
 * Only canonical monthly plans: guest, traveler_free, traveler_basic, traveler_pro,
 * developer_free, developer_basic, developer_pro. NO annual plans.
 */

export type PlanTierId =
  | "guest"
  | "traveler_free"
  | "traveler_basic"
  | "traveler_pro"
  | "developer_free"
  | "developer_basic"
  | "developer_pro";

export interface PlanTierConfig {
  id: PlanTierId;
  name: string;
  badge?: string;
  priceFormatted: {
    monthly: string;
  };
  priceNumber: {
    monthly: number;
  };
  originalPriceFormatted?: {
    monthly: string;
  };
  originalPriceNumber?: {
    monthly: number;
  };
  discountBadge?: string;
  discountPercent?: number;
  period: string;
  searchAllowance: string;
  searchLimit: number; // Daily or monthly numeric limit
  searchLimitType: "daily" | "monthly";
  maxModels: number | "all";
  allowedModelIds?: string[];
  maxSavedRoutes: number; // 0 = none, 2 = free, 10 = basic, 25 = pro
  mcpKeysAllowed: number | "unlimited";
  mcpCreditsFormatted: string;
  historyRetention: string;
  priorityQueue: boolean;
  description: string;
  highlights: string[];
}

export const GUEST_ALLOWED_MODELS = [
  "AUTO",
  "FAST",
  "BALANCED",
  "auto",
  "gemini-3.1-flash-lite",
];

export const FREE_ALLOWED_MODELS = [
  "AUTO",
  "FAST",
  "BALANCED",
  "auto",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

export const PRO_MONTHLY_ALLOWED_MODELS = [
  "AUTO",
  "FAST",
  "BALANCED",
  "ADVANCED",
  "auto",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
  "gemma-4-31b-it",
  "openrouter/free",
];

export const PLAN_TIERS: Record<PlanTierId, PlanTierConfig> = {
  guest: {
    id: "guest",
    name: "Guest Traveler",
    priceFormatted: {
      monthly: "₹0",
    },
    priceNumber: {
      monthly: 0,
    },
    period: "forever",
    searchAllowance: "5 searches / day",
    searchLimit: 5,
    searchLimitType: "daily",
    maxModels: 1,
    allowedModelIds: GUEST_ALLOWED_MODELS,
    maxSavedRoutes: 0,
    mcpKeysAllowed: 0,
    mcpCreditsFormatted: "No MCP access",
    historyRetention: "Session only",
    priorityQueue: false,
    description: "Quick one-off lookups without signing in. Tracked by client IP.",
    highlights: [
      "5 daily searches (resets midnight IST)",
      "3 AI capability modes (Auto, Fast, Balanced)",
      "Live running status & delay checks",
      "10-digit PNR status & charting",
    ],
  },
  traveler_free: {
    id: "traveler_free",
    name: "Free Account",
    badge: "Free Forever",
    priceFormatted: {
      monthly: "₹0",
    },
    priceNumber: {
      monthly: 0,
    },
    period: "forever",
    searchAllowance: "10 searches / day",
    searchLimit: 10,
    searchLimitType: "daily",
    maxModels: 3,
    allowedModelIds: FREE_ALLOWED_MODELS,
    maxSavedRoutes: 2,
    mcpKeysAllowed: 1,
    mcpCreditsFormatted: "100 trial credits",
    historyRetention: "Local 3-day history",
    priorityQueue: false,
    description: "Sign up with email for 2x higher search limits, AI modes & 2 saved routes.",
    highlights: [
      "10 daily searches (2x guest limits)",
      "3 AI capability modes (Auto, Fast, Balanced)",
      "2 Saved Favorite Routes for 1-click checks",
      "1 personal MCP API key (100 trial credits)",
      "2-leg connecting train discovery",
    ],
  },
  traveler_basic: {
    id: "traveler_basic",
    name: "Traveler Basic",
    badge: "Popular",
    priceFormatted: {
      monthly: "₹149",
    },
    priceNumber: {
      monthly: 149,
    },
    originalPriceFormatted: {
      monthly: "₹299",
    },
    originalPriceNumber: {
      monthly: 299,
    },
    discountBadge: "50% OFF",
    discountPercent: 50,
    period: "month",
    searchAllowance: "500 searches / month",
    searchLimit: 500,
    searchLimitType: "monthly",
    maxModels: 4,
    allowedModelIds: PRO_MONTHLY_ALLOWED_MODELS,
    maxSavedRoutes: 25,
    mcpKeysAllowed: 0,
    mcpCreditsFormatted: "No MCP access",
    historyRetention: "30-day cloud history",
    priorityQueue: false,
    description: "Standard rail intelligence: 500 searches/month & 25 saved favorite routes.",
    highlights: [
      "500 smart searches / month",
      "All 4 AI capability modes (Auto, Fast, Balanced, Advanced)",
      "25 Saved Favorite Routes",
      "30-day cross-device cloud history",
    ],
  },
  traveler_pro: {
    id: "traveler_pro",
    name: "Traveler Pro",
    badge: "Recommended",
    priceFormatted: {
      monthly: "₹249",
    },
    priceNumber: {
      monthly: 249,
    },
    originalPriceFormatted: {
      monthly: "₹499",
    },
    originalPriceNumber: {
      monthly: 499,
    },
    discountBadge: "50% OFF",
    discountPercent: 50,
    period: "month",
    searchAllowance: "1,000 searches / month",
    searchLimit: 1000,
    searchLimitType: "monthly",
    maxModels: "all",
    maxSavedRoutes: -1,
    mcpKeysAllowed: 0,
    mcpCreditsFormatted: "No MCP access",
    historyRetention: "90-day persistent cloud history",
    priorityQueue: true,
    description: "Advanced intelligence: 1,000 searches/mo, Tatkal speed & unlimited saved routes.",
    highlights: [
      "1,000 smart searches / month",
      "All AI capability modes unlocked",
      "Unlimited Saved Favorite Routes",
      "VIP priority processing during Tatkal rush",
      "90-day persistent cross-device history",
    ],
  },
  developer_free: {
    id: "developer_free",
    name: "Developer Free",
    priceFormatted: {
      monthly: "₹0",
    },
    priceNumber: {
      monthly: 0,
    },
    period: "forever",
    searchAllowance: "100 credits / month",
    searchLimit: 100,
    searchLimitType: "monthly",
    maxModels: 1,
    maxSavedRoutes: 0,
    mcpKeysAllowed: 1,
    mcpCreditsFormatted: "100 credits / mo",
    historyRetention: "3-day logs",
    priorityQueue: false,
    description: "Test MCP & API: 100 credits/month, 1 key, 30 req/min.",
    highlights: [
      "100 MCP credits / month",
      "1 active MCP API key",
      "30 req/min burst limit",
    ],
  },
  developer_basic: {
    id: "developer_basic",
    name: "Developer Basic",
    badge: "Developer",
    priceFormatted: {
      monthly: "₹299",
    },
    priceNumber: {
      monthly: 299,
    },
    originalPriceFormatted: {
      monthly: "₹499",
    },
    originalPriceNumber: {
      monthly: 499,
    },
    discountBadge: "40% OFF",
    discountPercent: 40,
    period: "month",
    searchAllowance: "2,000 credits / month",
    searchLimit: 2000,
    searchLimitType: "monthly",
    maxModels: "all",
    maxSavedRoutes: 0,
    mcpKeysAllowed: 3,
    mcpCreditsFormatted: "2,000 credits / mo",
    historyRetention: "30-day logs",
    priorityQueue: false,
    description: "Standard tools & analytics: 2,000 credits/month, 3 keys, 60 req/min.",
    highlights: [
      "2,000 MCP tool credits / month",
      "Up to 3 active MCP API keys",
      "60 req/min burst limit",
      "Remote MCP SSE endpoint for Claude & Cursor",
    ],
  },
  developer_pro: {
    id: "developer_pro",
    name: "Developer Pro",
    badge: "High Throughput",
    priceFormatted: {
      monthly: "₹599",
    },
    priceNumber: {
      monthly: 599,
    },
    originalPriceFormatted: {
      monthly: "₹999",
    },
    originalPriceNumber: {
      monthly: 999,
    },
    discountBadge: "40% OFF",
    discountPercent: 40,
    period: "month",
    searchAllowance: "5,000 credits / month",
    searchLimit: 5000,
    searchLimitType: "monthly",
    maxModels: "all",
    maxSavedRoutes: 0,
    mcpKeysAllowed: 10,
    mcpCreditsFormatted: "5,000 credits / mo",
    historyRetention: "90-day logs",
    priorityQueue: true,
    description: "Advanced analytics: 5,000 credits/month, 10 keys, 120 req/min.",
    highlights: [
      "5,000 MCP tool credits / month",
      "Up to 10 active MCP API keys",
      "120 req/min burst limit",
      "Dedicated bandwidth & priority queue",
    ],
  },
};

/**
 * Helper to get plan config by user's plan ID
 */
export function getPlanConfig(planId?: string | null): PlanTierConfig {
  if (!planId) return PLAN_TIERS.guest;
  const normalized = planId.toLowerCase().trim();

  if (
    normalized === "traveler_pro_monthly" ||
    normalized === "traveler_pro"
  ) {
    return PLAN_TIERS.traveler_pro;
  }
  if (
    normalized === "developer_pro_monthly" ||
    normalized === "developer_pro"
  ) {
    return PLAN_TIERS.developer_pro;
  }
  if (
    normalized === "developer_basic_monthly" ||
    normalized === "developer_basic"
  ) {
    return PLAN_TIERS.developer_basic;
  }
  if (normalized === "developer_free") {
    return PLAN_TIERS.developer_free;
  }
  if (
    normalized === "traveler_basic_monthly" ||
    normalized === "traveler_basic" ||
    normalized === "user_monthly" ||
    normalized === "pro"
  ) {
    return PLAN_TIERS.traveler_basic;
  }
  if (
    normalized === "traveler_free" ||
    normalized === "free" ||
    normalized === "authenticated"
  ) {
    return PLAN_TIERS.traveler_free;
  }
  if (normalized === "dev_unlimited") {
    return {
      ...PLAN_TIERS.traveler_pro,
      name: "Developer Unlimited",
      searchAllowance: "Unlimited (Dev Mode)",
      searchLimit: 999999,
    };
  }
  return PLAN_TIERS.guest;
}

/**
 * Check if a model is allowed for a user's tier
 */
export function isModelAllowedForTier(modelId: string, planId?: string | null): boolean {
  const plan = getPlanConfig(planId);
  if (plan.maxModels === "all" || !plan.allowedModelIds) {
    return true;
  }
  return plan.allowedModelIds.includes(modelId);
}

/**
 * Get the max allowed saved routes for a given tier
 */
export function getMaxSavedRoutes(planId?: string | null): number {
  const plan = getPlanConfig(planId);
  return plan.maxSavedRoutes;
}

/**
 * Get required tier name for a model
 */
export function getRequiredTierForModel(modelId: string): string {
  if (GUEST_ALLOWED_MODELS.includes(modelId)) return "Guest";
  if (FREE_ALLOWED_MODELS.includes(modelId)) return "Free Account";
  if (PRO_MONTHLY_ALLOWED_MODELS.includes(modelId)) return "Traveler Basic";
  return "Traveler Pro";
}
