"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { BrandLogo, BrandName } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Minimal Navigation Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" title="ConfirmRoute AI">
            <BrandLogo
              variant="full"
              size="md"
              suffix="AI"
              suffixAsBadge
              iconClassName="group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Route Unavailable</span>
          </div>
        </div>
      </header>

      {/* Center 404 Hero Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 relative z-10">
        <div className="max-w-lg w-full text-center space-y-6">
          {/* Signal Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs shadow-inner">
            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "10s" }} />
            <span className="font-mono text-emerald-400 font-semibold">SIGNAL LOST · 404</span>
          </div>

          {/* Large Header */}
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white">
              Station <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Not Found</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed pt-2">
              The train corridor, page, or terminal you are looking for has departed, been rescheduled, or does not exist on this route.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Link>

            <Link
              href="/#capabilities"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Explore Capabilities
            </Link>
          </div>

          {/* Quick Assistance Box */}
          <div className="pt-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Looking for Indian Railways seat availability, live train delay tracking, or 2-leg break journeys? Use the primary co-pilot on the home terminal.
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>© {new Date().getFullYear()}</span>
          <BrandName suffix="AI" className="text-slate-400 text-xs font-semibold" />
          <span>· Independent Travel Intelligence Platform</span>
        </p>
      </footer>
    </div>
  );
}
