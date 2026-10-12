"use client";

import React from "react";
import { Footer } from "@/components/common/Footer";

/**
 * Complete footer rendered in landing mode, fully compliant with
 * RBI digital payment aggregator requirements.
 */
export function LandingFooter() {
  return (
    <div className="w-full bg-slate-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}
