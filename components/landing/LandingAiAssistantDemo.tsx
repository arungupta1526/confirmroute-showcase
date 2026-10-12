"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, MessageSquare, Bot, User, Radio, Send } from "lucide-react";

export function LandingAiAssistantDemo() {
  const benefits = [
    "Real-time train running status & platform guidance",
    "Smart travel recommendations when direct trains are full",
    "2-Leg break-journey route discovery",
    "Coach layout, berth numbers & bogie position",
    "Railway rules, RAC confirmation & refund policies",
    "Available 24/7 in natural conversational language",
  ];

  const quickPrompts = [
    "Find trains from Mirzapur to Patna",
    "Will my WL 14 confirm on Rajdhani?",
    "Best route from DDU to PNBE",
    "Check platform and coach position for 12396",
  ];

  return (
    <section id="assistant-demo" className="py-16 bg-slate-950/70 border-t border-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Information & Value Points */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Conversational AI</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                AI Railway Assistant
              </span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Ask anything about trains, waitlists, quotas, connecting routes, or platform delays — get instant, verified answers without navigating complex railway forms.
            </p>

            {/* Checkmark List */}
            <div className="space-y-2.5 pt-2">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 group"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Try AI Assistant Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Chat Mockup Window */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 sm:p-5 space-y-4 backdrop-blur-xl">
              {/* Chat App Mockup Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      ConfirmRoute AI
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[10px] text-slate-400">Live Indian Railways Assistant</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Response: 140ms
                </div>
              </div>

              {/* Chat Messages Stream Mockup */}
              <div className="space-y-3 text-xs">
                {/* User Message 1 */}
                <div className="flex items-start justify-end gap-2">
                  <div className="p-3 rounded-2xl rounded-tr-sm bg-emerald-600/20 border border-emerald-500/30 text-white max-w-[85%]">
                    What is the current status of train 12396?
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* AI Assistant Message 1 */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-950 border border-slate-800 text-slate-200 max-w-[88%] space-y-2">
                    <p className="text-[11px] leading-relaxed">
                      <strong>12396 Sampoorna Kranti Express</strong> is running <strong className="text-amber-400">25 minutes late</strong>. Current location: Prayagraj Junction.
                    </p>

                    {/* Nested Status Mini Card */}
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>New Delhi (Dep 18:55)</span>
                        <span className="text-emerald-400">Departed on time</span>
                      </div>
                      <div className="flex justify-between font-semibold text-white">
                        <span>Prayagraj Jn (Arr 22:40)</span>
                        <span className="text-amber-400">+25 min</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Patna Jn (Exp Arr 07:10)</span>
                        <span className="text-amber-400">+30 min delay</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Message 2 */}
                <div className="flex items-start justify-end gap-2">
                  <div className="p-3 rounded-2xl rounded-tr-sm bg-emerald-600/20 border border-emerald-500/30 text-white max-w-[85%]">
                    Show me trains from Mirzapur to Patna tomorrow with available seats.
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* AI Assistant Message 2 */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-950 border border-slate-800 text-slate-200 max-w-[88%]">
                    <p className="text-[11px] leading-relaxed">
                      Found <strong className="text-emerald-400">5 trains</strong> with available seats from Mirzapur to Patna. Best option: <strong>12141 Patliputra Express (3A: 28 Available)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar Mockup with Prompt Suggestions */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.slice(0, 2).map((p) => (
                    <Link
                      key={p}
                      href={`/chat?prompt=${encodeURIComponent(p)}`}
                      className="px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-emerald-400 border border-slate-700/60 transition"
                    >
                      {p}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    disabled
                    placeholder="Ask anything about Indian Railways..."
                    className="flex-1 bg-transparent px-2 text-[11px] text-slate-400 focus:outline-none"
                  />
                  <Link
                    href="/chat"
                    className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                  >
                    <Send className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
