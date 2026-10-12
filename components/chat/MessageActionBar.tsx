"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, CornerUpLeft } from "lucide-react";
import { copyToClipboard } from "@/src/utils/clipboard";

interface MessageActionBarProps {
  messageId: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  onReplyTo: (message: { id: string; role: string; content: string }) => void;
  timestamp?: string;
}

/**
 * Bottom action bar for copy, quote reply, and share options.
 */
export const MessageActionBar = React.memo(function MessageActionBar({
  messageId,
  role,
  content,
  onReplyTo,
  timestamp,
}: MessageActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "ConfirmRoute AI Message",
          text: content,
        });
      } catch {
        // Fallback to clipboard
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
      {timestamp && (
        <span className="text-[10px] text-slate-500 font-sans select-none px-1">
          {timestamp}
        </span>
      )}
      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition cursor-pointer"
        title={copied ? "Copied to clipboard" : "Copy to clipboard"}
        aria-label="Copy message text"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Quote Reply Button */}
      <button
        type="button"
        onClick={() => onReplyTo({ id: messageId, role, content })}
        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition cursor-pointer"
        title="Reply to this message"
        aria-label="Reply to this message"
      >
        <CornerUpLeft className="w-3.5 h-3.5" />
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition cursor-pointer"
        title="Share"
        aria-label="Share message"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});
