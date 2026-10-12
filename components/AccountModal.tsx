"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Server, X, ShieldCheck, Cpu, Cloud, CheckCircle2 } from "lucide-react";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  initialPlanId?: string;
  auth?: any;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-slate-100 backdrop-blur-xl">
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
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-sm">
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
                  <p className="text-slate-400 mt-0.5">Pure React 19 UI, Next.js 16 App Router, 25 interactive cards.</p>
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
            className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Explore Railway AI
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
