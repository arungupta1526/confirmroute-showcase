"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { AuthTopBar } from "./AuthTopBar";
import { AuthBackground } from "./AuthBackground";
import { AuthCard } from "./AuthCard";
import { AuthForgotPasswordModal } from "./AuthForgotPasswordModal";
import { AuthMode } from "./AuthTypes";
import { Footer } from "@/components/common/Footer";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const MAIN_BG_SRC = "/images/test-auth-shifted-map.webp?v=20260929";

const resolveDestination = (target?: string | null): string => {
  if (
    target &&
    target !== "/" &&
    target !== "/login" &&
    target !== "/signup" &&
    target !== "/auth"
  ) {
    return target;
  }
  return "/chat";
};

export const AuthContainer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode");
  const redirectParam = searchParams.get("redirect") || "/chat";
  const urlError = searchParams.get("error") || searchParams.get("error_code");
  const isTokenExpired = Boolean(
    urlError === "otp_expired" ||
      urlError === "access_denied" ||
      searchParams.get("error_description")?.toLowerCase().includes("expired")
  );

  const initialMode: AuthMode =
    rawMode === "update-password"
      ? "update-password"
      : rawMode === "signup"
      ? "signup"
      : rawMode === "otp"
      ? "otp-verify"
      : rawMode === "reset"
      ? "forgot-password"
      : rawMode === "email-signin"
      ? "email-signin"
      : "welcome";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [modalInitialEmail, setModalInitialEmail] = useState("");

  const {
    user,
    signInWithOAuth,
    signInWithPassword,
    signUp,
    signInWithOtp,
    verifyOtp,
    resetPasswordForEmail,
    updatePassword,
    isLoading: authLoading,
  } = useAuth();

  // If user is already logged in, automatically redirect to requested destination (unless updating password)
  useEffect(() => {
    if (!authLoading && user && mode !== "update-password") {
      router.replace(resolveDestination(redirectParam));
    }
  }, [user, authLoading, router, mode, redirectParam]);

  // Auto-dismiss toast notification after 4.5s
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleGoogleSignIn = async () => {
    try {
      setFeedback(null);
      const destination =
        typeof window !== "undefined"
          ? `${window.location.origin}${resolveDestination(redirectParam)}`
          : undefined;
      await signInWithOAuth("google", destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google Sign-in could not be completed.";
      setFeedback({ type: "error", message: msg });
    }
  };

  const handleSignInWithPassword = async (email: string, pass: string) => {
    try {
      setFeedback(null);
      await signInWithPassword(email, pass);
      setFeedback({
        type: "success",
        message: `Welcome back! Signed in successfully as ${email}.`,
      });
      setTimeout(() => router.push(resolveDestination(redirectParam)), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      setFeedback({ type: "error", message: msg });
      throw err;
    }
  };

  const handleSignUpWithPassword = async (email: string, pass: string, name?: string) => {
    try {
      setFeedback(null);
      await signUp(email, pass, name);
      setFeedback({
        type: "success",
        message: `Verification link sent to ${email}! Please check your inbox to confirm your account.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please check your credentials.";
      setFeedback({ type: "error", message: msg });
      throw err;
    }
  };

  const handleSignInWithOtp = async (email: string) => {
    try {
      setFeedback(null);
      await signInWithOtp(email);
      setFeedback({
        type: "success",
        message: `6-digit security code sent to ${email}!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send verification code.";
      setFeedback({ type: "error", message: msg });
      throw err;
    }
  };

  const handleVerifyOtp = async (email: string, token: string) => {
    try {
      setFeedback(null);
      await verifyOtp(email, token);
      setFeedback({
        type: "success",
        message: "Code verified successfully! Welcome to ConfirmRoute.",
      });
      setTimeout(() => router.push(resolveDestination(redirectParam)), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired code.";
      setFeedback({ type: "error", message: msg });
      throw err;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      setFeedback(null);
      await resetPasswordForEmail(email);
      setFeedback({
        type: "success",
        message: `Password reset instructions sent to ${email}!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset instructions.";
      setFeedback({ type: "error", message: msg });
      throw err;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#01182b] text-slate-100 selection:bg-[#01A077]/30 selection:text-emerald-200">
      {/* Mobile-only fixed background */}
      <AuthBackground bgImage={MAIN_BG_SRC} />

      {/* Notification Toast */}
      {feedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xl backdrop-blur-md border ${
              feedback.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <p className="text-xs sm:text-sm font-medium leading-relaxed truncate-3-lines">{feedback.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <div className="relative w-full min-h-[100dvh] lg:h-[100dvh] lg:min-h-[640px] flex flex-col justify-between overflow-y-auto lg:overflow-hidden">
        {/* Laptop / Desktop Background Image */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none">
          <Image
            src={MAIN_BG_SRC}
            alt="ConfirmRoute Indian Railways Smart Intelligence Background"
            fill
            sizes="100vw"
            className="object-cover object-[center_88%] select-none transition-opacity duration-300"
            priority
            unoptimized
          />
        </div>

        {/* Top Navigation Bar */}
        <AuthTopBar redirectUrl={redirectParam} />

        {/* Main Content Area */}
        <main className="relative z-10 w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center lg:justify-between py-2 sm:py-3 lg:py-0 pb-6 lg:pb-3">
          {/* Shifted Card Box: Elevated slightly higher via lg:-translate-y-6 */}
          <section
            aria-label="ConfirmRoute Authentication Form"
            className="w-full max-w-[390px] sm:max-w-[425px] flex items-center justify-center lg:ml-8 xl:ml-16 py-2 lg:-translate-y-6 transition-transform"
          >
            <AuthCard
              mode={mode}
              onModeChange={setMode}
              onGoogleSignIn={handleGoogleSignIn}
              onSignInWithPassword={handleSignInWithPassword}
              onSignUpWithPassword={handleSignUpWithPassword}
              onSignInWithOtp={handleSignInWithOtp}
              onVerifyOtp={handleVerifyOtp}
              onResetPassword={handleResetPassword}
              onUpdatePassword={async (newPass) => {
                await updatePassword(newPass);
                setFeedback({
                  type: "success",
                  message: "Password updated successfully! Redirecting to chat...",
                });
                setTimeout(() => router.push(resolveDestination(redirectParam)), 1200);
              }}
              onOpenForgotModal={(email) => {
                if (email) setModalInitialEmail(email);
                setIsForgotModalOpen(true);
              }}
              isTokenExpired={isTokenExpired}
              onRequestNewResetLink={() => setMode("forgot-password")}
              isLoading={authLoading}
            />
          </section>

          {/* Right Spacer for Desktop */}
          <div aria-hidden="true" className="hidden lg:block flex-1 h-full pointer-events-none" />

          {/* Mobile Highlights */}
          <div className="w-full max-w-[425px] lg:hidden flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-slate-300">
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
              ⚡ PNR Assistance
            </span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
              🚅 2-Leg Connectivity
            </span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
              📊 Availability Intelligence
            </span>
          </div>
        </main>

        {/* Forgot Password Popup Modal */}
        <AuthForgotPasswordModal
          isOpen={isForgotModalOpen}
          initialEmail={modalInitialEmail}
          onClose={() => setIsForgotModalOpen(false)}
          onRequestReset={handleResetPassword}
          onVerifyResetOtp={async (email, token) => {
            await verifyOtp(email, token, "recovery");
          }}
          onSuccessProceedToReset={() => {
            setIsForgotModalOpen(false);
            setMode("update-password");
          }}
          onSwitchToSignUp={(email) => {
            setIsForgotModalOpen(false);
            if (email) setModalInitialEmail(email);
            setMode("signup");
          }}
        />
      </div>

      {/* Global Footer on Scroll */}
      <div className="relative z-10 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Footer className="border-t-0" />
        </div>
      </div>
    </div>
  );
};
