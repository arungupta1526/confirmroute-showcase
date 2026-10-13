"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { AuthBrandLogo } from "./AuthTopBar";
import { AuthMode } from "./AuthTypes";

interface AuthForgotPasswordViewProps {
  initialEmail?: string;
  onBack: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onRequestReset: (email: string) => Promise<void>;
  onProceedToOtp?: (email: string) => void;
  isLoading?: boolean;
}

export const AuthForgotPasswordView: React.FC<AuthForgotPasswordViewProps> = ({
  initialEmail = "",
  onBack,
  onSwitchMode,
  onRequestReset,
  onProceedToOtp,
  isLoading = false,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = React.useRef<HTMLInputElement>(null);

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

  React.useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      emailInputRef.current?.focus();
      return;
    }
    setError(null);
    setUserNotFound(false);
    setIsSubmitting(true);

    try {
      // 1. Check if account exists
      const res = await fetch("/api/auth/check-user-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const checkData = await res.json().catch(() => ({ exists: true }));

      if (checkData && checkData.exists === false) {
        setUserNotFound(true);
        setError("No account found with this email. Please create an account first.");
        return;
      }

      // 2. User exists: proceed to reset
      await onRequestReset(trimmed);
      setSuccess("Reset instructions and verification code sent to your email!");
      if (onProceedToOtp) {
        setTimeout(() => onProceedToOtp(trimmed), 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset instructions.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full flex flex-col">
      <AuthBrandLogo />

      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-medium text-slate-400">Account Recovery</span>
      </div>

      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
          Forgot your <span className="text-[#008779]">password?</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Enter your registered email address and we will send you a verification code to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed flex flex-col gap-1.5 animate-in fade-in">
          <span>{error}</span>
          {userNotFound && (
            <button
              type="button"
              onClick={() => onSwitchMode("signup")}
              className="self-start inline-flex items-center gap-1 font-semibold text-[#008779] underline hover:text-[#01786a] cursor-pointer pt-0.5"
            >
              <span>Create an account now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs leading-relaxed flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Registered Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setUserNotFound(false);
                if (error) setError(null);
              }}
              placeholder="Enter your email"
              required
              disabled={busy}
              style={{
                WebkitTextFillColor: "#0f172a",
                WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 focus:border-[#008779] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="group relative w-full flex items-center justify-center py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white transition-all duration-200 shadow-md shadow-[#008779]/20 cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span className="text-sm font-medium text-center">Send Reset Instructions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform absolute right-4" />
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-600">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode("email-signin")}
            className="font-semibold text-[#008779] hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
