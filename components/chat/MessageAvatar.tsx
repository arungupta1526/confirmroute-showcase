"use client";

import React from "react";
import { Sparkles, User as UserIcon } from "lucide-react";

interface MessageAvatarProps {
  role: "user" | "assistant" | "system" | "data";
  userDisplayName?: string | null;
  userEmail?: string | null;
}

/**
 * Message avatar component rendering the AI badge or personalized user initials.
 */
export const MessageAvatar = React.memo(function MessageAvatar({
  role,
  userDisplayName,
  userEmail,
}: MessageAvatarProps) {
  if (role === "user") {
    // Extract initial from user display name or email
    const initial = (
      userDisplayName?.trim()?.[0] ||
      userEmail?.trim()?.[0] ||
      "U"
    ).toUpperCase();

    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-sky-500/20">
        {initial}
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
      <Sparkles className="w-4 h-4" />
    </div>
  );
});
