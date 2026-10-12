"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { TOTAL_MCP_TOOLS_COUNT } from "@/components/docs/tabs/api-reference/toolsData";

export function LandingPricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Traveler Basic",
      monthlyPrice: 149,
      annualPrice: 119,
      period: "/month",
      desc: "Essential AI tools for everyday and frequent railway commuters.",
      badge: null,
      highlight: false,
      ctaText: "Get Started Free",
      ctaHref: "/chat",
      features: [
        "500 AI Railway searches / month",
        "Live train running status & delay tracker",
        "PNR confirmation probability engine",
        "60-day visual seat availability calendar",
        "2-leg connecting train discovery",
        "Coach layout & berth finder",
      ],
    },
    {
      name: "Traveler Pro",
      monthlyPrice: 249,
      annualPrice: 199,
      period: "/month",
      desc: "Maximum intelligence & priority access for power commuters.",
      badge: "Most Popular",
      highlight: true,
      ctaText: "Start Pro Plan",
      ctaHref: "/chat",
      features: [
        "1,000 AI Railway searches / month",
        "Deep reasoning multi-hop route planner",
        "Post-charting vacant berth scanner",
        "Priority AI Gateway latency (<500ms)",
        "Station stoppage & alternate terminals radar",
        "Priority 24/7 travel assistance",
      ],
    },
    {
      name: "Developer MCP",
      monthlyPrice: 299,
      annualPrice: 239,
      period: "/month",
      desc: "Integrate Indian Railways tools into Cursor, Claude & custom agents.",
      badge: "For Engineers",
      highlight: false,
      ctaText: "Get Developer Access",
      ctaHref: "/chat",
      features: [
        "2,000 remote MCP tool credits / month",
        "60 requests/minute burst rate limit",
        "Dedicated cr_live_... API keys",
        `All ${TOTAL_MCP_TOOLS_COUNT} Railway MCP tool definitions`,
        "Zero prompt storage / 100% privacy ledger",
        "Interactive MCP docs & code snippets",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-slate-950/80 border-t border-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Choose Your Plan</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple &amp; <span className="text-emerald-400">Transparent</span> Pricing
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Choose the plan that fits your travel and development needs. Cancel anytime.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                billingCycle === "monthly"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            const price = billingCycle === "annual" ? p.annualPrice : p.monthlyPrice;
            return (
              <div
                key={p.name}
                className={`p-6 rounded-2xl flex flex-col justify-between transition-all duration-200 border ${
                  p.highlight
                    ? "bg-slate-900/90 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    {p.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">₹{price}</span>
                    <span className="text-xs text-slate-400">{p.period}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  <Link
                    href={p.ctaHref}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      p.highlight
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Non-Ticketing Compliance Statement */}
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 max-w-2xl mx-auto text-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Your payment to ConfirmRoute is solely for digital software, AI and developer/API services. It is not a railway ticket payment. ConfirmRoute does not sell, issue, or book railway tickets.
          </span>
        </div>
      </div>
    </section>
  );
}
