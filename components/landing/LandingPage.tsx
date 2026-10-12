"use client";

import React from "react";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingSearchBar } from "./LandingSearchBar";
import { LandingCapabilities } from "./LandingCapabilities";
import { LandingAiAssistantDemo } from "./LandingAiAssistantDemo";
import { LandingReviews } from "./LandingReviews";
import { LandingFaq } from "./LandingFaq";
import { LandingTrustSecurity } from "./LandingTrustSecurity";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      {/* 1. Sticky Glassmorphic Header */}
      <LandingHeader />

      {/* Main Full-Length Landing Sections */}
      <main className="flex-1">
        {/* 2. Hero Section with Live Telemetry Banner & Metrics */}
        <LandingHero />

        {/* 3. Interactive Railway Query & Search Bar */}
        <LandingSearchBar />

        {/* 4. Core Capabilities & Bento Showcase */}
        <LandingCapabilities />

        {/* 5. Interactive AI Assistant Mobile/Web Demo */}
        <LandingAiAssistantDemo />

        {/* 6. What Our Users & Developers Say (Reviews with Auto-Slide) */}
        <LandingReviews />

        {/* 7. Frequently Asked Questions (FAQ) & 24/7 Support */}
        <LandingFaq />

        {/* 9. Trust, Encryption & Data Security Seals */}
        <LandingTrustSecurity />
      </main>

      {/* 10. Comprehensive Multi-Column Footer with Disclaimers */}
      <LandingFooter />
    </div>
  );
}
