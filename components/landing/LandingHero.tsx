"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, GitBranch, Radio, Ticket } from "lucide-react";

export function LandingHero() {
  const quickPrompts = [
    {
      icon: Search,
      label: "Check 12301",
      sublabel: "Seat Availability",
      prompt: "Check seat availability for 12301 Rajdhani Express",
    },
    {
      icon: GitBranch,
      label: "Find 2-Leg",
      sublabel: "Delhi to Patna",
      prompt: "Find 2-leg connecting trains from New Delhi to Patna Junction",
    },
    {
      icon: Radio,
      label: "Live Running",
      sublabel: "Status 12951",
      prompt: "Live running status for 12951 Mumbai Tejas Rajdhani",
    },
    {
      icon: Ticket,
      label: "PNR Status",
      sublabel: "Predict & Track",
      prompt: "Check PNR status and confirmation probability for 2362606355",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#050812] min-h-[calc(100vh-4rem)] md:min-h-[620px] md:h-[calc(100vh-4rem)] md:max-h-[820px] lg:max-h-[880px] xl:max-h-[960px] flex flex-col justify-between border-b border-slate-900/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-10 w-[550px] h-[380px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Mobile Full-Bleed Train Image Background with Lightened Dark Layer (< md) */}
      <div className="md:hidden absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/vande-bharat-mobile.webp"
          alt="ConfirmRoute AI — Indian Railways Vande Bharat"
          fill
          priority
          loading="eager"
          className="object-cover object-[center_35%]"
          sizes="(max-width: 767px) 100vw, 1px"
        />
        {/* Lightened dark overlay layers so train image is softly and clearly visible */}
        <div className="absolute inset-0 bg-[#050812]/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050812]/75 via-[#050812]/20 to-[#050812]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-transparent to-[#050812]/20" />
      </div>

      {/* Full-Bleed Right Side Train Image (Tablets & Laptops >= md) */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[65%] md:w-[68%] lg:w-[70%] xl:w-[66%] h-full z-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="/images/vande-bharat-hero.webp"
            alt="ConfirmRoute AI — Indian Railways Vande Bharat Sunset"
            fill
            priority
            loading="eager"
            className="object-cover object-right"
            sizes="(max-width: 1024px) 68vw, 75vw"
          />
          {/* Subtle gradient fade on the left edge into dark background for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050812] via-[#050812]/60 via-20% md:via-22% to-transparent z-10" />
          {/* Gentle bottom line fade that doesn't cover the platform tagline */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#050812]/40 to-transparent z-10" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20 pt-2 sm:pt-3 md:pt-3 lg:pt-2 pb-14 sm:pb-16 md:pb-10 lg:pb-12 xl:pb-14 flex-1 flex flex-col justify-between">
        {/* Standalone Full-Width Top Eyebrow Badge (Centered across whole screen) */}
        <div className="w-full flex justify-center text-center pt-1.5 sm:pt-2.5 md:pt-1 pb-1.5 sm:pb-2.5 md:pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[10px] sm:text-[11px] font-semibold text-cyan-300 shadow-md backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Powered • Built for Indian Railways • Railway Information & Journey Intelligence</span>
          </div>
        </div>

        {/* Content Body: Left Column on Desktop/Tablet, Full Width on Mobile */}
        <div className="flex-1 flex flex-col justify-between w-full md:max-w-[53%] lg:max-w-[49%] xl:max-w-[48%] items-center md:items-start text-center md:text-left">
          {/* Top Text Group: Headline + Subtitle */}
          <div className="space-y-2 sm:space-y-2.5 md:space-y-2 lg:space-y-3.5 w-full flex flex-col items-center md:items-start pt-1 sm:pt-2">
            {/* Main Headline: Balanced text sizing and smooth wrapping */}
            <h1 className="text-[26px] sm:text-[30px] md:text-[35px] lg:text-[44px] xl:text-[52px] font-black text-white tracking-tight leading-[1.16] md:leading-[1.12] drop-shadow-md">
              Travel Smarter Across <br className="hidden lg:inline" />
              <span className="text-cyan-400">Indian Railways</span> With <br className="hidden lg:inline" />
              <span className="text-cyan-400">Live</span>{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-md lg:max-w-lg text-slate-200/90 text-xs sm:text-sm md:text-[13px] lg:text-sm leading-relaxed font-normal mx-auto md:mx-0 drop-shadow-sm">
              Get real-time train status, seat availability predictions, 2-leg journey options, timetables, fares, coach info and AI-powered travel assistance — all in one place.
            </p>
          </div>

          {/* Action Group: Buttons + Quick Cards (Positioned at bottom to reveal train engine in center) */}
          <div className="w-full pt-3 sm:pt-5 md:pt-0 pb-3 sm:pb-4 md:pb-1 space-y-3 md:space-y-2.5">
            {/* Dual CTA Buttons (Side-by-side on mobile & desktop) */}
            <div className="grid grid-cols-2 sm:flex items-center justify-center md:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/chat"
                className="w-full sm:w-auto justify-center px-3 sm:px-6 py-3 sm:py-3.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/40 group shrink-0"
              >
                <span>Start Free Chat</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#capabilities"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("capabilities");
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 70;
                    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: "smooth" });
                  }
                }}
                className="w-full sm:w-auto justify-center px-3 sm:px-5 py-3 sm:py-3.5 md:px-3.5 md:py-3 lg:px-5 lg:py-3.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-[11px] sm:text-sm transition-all backdrop-blur-md flex items-center shrink-0 text-center"
              >
                Explore Features
              </a>
            </div>

            {/* 4 Quick Action Cards Row */}
            <div className="pt-1 sm:pt-1.5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2 sm:gap-2.5 w-full md:max-w-lg">
              {quickPrompts.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={`/chat?prompt=${encodeURIComponent(item.prompt)}`}
                    className="p-2.5 sm:p-3 rounded-xl bg-slate-950/85 hover:bg-slate-900/95 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-md transition group flex items-center gap-2 sm:gap-2.5 text-left shadow-lg"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="space-y-0.5 leading-tight min-w-0 flex-1">
                      <div className="text-[11px] sm:text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {item.label}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-300/85 truncate">{item.sublabel}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Non-Ticketing Compliance Statement */}
            <p className="text-[10px] text-slate-400/80 leading-relaxed pt-1 max-w-sm md:max-w-md mx-auto md:mx-0 text-center md:text-left">
              <span className="text-slate-500">ℹ</span>{" "}
              ConfirmRoute sells digital software subscriptions and AI/data services only. Railway tickets are not sold, booked, issued, or processed by ConfirmRoute.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
