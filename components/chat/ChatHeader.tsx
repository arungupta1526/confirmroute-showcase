"use client";

import React from "react";
import Link from "next/link";
import { PanelLeft, Cloud, Sparkles, LogIn } from "lucide-react";
import { BrandName, BrandLogo } from "@/components/brand";
import { UserProfileData } from "@/src/hooks/useAuth";
import type { User } from "@supabase/supabase-js";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onOpenAccountModal: (tab?: "plan" | "mcp" | "auth", planId?: string) => void;
  onOpenMcpModal?: () => void;
  onNewChat: () => void;
  user: User | null;
  profile: UserProfileData | null;
  modelId?: string;
  onSelectModel?: (id: string) => void;
  keyStatus?: any;
  modelSelectRef?: React.RefObject<HTMLSelectElement | null>;
  enableDevUnlimited?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleSidebar,
  onOpenAccountModal,
  onNewChat,
  user,
  profile,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md z-10 shrink-0">
      {/* Row 1: Brand, Navigation, Architecture & New Chat */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white transition border border-slate-700/60 cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation"
            title="Toggle Chat History (Cmd+H / Ctrl+H)"
            aria-label="Toggle chat history"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <Link href="/" className="shrink-0 flex items-center" title="ConfirmRoute AI App Home">
            <BrandLogo variant="emblem" dimension={34} />
          </Link>

          <div className="min-w-0">
            <div className="flex flex-col">
              <Link
                href="/"
                className="font-bold text-sm sm:text-base text-slate-100 hover:text-sky-400 transition truncate leading-tight flex items-center"
                title="ConfirmRoute AI App Home"
              >
                <BrandName suffix="AI" className="text-sm sm:text-base" />
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                  Indian Railways Train Search & Seat Availability
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Architecture Showcase Modal, User & New Chat */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Sign In / Profile */}
          {user ? (
            <button
              type="button"
              onClick={() => onOpenAccountModal("auth")}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 shadow-sm cursor-pointer touch-manipulation min-h-[34px]"
              title={`Logged in as ${user.email} (${profile?.isDevUnlimited ? "Unlimited" : `${profile?.remainingSearches ?? 50}/${profile?.dailyLimit ?? 50} searches`})`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="hidden sm:inline max-w-[100px] truncate">
                {profile?.user?.displayName || user.email?.split("@")[0]}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer shrink-0 touch-manipulation min-h-[34px]"
              title="Sign In / Register"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* AWS Architecture Modal Button */}
          <button
            type="button"
            onClick={() => onOpenAccountModal("plan")}
            aria-label="View AWS Elastic Beanstalk Architecture"
            className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5 shadow-sm cursor-pointer touch-manipulation min-h-[34px]"
            title="ConfirmRoute AWS Architecture & Microservices"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden xs:inline">Architecture</span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={onNewChat}
            aria-label="Start new chat"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1 cursor-pointer shrink-0 touch-manipulation min-h-[34px]"
            title="New Chat (Cmd+N / Ctrl+N)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
