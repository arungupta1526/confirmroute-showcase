"use client";

import React from "react";
import Link from "next/link";
import { Mail, ChevronRight } from "lucide-react";
import { AuthBrandLogo } from "./AuthTopBar";
import { AuthGoogleButton } from "./AuthGoogleButton";
import { AuthMode } from "./AuthTypes";

interface AuthWelcomeViewProps {
  onSwitchMode: (mode: AuthMode) => void;
  onGoogleSignIn: () => Promise<void>;
  onContinueWithEmail: () => void;
}

export const AuthWelcomeView: React.FC<AuthWelcomeViewProps> = ({
  onSwitchMode,
  onGoogleSignIn,
  onContinueWithEmail,
}) => {
  return (
    <div className="w-full flex flex-col">
      {/* Brand Logo */}
      <AuthBrandLogo />

      {/* Heading & Subtitle */}
      <div className="text-center mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#0f172a] tracking-tight">
          Welcome to <span className="text-[#008779]">ConfirmRoute</span>
        </h1>
        <p className="mt-1 text-xs sm:text-[13px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Your smarter way to plan and confirm your railway journey.
        </p>
      </div>

      {/* Google SSO Button */}
      <AuthGoogleButton onGoogleSignIn={onGoogleSignIn} />

      {/* Divider */}
      <div className="relative my-3 sm:my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/90" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          OR
        </span>
      </div>

      {/* Continue with Email Button */}
      <button
        type="button"
        onClick={onContinueWithEmail}
        className="group relative w-full flex items-center justify-center py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white transition-all duration-200 shadow-md shadow-[#008779]/20 cursor-pointer"
      >
        <div className="flex items-center justify-center gap-2.5">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 shrink-0" />
          <span className="text-sm sm:text-[15px] font-medium tracking-tight text-center">
            Continue with Email
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform absolute right-4" />
      </button>

      {/* Switch to Create Account */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode("signup")}
            className="font-semibold text-[#008779] hover:text-[#006e62] hover:underline transition-colors cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>

      {/* Legal Fine Print */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-3.5 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-[#008779] hover:underline font-medium">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="text-[#008779] hover:underline font-medium">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
