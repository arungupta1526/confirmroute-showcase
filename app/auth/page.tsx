import React, { Suspense } from "react";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { getPlanConfig } from "@/src/config/plans.config";

export const metadata = {
  title: "Sign In / Sign Up | ConfirmRoute AI",
  description:
    `Sign in to your ConfirmRoute AI account or create a new account to unlock ${getPlanConfig("traveler_free").searchLimit} daily searches, 60-day seat confirmation calendar, and MCP API keys.`,
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#01182b] flex items-center justify-center p-4">
          <div className="h-8 w-8 rounded-full border-2 border-[#01A077] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthContainer />
    </Suspense>
  );
}
