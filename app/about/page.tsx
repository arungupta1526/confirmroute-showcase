import React from "react";
import Link from "next/link";
import { Compass, CheckCircle2, Cloud, Cpu, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata = {
  title: "About Us | ConfirmRoute AI",
  description:
    "Learn about ConfirmRoute AI's mission to eliminate Indian Railways travel anxiety with real-time telemetry, 2-leg break-journey discovery, and microservices cloud architecture.",
};

const keyPillars = [
  {
    icon: <Compass className="w-5 h-5 text-orange-400" />,
    title: "Break-Journey Graph Discovery",
    description:
      "When direct trains are fully waitlisted, our 2-leg graph algorithm automatically calculates optimal intermediate connection hubs with comfortable transit layovers.",
  },
  {
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    title: "Post-Charting Vacant Berths",
    description:
      "Detect unallocated berths after reservation chart preparation across station leg intervals directly from railway current booking feeds.",
  },
  {
    icon: <Cloud className="w-5 h-5 text-sky-400" />,
    title: "Microservices Cloud Architecture",
    description:
      "Engineered with a high-performance Next.js 16 frontend containerized on AWS Elastic Beanstalk, decoupled from backend operational telemetry.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
    title: "Zero Prompt Leakage Privacy",
    description:
      "Travel inquiries and prompt texts are never written to permanent billing ledgers, monetized, or shared with advertising data brokers.",
  },
];

export default function AboutPage() {
  return (
    <LegalPageShell
      policyKey="about"
      title="About ConfirmRoute AI"
      subtitle="Engineering intelligent software to remove uncertainty, waitlists, and delay chaos from Indian Railways travel."
      badge={
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>
      }
    >
      {/* Mission Statement */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Our Mission</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Millions of Indian travelers face overwhelming uncertainty every day: endless waitlists, confusing charting times, sudden platform reassignments, and hidden alternative routes.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          <strong>ConfirmRoute AI</strong> was created to solve this friction. By combining live operational telemetry with modern natural-language reasoning, we turn complex railway timetable datasets into clear, actionable travel decisions in seconds.
        </p>
      </section>

      {/* Pillars Grid */}
      <section className="space-y-4 pt-4 border-t border-slate-900">
        <h2 className="text-lg font-bold text-white tracking-tight">Core Technological Innovations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyPillars.map((pillar, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-slate-800 border border-slate-700/60">
                {pillar.icon}
              </div>
              <h3 className="text-sm font-bold text-white">{pillar.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Independent Philosophy */}
      <section className="space-y-3 pt-4 border-t border-slate-900">
        <h2 className="text-lg font-bold text-white tracking-tight">Independent Travel Intelligence</h2>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>We Do Not Sell Tickets:</strong> ConfirmRoute is strictly an independent software analytics platform. We believe staying free of ticket commission conflicts allows us to give you completely honest, unbiased alternative route advice.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>Non-Affiliation:</strong> We are proudly independent and not affiliated with, endorsed by, or sponsored by Indian Railways, IRCTC, or CRIS.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Experience ConfirmRoute Today</h3>
          <p className="text-xs text-slate-400">
            Ask our intelligent assistant for alternate trains, seat predictions, and vacant berth layouts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/chat"
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
          >
            <span>Launch AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </LegalPageShell>
  );
}
