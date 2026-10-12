"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HelpCircle, ChevronDown, ChevronUp, Headphones, Mail, MessageSquare } from "lucide-react";

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is ConfirmRoute affiliated with Indian Railways or IRCTC?",
      a: "No. ConfirmRoute is strictly an independent travel intelligence assistant. We are not affiliated with, endorsed by, or officially connected to Indian Railways, IRCTC, or CRIS. We do not sell or book train tickets.",
    },
    {
      q: "How accurate are the seat confirmation predictions?",
      a: "Our confirmation engine evaluates historical charting data, seasonal quota behavior, and waitlist trends across hundreds of departures to deliver high-probability confirmation forecasts (typically 95%+ directional accuracy).",
    },
    {
      q: "What is the 2-leg break journey feature?",
      a: "When direct trains between two cities are fully booked or have high waitlists, ConfirmRoute automatically analyzes intermediate junction halts to identify 2-leg connecting options where confirmed berths are still available.",
    },
    {
      q: "Can I check live running status of any train?",
      a: "Yes. ConfirmRoute provides real-time live running status, expected platform numbers, current station locations, and delay minutes for all active Indian Railways trains.",
    },
    {
      q: "What is the Developer MCP plan?",
      a: "The Developer MCP tier provides API keys (`cr_live_...`) to connect ConfirmRoute's Indian Railways tools directly into Cursor, Claude Desktop, and AI agent frameworks via the Model Context Protocol.",
    },
    {
      q: "Is my personal data safe and private?",
      a: "Absolutely. ConfirmRoute requires no IRCTC passwords. All requests are transmitted over encrypted TLS, and we strictly enforce zero user prompt logging in our usage ledgers.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section id="faq" className="py-16 bg-slate-950 scroll-mt-20">
      {/* Google FAQPage JSON-LD Structured Data for Rich Search Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Have Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently <span className="text-emerald-400">Asked</span> Questions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Find answers to common questions about ConfirmRoute's predictions, tools, and privacy.
          </p>
        </div>

        {/* 2-Column Grid: FAQ Accordion + 24/7 Support Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQ Accordion */}
          <div className="lg:col-span-8 space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition"
                  >
                    <span>{f.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 24/7 Support Card with Generated 3D Support Specialist */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center space-y-4 shadow-2xl relative overflow-hidden group">
            {/* Ambient backlight */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Generated 3D Support Illustration */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-slate-800/80 shadow-lg bg-slate-950">
              <Image
                src="/images/support-agent.webp"
                alt="ConfirmRoute AI Customer Support Specialist"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 30vw"
              />
              <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[9px] font-bold text-emerald-400 flex items-center justify-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Support Team Online</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Still have questions?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need help with a waitlist prediction, break-journey route, or developer MCP key? We're here 24/7.
              </p>
            </div>

            <div className="pt-1 space-y-2">
              <Link
                href="/contact"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Support</span>
              </Link>

              <Link
                href="/chat"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask AI Assistant Directly</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
