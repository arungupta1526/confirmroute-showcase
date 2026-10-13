"use client";

import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "invisible" | "normal" | "compact" | "flexible";
}

/**
 * Reusable Cloudflare Turnstile Invisible / Managed Bot Protection Component
 */
export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
  onError,
  onExpire,
  theme = "light",
  size = "invisible",
}) => {
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  const isInvisible = size === "invisible";

  return (
    <div
      className={
        isInvisible
          ? "w-0 h-0 overflow-hidden absolute pointer-events-none opacity-0"
          : "flex justify-center my-2.5 min-h-[65px] items-center"
      }
    >
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme,
          size,
        }}
      />
    </div>
  );
};
