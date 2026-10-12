"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client";

import { syncAuthCookie, UserProfileData } from "./authCookie";
import { dispatchAuthLog } from "@/src/lib/logging/auth-event-client";
import { validateEmailIntegrity, getCanonicalEmail } from "@/src/lib/auth/emailUtils";
import {
  authState,
  authListeners,
  MAX_AUTH_LISTENERS,
  clearProfileCache,
  notifyAuthListeners,
  fetchProfileGlobal,
} from "./authProfileCache";

export type { UserProfileData };

export function useAuth() {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rerender = () => setTick((t) => t + 1);
    if (authListeners.size < MAX_AUTH_LISTENERS) {
      authListeners.add(rerender);
    }
    return () => {
      authListeners.delete(rerender);
    };
  }, []);

  // Initialize Supabase auth listener ONCE globally on client load
  useEffect(() => {
    if (authState.isInitialized || typeof window === "undefined") return;
    authState.isInitialized = true;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      fetchProfileGlobal().finally(() => {
        authState.isLoading = false;
        notifyAuthListeners();
      });
      return;
    }

    // Only inspect active session once on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      authState.session = session;
      authState.user = session?.user ?? null;
      syncAuthCookie(session?.access_token, session?.refresh_token);
      fetchProfileGlobal(session?.access_token).finally(() => {
        authState.isLoading = false;
        notifyAuthListeners();
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip INITIAL_SESSION if already resolved by getSession()
      if (event === "INITIAL_SESSION") return;
      authState.session = session;
      authState.user = session?.user ?? null;
      syncAuthCookie(session?.access_token, session?.refresh_token);
      if (event === "SIGNED_IN" && session?.user?.email) {
        const provider = session.user.app_metadata?.provider || "oauth";
        if (provider !== "email") {
          dispatchAuthLog({
            event: "login_success",
            email: session.user.email,
            userId: session.user.id,
            provider,
          });
        }
      }
      fetchProfileGlobal(session?.access_token, true).finally(() => {
        authState.isLoading = false;
        notifyAuthListeners();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");
    const canonicalEmail = getCanonicalEmail(email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: canonicalEmail, password });
      if (error) throw error;
      authState.session = data.session;
      authState.user = data.user;
      syncAuthCookie(data.session?.access_token, data.session?.refresh_token);
      dispatchAuthLog({
        event: "login_success",
        email: data.user?.email || canonicalEmail,
        userId: data.user?.id,
        provider: "password",
      });
      await fetchProfileGlobal(data.session?.access_token, true);
      return data;
    } catch (err: any) {
      dispatchAuthLog({
        event: "login_failed",
        email: canonicalEmail,
        reason: err?.message || "Invalid credentials",
      });
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    stateCode?: string,
    phone?: string
  ) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");

    const integrity = await validateEmailIntegrity(email);
    if (!integrity.allowed) {
      throw new Error(integrity.reason || "Invalid or disposable email address.");
    }

    const canonicalEmail = integrity.canonicalEmail;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: canonicalEmail,
        password,
        options: {
          data: {
            full_name: displayName,
            state_code: stateCode || "07",
            phone: phone || undefined,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        try {
          await supabase
            .from("profiles")
            .update({
              display_name: displayName,
              full_name: displayName,
              state_code: stateCode || "07",
            })
            .eq("id", data.user.id);
        } catch {
          // Non-blocking sync
        }
      }

      dispatchAuthLog({
        event: "register_success",
        email: data.user?.email || canonicalEmail,
        userId: data.user?.id,
        displayName,
      });
      return data;
    } catch (err: any) {
      dispatchAuthLog({
        event: "register_failed",
        email: canonicalEmail,
        reason: err?.message || "Registration error",
      });
      throw err;
    }
  };

  const signInWithOtp = async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");

    const integrity = await validateEmailIntegrity(email);
    if (!integrity.allowed) {
      throw new Error(integrity.reason || "Invalid or disposable email address.");
    }

    const canonicalEmail = integrity.canonicalEmail;

    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email: canonicalEmail });
      if (error) throw error;
      return data;
    } catch (err: any) {
      dispatchAuthLog({
        event: "login_failed",
        email: canonicalEmail,
        reason: err?.message || "OTP request failed",
        provider: "otp",
      });
      throw err;
    }
  };

  const verifyOtp = async (email: string, token: string, type: "email" | "recovery" | "signup" = "email") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");
    const canonicalEmail = getCanonicalEmail(email);
    const { data, error } = await supabase.auth.verifyOtp({
      email: canonicalEmail,
      token: token.trim(),
      type,
    });
    if (error) throw error;
    if (data.session) {
      authState.session = data.session;
      authState.user = data.user;
      syncAuthCookie(data.session.access_token, data.session.refresh_token);
      await fetchProfileGlobal(data.session.access_token, true);
    }
    return data;
  };

  const resetPasswordForEmail = async (email: string, redirectTo?: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");
    const canonicalEmail = getCanonicalEmail(email);
    const redirect =
      redirectTo ||
      (typeof window !== "undefined" ? `${window.location.origin}/auth?mode=update-password` : undefined);
    const { data, error } = await supabase.auth.resetPasswordForEmail(canonicalEmail, {
      redirectTo: redirect,
    });
    if (error) throw error;
    return data;
  };

  const signInWithOAuth = async (provider: "google" | "github", redirectTo?: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");
    const redirect =
      redirectTo ||
      (typeof window !== "undefined" ? `${window.location.origin}/` : undefined);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirect,
      },
    });
    if (error) throw error;
    return data;
  };

  const updatePassword = async (newPassword: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Authentication service is not configured.");
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const loggedOutEmail = authState.user?.email;
    const loggedOutUserId = authState.user?.id;
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    syncAuthCookie(undefined);
    clearProfileCache();
    dispatchAuthLog({
      event: "logout",
      email: loggedOutEmail,
      userId: loggedOutUserId,
    });
    notifyAuthListeners();
    await fetchProfileGlobal(undefined, true);
  };

  return {
    session: authState.session,
    user: authState.user,
    profile: authState.profile,
    isLoading: authState.isLoading,
    refreshProfile: () => fetchProfileGlobal(authState.session?.access_token, true),
    signInWithPassword,
    signUp,
    signInWithOtp,
    verifyOtp,
    resetPasswordForEmail,
    updatePassword,
    signInWithOAuth,
    signOut,
  };
}
