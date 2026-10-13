"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ChevronRight, Check, Loader2 } from "lucide-react";
import { AuthBrandLogo } from "./AuthTopBar";
import { AuthGoogleButton } from "./AuthGoogleButton";
import { AuthMode } from "./AuthTypes";
import { TurnstileWidget } from "./TurnstileWidget";
import { validateEmailIntegrity } from "@/src/lib/auth/emailUtils";

interface AuthSignUpViewProps {
  initialEmail?: string;
  onSwitchMode: (mode: AuthMode) => void;
  onGoogleSignIn: () => Promise<void>;
  onSignUp: (email: string, pass: string, name?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AuthSignUpView: React.FC<AuthSignUpViewProps> = ({
  initialEmail = "",
  onSwitchMode,
  onGoogleSignIn,
  onSignUp,
  isLoading = false,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  React.useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong =
    hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Please provide your full name.");
      nameInputRef.current?.focus();
      return;
    }
    if (!email.trim()) {
      setError("Please provide an email address.");
      emailInputRef.current?.focus();
      return;
    }

    // Client-side fraud & disposable email validation
    const emailCheck = validateEmailIntegrity(email.trim());
    if (!emailCheck.allowed) {
      setError(emailCheck.reason || "Temporary or disposable emails are not permitted.");
      emailInputRef.current?.focus();
      return;
    }

    if (!password) {
      setError("Please provide a password.");
      passwordInputRef.current?.focus();
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      passwordInputRef.current?.focus();
      return;
    }
    if (!hasUppercase) {
      setError("Password must contain at least one uppercase letter (A-Z).");
      passwordInputRef.current?.focus();
      return;
    }
    if (!hasLowercase) {
      setError("Password must contain at least one lowercase letter (a-z).");
      passwordInputRef.current?.focus();
      return;
    }
    if (!hasDigit) {
      setError("Password must contain at least one number (0-9).");
      passwordInputRef.current?.focus();
      return;
    }
    if (!hasSymbol) {
      setError("Password must contain at least one special character (@, #, $, %, etc.).");
      passwordInputRef.current?.focus();
      return;
    }

    // Cloudflare Turnstile token validation if site key configured
    if (process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the Cloudflare security verification check.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSignUp(email.trim(), password, displayName.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full flex flex-col">
      {/* Brand Logo */}
      <AuthBrandLogo />

      {/* Heading & Subtitle */}
      <div className="text-center mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#0f172a] tracking-tight">
          Create your{" "}
          <span className="text-[#008779] italic font-semibold font-serif">
            account
          </span>
        </h1>
        <p className="mt-1 text-xs sm:text-[13px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Join ConfirmRoute and get started with a smarter railway journey.
        </p>
      </div>

      {/* Google SSO Button */}
      <AuthGoogleButton onGoogleSignIn={onGoogleSignIn} />

      {/* Divider */}
      <div className="relative my-3.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/90" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          OR
        </span>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* Full Name Field */}
        <div className="relative flex items-center">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={nameInputRef}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Full Name (e.g. Rahul Sharma)"
            required
            disabled={busy}
            style={{
              WebkitTextFillColor: "#0f172a",
              WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
            }}
            className="w-full rounded-2xl border border-slate-200/90 bg-white pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 focus:border-[#008779] transition-all"
          />
        </div>

        {/* Email Field */}
        <div className="relative flex items-center">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={busy}
            style={{
              WebkitTextFillColor: "#0f172a",
              WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
            }}
            className="w-full rounded-2xl border border-slate-200/90 bg-white pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 focus:border-[#008779] transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={passwordInputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
            disabled={busy}
            style={{
              WebkitTextFillColor: "#0f172a",
              WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
            }}
            className="w-full rounded-2xl border border-slate-200/90 bg-white pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 focus:border-[#008779] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Real-time Password Requirements Checklist */}
        {password.length > 0 && (
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-600 transition-all select-none">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
                Password Requirements
              </span>
              <span className={`text-[10px] font-bold ${isPasswordStrong ? "text-emerald-600" : "text-amber-600"}`}>
                {isPasswordStrong ? "Strong Password ✓" : "Needs Requirements"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {[
                { label: "8+ characters", met: hasMinLength },
                { label: "Uppercase (A-Z)", met: hasUppercase },
                { label: "Lowercase (a-z)", met: hasLowercase },
                { label: "Number & Symbol (@#$)", met: hasDigit && hasSymbol },
              ].map(({ label, met }) => (
                <span key={label} className={`inline-flex items-center gap-1.5 transition-colors ${met ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${met ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    ✓
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cloudflare Turnstile bot verification (if enabled in env) */}
        {process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && (
          <TurnstileWidget onSuccess={(token) => setTurnstileToken(token)} theme="light" />
        )}

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={() => setAgreeTerms(!agreeTerms)}
            className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
              agreeTerms
                ? "bg-[#008779] border-[#008779] text-white"
                : "border-slate-300 bg-white hover:border-slate-400"
            }`}
          >
            {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <label
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="text-[11px] sm:text-xs text-slate-600 leading-snug cursor-pointer select-none"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              onClick={(e) => e.stopPropagation()}
              className="text-[#008779] font-medium underline hover:text-[#006e62]"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              onClick={(e) => e.stopPropagation()}
              className="text-[#008779] font-medium underline hover:text-[#006e62]"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Create Account Submit Button */}
        <button
          type="submit"
          disabled={busy}
          className="group relative w-full flex items-center justify-center py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white transition-all duration-200 shadow-md shadow-[#008779]/20 cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span className="text-sm sm:text-[15px] font-medium tracking-tight text-center">
              Create account
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform absolute right-4" />
        </button>
      </form>

      {/* Switch to Log In */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode("welcome")}
            className="font-semibold text-[#008779] hover:text-[#006e62] hover:underline transition-colors cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
