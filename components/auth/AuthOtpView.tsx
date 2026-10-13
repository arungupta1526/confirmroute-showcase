"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, KeyRound, Loader2, CheckCircle2, RotateCw } from "lucide-react";
import { AuthBrandLogo } from "./AuthTopBar";
import { AuthOtpInput } from "./AuthOtpInput";
import { AuthMode } from "./AuthTypes";

interface AuthOtpViewProps {
  email: string;
  onBack: () => void;
  onSwitchMode: (mode: AuthMode) => void;
  onVerifyOtp: (otp: string) => Promise<void>;
  onResendOtp?: () => Promise<void>;
  purpose?: "signin" | "recovery" | "signup";
  isLoading?: boolean;
}

export const AuthOtpView: React.FC<AuthOtpViewProps> = ({
  email,
  onBack,
  onSwitchMode,
  onVerifyOtp,
  onResendOtp,
  purpose = "signin",
  isLoading = false,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      await onVerifyOtp(code);
      setSuccess("Code verified successfully! Signing you in...");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired OTP code.";
      setError(msg);
      setOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setError(null);
    setOtp("");
    setIsResending(true);
    try {
      if (onResendOtp) {
        await onResendOtp();
      }
      setSuccess("A new 6-digit code has been sent to your email!");
      setCountdown(45);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend code.";
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  const busy = isLoading || isVerifying || isResending;

  return (
    <div className="w-full flex flex-col">
      <AuthBrandLogo />

      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-xs font-medium text-slate-400">
          {purpose === "recovery" ? "Account Recovery" : "Security Verification"}
        </span>
      </div>

      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-50 text-[#008779] mb-2 shadow-sm">
          <KeyRound className="w-5 h-5" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
          Enter Verification Code
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          We sent a 6-digit code to <strong className="text-slate-800 break-all">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs leading-relaxed flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="my-2">
        <AuthOtpInput
          value={otp}
          onChange={setOtp}
          disabled={busy}
          onComplete={handleVerify}
        />
      </div>

      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={busy || otp.length < 6}
        className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white text-sm font-medium transition-all shadow-md shadow-[#008779]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <span>Verify & Continue</span>
        )}
      </button>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Didn&apos;t get the code?</span>
        {countdown > 0 ? (
          <span className="font-mono text-slate-400">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex items-center gap-1 font-semibold text-[#008779] hover:underline cursor-pointer disabled:opacity-50"
          >
            {isResending ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Resend Code</span>
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => onSwitchMode("welcome")}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Use different email
        </button>
      </div>
    </div>
  );
};
