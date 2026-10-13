"use client";

import React, { useState } from "react";
import { AuthMode } from "./AuthTypes";
import { AuthWelcomeView } from "./AuthWelcomeView";
import { AuthEmailSignInView } from "./AuthEmailSignInView";
import { AuthSignUpView } from "./AuthSignUpView";
import { AuthForgotPasswordView } from "./AuthForgotPasswordView";
import { AuthOtpView } from "./AuthOtpView";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

interface AuthCardProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onGoogleSignIn: () => Promise<void>;
  onSignInWithPassword: (email: string, pass: string) => Promise<void>;
  onSignUpWithPassword: (email: string, pass: string, name?: string) => Promise<void>;
  onSignInWithOtp?: (email: string) => Promise<void>;
  onVerifyOtp?: (email: string, otp: string) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
  onUpdatePassword?: (password: string) => Promise<void>;
  onOpenForgotModal?: (email?: string) => void;
  onUpdatePasswordSuccess?: () => void;
  isTokenExpired?: boolean;
  onRequestNewResetLink?: () => void;
  isLoading?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  mode,
  onModeChange,
  onGoogleSignIn,
  onSignInWithPassword,
  onSignUpWithPassword,
  onSignInWithOtp,
  onVerifyOtp,
  onResetPassword,
  onUpdatePassword,
  onOpenForgotModal,
  onUpdatePasswordSuccess,
  isTokenExpired = false,
  onRequestNewResetLink,
  isLoading = false,
}) => {
  const [activeEmail, setActiveEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"signin" | "recovery" | "signup">("signin");

  const handleStartOtpSignIn = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setActiveEmail(trimmed);
    setOtpPurpose("signin");
    if (onSignInWithOtp) {
      await onSignInWithOtp(trimmed);
    }
    onModeChange("otp-verify");
  };

  const handleProceedToOtpRecovery = (email: string) => {
    const trimmed = email.trim();
    if (trimmed) setActiveEmail(trimmed);
    setOtpPurpose("recovery");
    onModeChange("otp-verify");
  };

  const handleVerifyOtpCode = async (otpCode: string) => {
    if (onVerifyOtp) {
      await onVerifyOtp(activeEmail, otpCode);
    }
  };

  const handleResendOtp = async () => {
    if (onSignInWithOtp && activeEmail) {
      await onSignInWithOtp(activeEmail);
    }
  };

  const handleRequestReset = async (email: string) => {
    const trimmed = email.trim();
    if (trimmed) setActiveEmail(trimmed);
    if (onResetPassword && trimmed) {
      await onResetPassword(trimmed);
    }
  };

  return (
    <div
      style={{ colorScheme: "light" }}
      className="w-full max-w-[390px] sm:max-w-[425px] bg-white text-slate-900 rounded-[24px] sm:rounded-[30px] shadow-2xl shadow-slate-950/60 border border-slate-100/60 p-5 sm:p-7 transition-all duration-300 relative z-20"
    >
      {mode === "update-password" && onUpdatePassword && (
        <UpdatePasswordForm
          onUpdatePassword={onUpdatePassword}
          onSuccess={onUpdatePasswordSuccess || (() => onModeChange("welcome"))}
          isExpiredToken={isTokenExpired}
          onRequestNewLink={onRequestNewResetLink || (() => onModeChange("forgot-password"))}
          isLoading={isLoading}
        />
      )}

      {mode === "welcome" && (
        <AuthWelcomeView
          onSwitchMode={onModeChange}
          onGoogleSignIn={onGoogleSignIn}
          onContinueWithEmail={() => onModeChange("email-signin")}
        />
      )}

      {mode === "email-signin" && (
        <AuthEmailSignInView
          initialEmail={activeEmail}
          onBack={() => onModeChange("welcome")}
          onSwitchMode={onModeChange}
          onGoogleSignIn={onGoogleSignIn}
          onSignIn={onSignInWithPassword}
          onEmailChange={setActiveEmail}
          onForgotPassword={(enteredEmail) => {
            const emailToUse = enteredEmail || activeEmail;
            if (emailToUse) setActiveEmail(emailToUse);
            if (onOpenForgotModal) {
              onOpenForgotModal(emailToUse);
            } else {
              onModeChange("forgot-password");
            }
          }}
          onContinueWithOtp={handleStartOtpSignIn}
          isLoading={isLoading}
        />
      )}

      {mode === "signup" && (
        <AuthSignUpView
          initialEmail={activeEmail}
          onSwitchMode={onModeChange}
          onGoogleSignIn={onGoogleSignIn}
          onSignUp={onSignUpWithPassword}
          isLoading={isLoading}
        />
      )}

      {mode === "forgot-password" && (
        <AuthForgotPasswordView
          initialEmail={activeEmail}
          onBack={() => onModeChange("email-signin")}
          onSwitchMode={onModeChange}
          onRequestReset={handleRequestReset}
          onProceedToOtp={handleProceedToOtpRecovery}
          isLoading={isLoading}
        />
      )}

      {mode === "otp-verify" && (
        <AuthOtpView
          email={activeEmail}
          purpose={otpPurpose}
          onBack={() => onModeChange(otpPurpose === "recovery" ? "forgot-password" : "email-signin")}
          onSwitchMode={onModeChange}
          onVerifyOtp={handleVerifyOtpCode}
          onResendOtp={handleResendOtp}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
