export type CapabilityMode = "AUTO" | "FAST" | "BALANCED" | "ADVANCED" | string;

export interface CapabilityModeOption {
  id: CapabilityMode;
  name: string;
  title: string;
  description: string;
  badge: string;
  isPro?: boolean;
}

export const AUTO_MODEL_ID = "AUTO";
export const DEFAULT_MODEL_ID = "AUTO";

export const CAPABILITY_MODES: CapabilityModeOption[] = [
  {
    id: "AUTO",
    name: "Auto (Recommended)",
    title: "✨ Auto",
    description: "Intelligent auto-router selects the optimal engine based on your query.",
    badge: "Smart Router",
  },
  {
    id: "FAST",
    name: "Fast",
    title: "⚡ Fast",
    description: "Sub-second response speed for FAQs, railway definitions, and quick chat.",
    badge: "Low Latency",
  },
  {
    id: "BALANCED",
    name: "Balanced",
    title: "⚖️ Balanced",
    description: "Standard Indian Railways travel agent for live seats, PNR, and routes.",
    badge: "Travel Agent",
  },
  {
    id: "ADVANCED",
    name: "Advanced",
    title: "🧠 Advanced",
    description: "Deep multi-criteria reasoning for journey comparison and tradeoffs.",
    badge: "Pro Engine",
    isPro: true,
  },
];

export function normalizeToCapabilityMode(input?: string | null): CapabilityMode {
  if (!input) return "AUTO";
  const upper = input.toUpperCase().trim();
  if (upper === "AUTO" || upper === "FAST" || upper === "BALANCED" || upper === "ADVANCED") {
    return upper as CapabilityMode;
  }
  const lower = input.toLowerCase();
  if (lower.includes("fast") || lower.includes("lite") || lower.includes("quick")) return "FAST";
  if (lower.includes("reasoning") || lower.includes("advanced") || lower.includes("deep")) return "ADVANCED";
  return "BALANCED";
}

// Backward compatibility interface for legacy components
export interface ModelOption {
  id: string;
  name: string;
  provider: "confirmroute" | "cloud" | string;
  providerGroup: string;
  isFree?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "AUTO", name: "✨ Auto (Smart Router)", provider: "confirmroute", providerGroup: "ConfirmRoute AI", isFree: true },
  { id: "FAST", name: "⚡ Fast (Quick Answers)", provider: "confirmroute", providerGroup: "ConfirmRoute AI", isFree: true },
  { id: "BALANCED", name: "⚖️ Balanced (Seats & PNR)", provider: "confirmroute", providerGroup: "ConfirmRoute AI", isFree: true },
  { id: "ADVANCED", name: "🧠 Advanced (Reasoning)", provider: "confirmroute", providerGroup: "ConfirmRoute AI", isFree: false },
  { id: "auto", name: "Auto", provider: "confirmroute", providerGroup: "ConfirmRoute AI", isFree: true },
];
