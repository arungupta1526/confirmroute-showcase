import React from "react";
import Image from "next/image";
import { BrandName } from "./BrandName";

export type BrandLogoVariant = "emblem" | "symbol" | "full" | "horizontal-svg";
export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BrandLogoProps {
  /**
   * Variant of the brand logo to render:
   * - "emblem": Official trademark device in branded Navy squircle (app icon style)
   * - "symbol": Transparent standalone emblem without squircle container
   * - "full": Branded emblem icon + dynamic BrandName (with auto TM/R symbol from .env)
   * - "horizontal-svg": Master vector SVG with pre-rendered wordmark
   */
  variant?: BrandLogoVariant;
  /** Size preset */
  size?: BrandLogoSize;
  /** Explicit pixel size for the icon (overrides size preset) */
  dimension?: number;
  /** Highlight "Route" in emerald text */
  highlightRoute?: boolean;
  /** Suffix label (e.g. "AI") */
  suffix?: string | "AI" | false;
  /** Render suffix label as badge */
  suffixAsBadge?: boolean;
  /** Custom container className */
  className?: string;
  /** Custom icon/emblem className */
  iconClassName?: string;
  /** Custom text className */
  textClassName?: string;
  /** Whether the background context is dark (default: true) */
  darkTheme?: boolean;
}

const SIZE_MAP: Record<BrandLogoSize, { px: number; textClass: string; gapClass: string }> = {
  xs: { px: 20, textClass: "text-xs", gapClass: "gap-1.5" },
  sm: { px: 26, textClass: "text-sm", gapClass: "gap-2" },
  md: { px: 32, textClass: "text-base", gapClass: "gap-2.5" },
  lg: { px: 40, textClass: "text-lg", gapClass: "gap-3" },
  xl: { px: 52, textClass: "text-xl", gapClass: "gap-3.5" },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  size = "md",
  dimension,
  highlightRoute = true,
  suffix = false,
  suffixAsBadge = false,
  className = "",
  iconClassName = "",
  textClassName = "",
  darkTheme = true,
}) => {
  const currentSize = SIZE_MAP[size];
  const iconPx = dimension || currentSize.px;

  // Resolve emblem SVG path based on variant and theme
  const getEmblemSrc = () => {
    if (variant === "symbol") {
      return darkTheme
        ? "/brand/ConfirmRoute_Symbol_Inverted_DarkBG.svg"
        : "/brand/ConfirmRoute_Symbol_Color_Transparent.svg";
    }
    return "/brand/ConfirmRoute_AppIcon_Navy_WhiteEmblem.svg";
  };

  // Full pre-rendered horizontal vector logo
  if (variant === "horizontal-svg") {
    const horizontalSrc = darkTheme
      ? "/brand/ConfirmRoute_Horizontal_Inverted_DarkBG.svg"
      : "/brand/ConfirmRoute_Horizontal_Color_Transparent.svg";

    const width = iconPx * 4;
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Image
          src={horizontalSrc}
          alt="ConfirmRoute"
          width={width}
          height={iconPx}
          className={`h-auto w-auto max-h-[${iconPx}px] ${iconClassName}`}
          priority
        />
      </span>
    );
  }

  const emblemImage = (
    <Image
      src={getEmblemSrc()}
      alt="ConfirmRoute Emblem"
      width={iconPx}
      height={iconPx}
      className={`rounded-lg object-contain shadow-sm shrink-0 ${iconClassName}`}
      style={{ width: `${iconPx}px`, height: `${iconPx}px` }}
      priority
    />
  );

  // If emblem or symbol only, return image directly
  if (variant === "emblem" || variant === "symbol") {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {emblemImage}
      </span>
    );
  }

  // Variant "full": Emblem + dynamic BrandName (with TM/R from .env)
  return (
    <div className={`inline-flex items-center ${currentSize.gapClass} ${className}`}>
      {emblemImage}
      <BrandName
        highlightRoute={highlightRoute}
        suffix={suffix}
        suffixAsBadge={suffixAsBadge}
        className={`${currentSize.textClass} ${textClassName}`}
      />
    </div>
  );
};

export default BrandLogo;
