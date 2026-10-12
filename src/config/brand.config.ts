/**
 * ConfirmRoute Brand & Trademark Configuration
 *
 * Centralized brand metadata and dynamic trademark symbol resolution.
 * Controls whether the brand displays ™ (Applied/Pending) or ® (Registered)
 * across the entire application via environment variables without code modifications.
 *
 * Configurable via:
 * - NEXT_PUBLIC_CONFIRMROUTE_TM=true/false (or ConfirmRoute_TM)
 * - NEXT_PUBLIC_CONFIRMROUTE_R=true/false  (or ConfirmRoute_R)
 * - NEXT_PUBLIC_BRAND_TRADEMARK_SYMBOL=TM | R | NONE
 */

export type TrademarkSymbolType = "NONE" | "TM" | "R";

function parseBooleanEnv(val: string | undefined): boolean {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

/**
 * Resolves current trademark symbol type from environment variables.
 * Priority: R (Registered) > TM (Pending/Applied) > NONE.
 */
export function resolveTrademarkType(): TrademarkSymbolType {
  // 1. Direct explicit symbol override
  const directSymbol = (
    process.env.NEXT_PUBLIC_BRAND_TRADEMARK_SYMBOL ||
    process.env.BRAND_TRADEMARK_SYMBOL ||
    process.env.ConfirmRoute_SYMBOL ||
    process.env.CONFIRMROUTE_SYMBOL ||
    ""
  ).trim().toUpperCase();

  if (directSymbol === "R") return "R";
  if (directSymbol === "TM") return "TM";
  if (directSymbol === "NONE" || directSymbol === "FALSE") return "NONE";

  // 2. Boolean flag for Registered Trademark (®)
  const isRegistered =
    parseBooleanEnv(process.env.NEXT_PUBLIC_CONFIRMROUTE_R) ||
    parseBooleanEnv(process.env.ConfirmRoute_R) ||
    parseBooleanEnv(process.env.CONFIRMROUTE_R) ||
    parseBooleanEnv(process.env.NEXT_PUBLIC_TRADEMARK_R) ||
    parseBooleanEnv(process.env.TRADEMARK_R);

  if (isRegistered) return "R";

  // 3. Boolean flag for Pending/Applied Trademark (™)
  const isAppliedTM =
    parseBooleanEnv(process.env.NEXT_PUBLIC_CONFIRMROUTE_TM) ||
    parseBooleanEnv(process.env.ConfirmRoute_TM) ||
    parseBooleanEnv(process.env.CONFIRMROUTE_TM) ||
    parseBooleanEnv(process.env.NEXT_PUBLIC_TRADEMARK_TM) ||
    parseBooleanEnv(process.env.TRADEMARK_TM);

  if (isAppliedTM) return "TM";

  return "NONE";
}

export const BRAND_BASE_NAME = "ConfirmRoute";
export const BRAND_AI_SUFFIX = "AI";

export interface BrandFormatOptions {
  withSymbol?: boolean;
  withAi?: boolean;
  symbolPlacement?: "after-brand" | "after-ai";
}

/**
 * Returns the raw trademark symbol character ('™' | '®' | '').
 */
export function getBrandSymbol(): string {
  const type = resolveTrademarkType();
  if (type === "R") return "®";
  if (type === "TM") return "™";
  return "";
}

/**
 * Returns formatted brand string (useful for document titles, metadata, logs).
 * Examples:
 * - getBrandName() => "ConfirmRoute"
 * - getBrandName({ withSymbol: true }) => "ConfirmRoute™"
 * - getBrandName({ withSymbol: true, withAi: true }) => "ConfirmRoute™ AI"
 */
export function getBrandName(options: BrandFormatOptions = {}): string {
  const { withSymbol = false, withAi = false, symbolPlacement = "after-brand" } = options;
  const symbol = withSymbol ? getBrandSymbol() : "";

  if (!withAi) {
    return `${BRAND_BASE_NAME}${symbol}`;
  }

  if (symbolPlacement === "after-ai") {
    return `${BRAND_BASE_NAME} ${BRAND_AI_SUFFIX}${symbol}`;
  }

  return `${BRAND_BASE_NAME}${symbol} ${BRAND_AI_SUFFIX}`;
}

/**
 * Static brand configuration object evaluated at runtime.
 */
export const BRAND_CONFIG = {
  name: BRAND_BASE_NAME,
  symbolType: resolveTrademarkType(),
  symbol: getBrandSymbol(),
  fullName: `${BRAND_BASE_NAME} ${BRAND_AI_SUFFIX}`,
  displayName: getBrandName({ withSymbol: true }),
  displayNameWithAi: getBrandName({ withSymbol: true, withAi: true }),
  legalTrademarkNotice:
    resolveTrademarkType() === "R"
      ? "ConfirmRoute is a registered trademark."
      : resolveTrademarkType() === "TM"
      ? "ConfirmRoute™ is a trademark of ConfirmRoute. Form TM-A filed."
      : "ConfirmRoute is a trademark of ConfirmRoute.",
} as const;

/**
 * Official ConfirmRoute Brand Color Palette
 * Derived directly from the trademarked composite logo vectors.
 */
export const BRAND_COLORS = {
  // Core Brand Colors
  navy: {
    hex: "#012C4F",
    rgb: "1, 44, 79",
    hsl: "207, 98%, 16%",
    name: "Confirm Midnight Navy",
    usage: "Wordmark 'Confirm', circular monogram contour, railway tracks & sleepers",
  },
  emerald: {
    hex: "#01A077",
    rgb: "1, 160, 119",
    hsl: "165, 99%, 32%",
    name: "Route Emerald Green",
    usage: "Wordmark 'Route', ascending checkmark, destination pin, confirmed tickets (CNF/AVL)",
  },
  // Dark Theme UI & Canvas Tokens
  surface: {
    bgDark: "#020617",      // Slate 950 base
    cardDark: "#0B132B",    // Rich Navy card background
    cardBorder: "#1E293B",  // Slate 800
    textPrimary: "#F8FAFC", // Slate 50
    textMuted: "#94A3B8",   // Slate 400
  },
  // Functional Railway Accents
  accents: {
    tatkalOrange: "#F97316", // Tatkal alerts & quick quota actions
    transitSky: "#38BDF8",   // Links, live telemetry & MCP developer docs
  },
} as const;

