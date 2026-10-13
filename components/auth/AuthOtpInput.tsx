"use client";

import React, { useRef, useEffect } from "react";

interface AuthOtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  disabled?: boolean;
  onComplete?: (otp: string) => void;
}

export const AuthOtpInput: React.FC<AuthOtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  onComplete,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const hasMounted = useRef(false);

  // Array of digits matching length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    // Auto focus first input on initial mount only
    if (!hasMounted.current) {
      hasMounted.current = true;
      inputsRef.current[0]?.focus();
    }
  }, []);

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newOtp = newDigits.join("");
    onChange(newOtp);

    // Auto advance to next input if digit entered
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newOtp.length === length && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;
    onChange(pastedData);
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 my-2">
      {Array.from({ length }).map((_, i) => {
        const hasVal = Boolean(digits[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digits[i]}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{ colorScheme: "light" }}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl border transition-all select-none focus:outline-none ${
              hasVal
                ? "border-[#008779] bg-emerald-50/40 text-slate-900 shadow-sm"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
            } focus:border-[#008779] focus:ring-3 focus:ring-[#008779]/20 disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
};
