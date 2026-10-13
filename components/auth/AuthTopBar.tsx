"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo, BrandName } from "@/components/brand";

interface AuthTopBarProps {
  redirectUrl?: string;
}

export const AuthTopBar: React.FC<AuthTopBarProps> = ({ redirectUrl = "/" }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 z-40">
      <header className="w-full flex items-center justify-between text-xs sm:text-sm">
        {/* Left Side: Back button pill */}
        <Link
          href={redirectUrl}
          className="inline-flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full bg-slate-950/75 hover:bg-slate-950/90 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white transition shadow-lg shadow-black/30 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
          <span className="font-medium hidden sm:inline">Back to Home</span>
          <span className="font-medium sm:hidden">Back</span>
        </Link>

        {/* Center: Open view displaying New Delhi railway constellation */}
        <div aria-hidden="true" className="flex-1 pointer-events-none" />

        {/* Right Side: Brand emblem & wordmark */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 py-1.5 sm:py-2 px-3 sm:px-4 rounded-full bg-slate-950/75 hover:bg-slate-950/90 backdrop-blur-md border border-white/15 transition shadow-lg shadow-black/30 group cursor-pointer"
        >
          <BrandLogo variant="emblem" dimension={20} />
          <BrandName suffix="AI" className="font-bold text-xs sm:text-sm tracking-wide text-white" />
        </Link>
      </header>
    </div>
  );
};

export const AuthBrandLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4 select-none">
      {/* Official circular emblem */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 -mr-1">
        <Image
          src="/brand/ConfirmRoute_Symbol_Color_Transparent.svg"
          alt="ConfirmRoute Emblem"
          width={36}
          height={36}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Brand wordmark typography */}
      <div className="flex items-baseline tracking-tight">
        <span className="text-xl sm:text-2xl font-bold text-[#012C4F]">Confirm</span>
        <span className="text-xl sm:text-2xl font-bold text-[#01A077]">Route</span>
      </div>
    </div>
  );
};
