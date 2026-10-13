"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { AuthMode } from "./AuthTypes";

interface AuthHeroShowcaseProps {
  mode: AuthMode;
}

export const AuthHeroShowcase: React.FC<AuthHeroShowcaseProps> = ({ mode }) => {
  const isSignUp = mode === "signup";

  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-[720px] flex items-center justify-center overflow-hidden select-none">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Layer 1: Sign In / Welcome Hero Artwork */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          !isSignUp ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
        }`}
      >
        <Image
          src="/test-auth-signin-hero.webp"
          alt="ConfirmRoute High Speed Train & Smart Railway Intelligence (Sign In)"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-left lg:object-center"
          priority
        />
      </div>

      {/* Layer 2: Sign Up Hero Artwork */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isSignUp ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
        }`}
      >
        <Image
          src="/test-auth-signup-hero.webp"
          alt="ConfirmRoute High Speed Train & Smart Railway Intelligence (Sign Up)"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-left lg:object-center"
          priority
        />
      </div>

      {/* Interactive Micro-Overlay: Highlight pill */}
      <div className="absolute top-6 right-6 z-20 hidden xl:flex items-center gap-2 bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 px-3.5 py-1.5 rounded-full text-xs text-cyan-300 shadow-lg shadow-cyan-950/50">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span className="font-medium tracking-wide">
          {isSignUp ? "2-Leg Multi-Station Intelligence Active" : "Real-Time Train Radar Active"}
        </span>
      </div>

      {/* Left feathered gradient overlay to blend into screen edge */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#011a2f] via-[#011a2f]/70 to-transparent z-20 pointer-events-none hidden lg:block" />

      {/* Soft bottom vignette overlay */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#02182b] to-transparent z-20 pointer-events-none" />
    </div>
  );
};
