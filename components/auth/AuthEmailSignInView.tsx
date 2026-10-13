"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, ChevronRight, Loader2 } from "lucide-react";
import { AuthBrandLogo } from "./AuthTopBar";
import { AuthGoogleButton } from "./AuthGoogleButton";
import { AuthMode } from "./AuthTypes";

interface AuthEmailSignInViewProps {
  initialEmail?: string;
  onBack?: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onGoogleSignIn?: () => Promise<void>;
  onSignIn: (email: string, pass: string) => Promise<void>;
  onForgotPassword?: (email?: string) => void;
  onContinueWithOtp?: (email: string) => Promise<void> | void;
  onEmailChange?: (email: string) => void;
  isLoading?: boolean;
}

export const AuthEmailSignInView: React.FC<AuthEmailSignInViewProps> = ({
  initialEmail = "",
  onBack,
  onSwitchMode,
  onGoogleSignIn,
  onSignIn,
  onForgotPassword,
  onContinueWithOtp,
  onEmailChange,
  isLoading = false,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setUserNotFound(false);
    if (error) setError(null);
    if (onEmailChange) onEmailChange(val);
  };

  const handleOtpClick = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setUserNotFound(false);
      setError("Please enter your email address to sign in with OTP.");
      emailInputRef.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setUserNotFound(false);
      setError("Please enter a valid email address (e.g. name@example.com).");
      emailInputRef.current?.focus();
      return;
    }

    setError(null);
    setUserNotFound(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/check-user-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({ exists: true }));

      if (data && data.exists === false) {
        setUserNotFound(true);
        setError("No account found with this email. Please create an account first.");
        return;
      }

      if (onContinueWithOtp) {
        await onContinueWithOtp(trimmed);
      } else {
        onSwitchMode("otp-verify");
      }
    } catch {
      // Network fallback
      if (onContinueWithOtp) {
        await onContinueWithOtp(trimmed);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      emailInputRef.current?.focus();
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      passwordInputRef.current?.focus();
      return;
    }
    setError(null);
    setUserNotFound(false);
    setIsSubmitting(true);
    try {
      await onSignIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full flex flex-col">
      <AuthBrandLogo />

      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#0f172a] tracking-tight">
          Welcome <span className="text-[#008779]">Back</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email and password to continue.
        </p>
      </div>

      {/* Google SSO Button */}
      {onGoogleSignIn && (
        <div className="mb-3.5 sm:mb-4">
          <AuthGoogleButton onGoogleSignIn={onGoogleSignIn} isLoading={busy} />
          <div className="relative my-3.5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/90" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              OR
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed flex flex-col gap-1.5 animate-in fade-in">
          <span>{error}</span>
          {userNotFound && (
            <button
              type="button"
              onClick={() => onSwitchMode("signup")}
              className="self-start inline-flex items-center gap-1 font-semibold text-[#008779] underline hover:text-[#01786a] cursor-pointer pt-0.5"
            >
              <span>Click here to create an account</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={busy}
              style={{
                WebkitTextFillColor: "#0f172a",
                WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
              }}
              className={`w-full rounded-2xl border bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 transition-all ${
                userNotFound ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-[#008779]"
              }`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (onForgotPassword) {
                  onForgotPassword(email.trim());
                } else {
                  onSwitchMode("forgot-password");
                }
              }}
              className="text-[11px] text-[#008779] hover:underline font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={busy}
              style={{
                WebkitTextFillColor: "#0f172a",
                WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 focus:border-[#008779] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="group relative w-full flex items-center justify-center py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white transition-all duration-200 shadow-md shadow-[#008779]/20 cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span className="text-sm font-medium text-center">Sign in to ConfirmRoute</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform absolute right-4" />
        </button>

        {/* OTP Alternative Option */}
        <div className="pt-1 text-center">
          <button
            type="button"
            disabled={busy}
            onClick={handleOtpClick}
            className="text-[11px] sm:text-xs text-slate-500 hover:text-[#008779] transition-colors cursor-pointer disabled:opacity-60"
          >
            Prefer passwordless? <span className="font-semibold text-[#008779] underline">Sign in with OTP</span>
          </button>
        </div>
      </form>

      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs text-slate-600">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode("signup")}
            className="font-semibold text-[#008779] hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};
