import React from "react";
import {
  BRAND_BASE_NAME,
  BRAND_AI_SUFFIX,
  resolveTrademarkType,
  getBrandSymbol,
} from "@/src/config/brand.config";

export interface BrandNameProps {
  /** If true, renders "Confirm" and "Route" in distinct colors (emerald/cyan accent on Route) */
  highlightRoute?: boolean;
  /** Whether to render the symbol (defaults to true if configured in env) */
  showSymbol?: boolean;
  /** Optional suffix like "AI" */
  suffix?: string | "AI" | false;
  /** Optional badge styling for the suffix */
  suffixAsBadge?: boolean;
  /** Custom wrapper className */
  className?: string;
  /** Custom symbol className (defaults to stylish small superscript) */
  symbolClassName?: string;
}

/**
 * BrandName Component
 *
 * Automatically displays the dynamic trademark symbol (™ or ®) based on
 * environment variables (NEXT_PUBLIC_CONFIRMROUTE_TM / NEXT_PUBLIC_CONFIRMROUTE_R).
 */
export const BrandName: React.FC<BrandNameProps> = ({
  highlightRoute = false,
  showSymbol = true,
  suffix = false,
  suffixAsBadge = false,
  className = "",
  symbolClassName = "text-[0.62em] font-medium ml-0.5 align-super select-none text-slate-400",
}) => {
  const symbolType = resolveTrademarkType();
  const symbol = showSymbol && symbolType !== "NONE" ? getBrandSymbol() : null;

  return (
    <span
      className={`inline-flex items-center tracking-tight font-extrabold ${className}`}
      aria-label={`${BRAND_BASE_NAME}${symbol ? ` (${symbolType})` : ""} ${suffix || ""}`.trim()}
    >
      {highlightRoute ? (
        <span>
          Confirm<span className="text-emerald-400">Route</span>
        </span>
      ) : (
        <span>{BRAND_BASE_NAME}</span>
      )}

      {symbol && (
        <sup className={symbolClassName} aria-hidden="true">
          {symbol}
        </sup>
      )}

      {suffix && (
        <>
          {suffixAsBadge ? (
            <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
              {suffix}
            </span>
          ) : (
            <span className="ml-1 font-bold text-slate-300">{suffix}</span>
          )}
        </>
      )}
    </span>
  );
};

export default BrandName;
