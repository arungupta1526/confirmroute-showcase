"use client";

import React, { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

interface AuthGoogleButtonProps {
  onGoogleSignIn: () => Promise<void>;
  isLoading?: boolean;
}

export const AuthGoogleButton: React.FC<AuthGoogleButtonProps> = ({
  onGoogleSignIn,
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async () => {
    setInternalLoading(true);
    try {
      await onGoogleSignIn();
    } finally {
      setInternalLoading(false);
    }
  };

  const busy = isLoading || internalLoading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="group relative w-full flex items-center justify-center py-3.5 px-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/70 hover:border-slate-300 active:scale-[0.99] transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-center justify-center gap-2.5">
        {/* Google Official 4-Color Icon */}
        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
          {busy ? (
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          ) : (
            <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
        </div>

        <span className="text-sm sm:text-[15px] font-semibold text-slate-800 tracking-tight text-center">
          Continue with Google
        </span>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all absolute right-4" />
    </button>
  );
};
