"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, ShieldAlert, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { AuthOtpInput } from "./AuthOtpInput";

interface AuthForgotPasswordModalProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
  onRequestReset: (email: string) => Promise<void>;
  onVerifyResetOtp?: (email: string, otp: string) => Promise<void>;
  onSuccessProceedToReset?: () => void;
  onSwitchToSignUp?: (email?: string) => void;
}

export const AuthForgotPasswordModal: React.FC<AuthForgotPasswordModalProps> = ({
  isOpen,
  initialEmail = "",
  onClose,
  onRequestReset,
  onVerifyResetOtp,
  onSuccessProceedToReset,
  onSwitchToSignUp,
}) => {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "success">("email");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setUserNotFound(false);
    setIsSubmitting(true);

    try {
      // 1. Verify user exists
      const res = await fetch("/api/auth/check-user-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const checkData = await res.json().catch(() => ({ exists: true }));

      if (checkData && checkData.exists === false) {
        setUserNotFound(true);
        setError("No account found with this email address. Please create an account first.");
        return;
      }

      // 2. User exists: send OTP
      await onRequestReset(trimmed);
      setStep("otp");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset instructions.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (onVerifyResetOtp) {
        await onVerifyResetOtp(email.trim(), code);
      }
      setStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired OTP code.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ colorScheme: "light" }}
        className="relative w-full max-w-md bg-white text-slate-900 rounded-[28px] shadow-2xl p-6 sm:p-7 border border-slate-100 cursor-default"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "email" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter your email to receive recovery instructions.
            </p>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
                {userNotFound && onSwitchToSignUp && (
                  <button
                    type="button"
                    onClick={() => onSwitchToSignUp(email)}
                    className="self-start inline-flex items-center gap-1 font-semibold text-[#008779] underline hover:text-[#01786a] cursor-pointer pt-0.5"
                  >
                    <span>Click here to create a new account</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setUserNotFound(false);
                      if (error) setError(null);
                    }}
                    placeholder="name@example.com"
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#008779]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-[#008779] hover:bg-[#007064] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Verification Code</span>
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Enter Security Code</h2>
            <p className="mt-1 text-xs text-slate-500">
              We sent a 6-digit verification code to <strong>{email}</strong>
            </p>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div className="my-4">
              <AuthOtpInput
                value={otp}
                onChange={setOtp}
                disabled={isSubmitting}
                onComplete={handleVerifyOtp}
              />
            </div>

            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isSubmitting || otp.length < 6}
              className="w-full py-3 px-4 rounded-2xl bg-[#008779] hover:bg-[#007064] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Continue</span>
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ← Change email address
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#008779] mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#008779]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Security Code Verified!</h2>
            <p className="mt-1 text-xs text-slate-500">
              Identity verified successfully. You can now set your new password.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSuccessProceedToReset) {
                  onSuccessProceedToReset();
                }
              }}
              className="mt-4 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#018778] to-[#009b8b] hover:from-[#01786a] hover:to-[#00897b] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#008779]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Set New Password Now →</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
