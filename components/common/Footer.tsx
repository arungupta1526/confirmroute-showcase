"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand";
import { ShieldAlert, Cloud, Sparkles, Mail, MapPin, ExternalLink } from "lucide-react";
import { useBusinessProfile } from "@/src/hooks/useBusinessProfile";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();
  const { profile } = useBusinessProfile();

  return (
    <footer className={`w-full bg-slate-950 text-slate-400 py-10 sm:py-14 border-t border-slate-800/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-slate-800/80">
          {/* Brand & Architecture Overview */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block" title="ConfirmRoute AI">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Next-generation Indian Railways intelligence assistant providing real-time delay tracking,
              waitlist confirmation predictions, 2-leg break journey connections, and vacant chart berths.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 font-medium">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                AWS Elastic Beanstalk
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Microservices Proxy Architecture
              </span>
            </div>
          </div>

          {/* Product & Interactive Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Features & AI</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/chat" className="text-emerald-400 hover:text-emerald-300 transition font-semibold flex items-center gap-1.5">
                  <span>Launch AI Assistant</span>
                  <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">Live</span>
                </Link>
              </li>
              <li>
                <Link href="/#search" className="hover:text-emerald-400 transition">
                  Live Train Search
                </Link>
              </li>
              <li>
                <Link href="/#capabilities" className="hover:text-emerald-400 transition">
                  Seat Prediction Analytics
                </Link>
              </li>
              <li>
                <Link href="/#assistant-demo" className="hover:text-emerald-400 transition">
                  Interactive Radar Demo
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-emerald-400 transition">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust, Architecture & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Platform & Legal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Architecture &amp; About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Statutory Disclaimers */}
        <div className="pt-6 space-y-3 text-[11px] text-slate-500">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed text-slate-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              <strong className="text-slate-300">Non-Affiliation Notice:</strong> ConfirmRoute is an independent AI travel intelligence application. ConfirmRoute is <strong>not affiliated with, endorsed by, or sponsored by Indian Railways, IRCTC, or CRIS</strong>. ConfirmRoute does NOT sell, book, or cancel railway tickets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 pt-2 text-xs">
            <p>&copy; {currentYear} {profile?.companyTradeName || "ConfirmRoute"}. All rights reserved.</p>
            <p className="text-[11px] text-slate-400">#DevOpsEvolvesIndia Hackathon Showcase Edition</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
