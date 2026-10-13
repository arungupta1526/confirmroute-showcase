"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, KeyRound, Loader2 } from "lucide-react";
import { AuthBrandLogo } from "./AuthTopBar";

interface UpdatePasswordFormProps {
  onUpdatePassword: (newPassword: string) => Promise<void>;
  onSuccess: () => void;
  isExpiredToken?: boolean;
  onRequestNewLink: () => void;
  isLoading?: boolean;
}

export const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({
  onUpdatePassword,
  onSuccess,
  isExpiredToken = false,
  onRequestNewLink,
  isLoading = false,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSymbol;

  if (isExpiredToken) {
    return (
      <div className="space-y-4">
        <AuthBrandLogo />
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Link Expired</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Reset Link Expired or Invalid
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your password reset link is invalid or has expired. For your security, reset links are single-use and time-limited.
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestNewLink}
          className="w-full py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-[#008779]/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Request a New Reset Link</span>
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!hasUppercase) {
      setError("Password must contain at least one uppercase letter (A-Z).");
      return;
    }
    if (!hasLowercase) {
      setError("Password must contain at least one lowercase letter (a-z).");
      return;
    }
    if (!hasDigit) {
      setError("Password must contain at least one number (0-9).");
      return;
    }
    if (!hasSymbol) {
      setError("Password must contain at least one special character (@, #, $, %, etc.).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdatePassword(password);
      setSuccess("Password updated successfully! Redirecting...");
      setTimeout(onSuccess, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div className="w-full flex flex-col">
      <AuthBrandLogo />

      <div className="text-center mb-4 sm:mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-50 text-[#008779] mb-2 shadow-sm">
          <KeyRound className="w-5 h-5" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#0f172a] tracking-tight">
          Create <span className="text-[#008779]">New Password</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Enter and confirm your new secure password below.
        </p>
      </div>

      {error && (
        <div className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3.5 p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs leading-relaxed flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              style={{
                WebkitTextFillColor: "#0f172a",
                WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
              }}
              className="w-full rounded-2xl border border-slate-200/90 bg-white pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 focus:border-[#008779] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Real-time Password Requirements Checklist */}
        {password.length > 0 && (
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-600 transition-all select-none">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
                Requirements
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
                { label: "Number & Symbol", met: hasDigit && hasSymbol },
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

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={busy}
              style={{
                WebkitTextFillColor: "#0f172a",
                WebkitBoxShadow: "0 0 0px 1000px #ffffff inset",
              }}
              className={`w-full rounded-2xl border bg-white pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008779]/20 transition-all ${
                confirmPassword && password !== confirmPassword
                  ? "border-rose-300 focus:border-rose-400"
                  : "border-slate-200/90 focus:border-[#008779]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            <span className="text-sm font-medium text-center">Update Password & Continue</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform absolute right-4" />
        </button>
      </form>
    </div>
  );
};
