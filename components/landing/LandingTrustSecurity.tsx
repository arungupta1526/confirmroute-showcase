"use client";

import React from "react";
import { Lock, ShieldCheck, CreditCard, EyeOff } from "lucide-react";

export function LandingTrustSecurity() {
  const trustPoints = [
    {
      icon: Lock,
      title: "Encrypted Data Transmission",
      desc: "TLS 1.3 encryption across all client queries and tool calls.",
    },
    {
      icon: EyeOff,
      title: "No IRCTC Login Required",
      desc: "Zero password collection. We never request your IRCTC credentials.",
    },
    {
      icon: CreditCard,
      title: "Secure Payment Processing",
      desc: "Processed via PCI-DSS compliant gateways with instant invoicing.",
    },
    {
      icon: ShieldCheck,
      title: "Privacy First & Zero Prompt Leak",
      desc: "Your travel queries are never stored or logged in permanent ledgers.",
    },
  ];

  return (
    <section className="py-12 bg-slate-950/90 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Your Data, Our Priority
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Secure, Private &amp; Reliable Railway Intelligence
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map((pt) => {
              const Icon = pt.icon;
              return (
                <div key={pt.title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">{pt.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{pt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
