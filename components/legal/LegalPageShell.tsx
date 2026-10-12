import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Sparkles } from "lucide-react";
import { BrandLogo, BrandName } from "@/components/brand";
import { Footer } from "@/components/common/Footer";
import { POLICY_DATES, PolicyKey } from "@/src/config/policyDates.config";

interface LegalPageShellProps {
  title: string;
  subtitle?: string;
  policyKey?: PolicyKey;
  lastUpdated?: string;
  badge?: React.ReactNode;
  disclaimerAlert?: boolean;
  children: React.ReactNode;
}

export const LegalPageShell: React.FC<LegalPageShellProps> = ({
  title,
  subtitle,
  policyKey,
  lastUpdated,
  badge,
  disclaimerAlert = true,
  children,
}) => {
  const effectiveDate =
    lastUpdated ||
    (policyKey && POLICY_DATES[policyKey]) ||
    POLICY_DATES.defaultEffectiveDate;
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 md:p-12 pb-8 sm:pb-12 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar navigation */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4 sm:pb-6 gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Chat</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 pl-2 border-l border-slate-800 transition hover:opacity-90"
              title="ConfirmRoute AI Home"
            >
              <BrandLogo variant="emblem" dimension={22} />
              <span className="hidden sm:inline">
                <BrandName suffix="AI" className="font-bold text-sm tracking-wide text-white" />
              </span>
            </Link>
          </div>
        </header>

        {/* Heading */}
        <div className="space-y-2">
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-slate-300 leading-relaxed">{subtitle}</p>}
          <p className="text-xs text-slate-400">Last updated: {effectiveDate}</p>
        </div>

        {/* Important Disclaimer Alert */}
        {disclaimerAlert && (
          <aside
            aria-label="Important Railway Disclaimer"
            className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200/90 text-sm space-y-2"
          >
            <div className="flex items-center gap-2 font-semibold text-amber-300 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Important Railway Disclaimer & Non-Affiliation</span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              ConfirmRoute is an independent AI travel intelligence platform and developer tool. ConfirmRoute is{" "}
              <strong>NOT affiliated with, endorsed by, authorized by, or in any way officially connected with Indian Railways, IRCTC, or CRIS</strong>. ConfirmRoute is not a ticketing portal and does not sell, book, or cancel railway tickets.
            </p>
          </aside>
        )}

        {/* Page Main Content */}
        <main className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </div>
  );
};
