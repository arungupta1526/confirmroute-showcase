"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ShieldCheck, Cpu, Cloud, CheckCircle2, User, LogOut, LogIn } from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  initialPlanId?: string;
  auth?: any;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, auth }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const user = auth?.user;
  const profile = auth?.profile;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-slate-100 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">ConfirmRoute Architecture</h3>
              <p className="text-xs text-slate-400">AWS Elastic Beanstalk Showcase Edition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-sm">
          {/* User Authentication Status Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  user
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {user ? (user.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />) : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate text-xs sm:text-sm">
                    {user ? profile?.user?.displayName || user.email : "Guest Traveler"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/40 shrink-0">
                    {profile?.isDevUnlimited
                      ? "Dev Unlimited (∞)"
                      : `${profile?.remainingSearches ?? (user ? 50 : 15)}/${profile?.dailyLimit ?? (user ? 50 : 15)} Searches`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user
                    ? `${profile?.remainingSearches ?? 50} searches left today (resets at 00:00 IST)`
                    : "15 searches/day. Sign in to unlock 50 searches/day."}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (auth?.signOut) {
                      await auth.signOut();
                    }
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-medium text-rose-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span>ENVIRONMENT</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live on AWS Beanstalk
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This showcase frontend runs inside a standalone Docker container managed by <strong>AWS Elastic Beanstalk</strong> and <strong>Application Load Balancer</strong>.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Microservices Architecture</h4>
            <div className="grid gap-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Public Frontend (This Repo)</span>
                  <p className="text-slate-400 mt-0.5">Pure React 19 UI, Next.js 16 App Router, 25 interactive cards, authentication.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                <Cpu className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Proxy Adapter Gateway</span>
                  <p className="text-slate-400 mt-0.5">Secure token-authenticated bridge routing queries to core railway telemetry services.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">Private Core Microservice</span>
                  <p className="text-slate-400 mt-0.5">Hosts real-time telemetry, caching, and Amazon Bedrock reasoning engine.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            Explore Railway AI
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
