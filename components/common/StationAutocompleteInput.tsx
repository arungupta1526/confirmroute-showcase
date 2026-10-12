"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";

export interface StationOption {
  code: string;
  name: string;
  city: string | null;
  state: string | null;
  isMajor: boolean;
}

interface StationAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (option: StationOption) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  hasError?: boolean;
  className?: string;
}

export function StationAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter station name or code...",
  icon,
  hasError = false,
  className = "",
}: StationAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [options, setOptions] = useState<StationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const userHasTypedRef = useRef(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearBlurTimer = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  // Close dropdown on outside click or touch
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        clearBlurTimer();
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      clearBlurTimer();
    };
  }, []);

  // Debounced search when input changes
  useEffect(() => {
    // Only search if user has actively typed in this input
    if (!userHasTypedRef.current) {
      setIsOpen(false);
      return;
    }

    const query = value.replace(/\([A-Z0-9]+\)/i, "").trim();
    if (query.length < 2) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/stations/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          const list: StationOption[] = json.stations ?? [];
          setOptions(list);
          if (userHasTypedRef.current && list.length > 0) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
          setHighlightIndex(-1);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setOptions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const handleSelect = (option: StationOption) => {
    clearBlurTimer();
    userHasTypedRef.current = false;
    const formatted = `${option.name} (${option.code})`;
    onChange(formatted);
    onSelect?.(option);
    setOptions([]);
    setIsOpen(false);
    setIsFocused(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Prevent default form auto-submission on Enter inside station autocomplete
      e.preventDefault();
      e.stopPropagation();
      if (isOpen && options.length > 0) {
        const selected = highlightIndex >= 0 ? options[highlightIndex] : options[0];
        if (selected) {
          handleSelect(selected);
        }
      } else {
        // Dismiss suggestions and blur on Enter if no options
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (!isOpen || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearBlurTimer();
    userHasTypedRef.current = true;
    setIsFocused(true);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    clearBlurTimer();
    setIsFocused(true);
    if (userHasTypedRef.current && options.length > 0) {
      setIsOpen(true);
    }
  };

  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleInputBlur = () => {
    clearBlurTimer();
    // Delay closing so that clicking/tapping an option in dropdown completes first
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      setIsOpen(false);
    }, 220);
  };

  const handleClear = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearBlurTimer();
    onChange("");
    setOptions([]);
    setIsOpen(false);
    userHasTypedRef.current = true;
    setIsFocused(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon ?? <MapPin className="w-3.5 h-3.5 text-slate-400" />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={`w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-950 border text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none transition ${
            hasError
              ? "border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30"
              : "border-slate-700/80 focus:border-emerald-500"
          } ${className}`}
        />

        {isLoading ? (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          </div>
        ) : value ? (
          <button
            type="button"
            onPointerDown={handleClear}
            onTouchStart={handleClear}
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-700 transition"
            title="Clear station"
            aria-label="Clear station"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && options.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl backdrop-blur-md divide-y divide-slate-800/60 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt, idx) => (
            <button
              key={`${opt.code}-${idx}`}
              type="button"
              onPointerDown={(e) => {
                // Prevent input blur while interacting with options
                e.preventDefault();
              }}
              onTouchStart={(e) => {
                touchStartPosRef.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                };
              }}
              onTouchEnd={(e) => {
                // Disambiguate scroll gesture from tap: ignore if finger dragged > 10px
                if (touchStartPosRef.current) {
                  const dx = Math.abs(e.changedTouches[0].clientX - touchStartPosRef.current.x);
                  const dy = Math.abs(e.changedTouches[0].clientY - touchStartPosRef.current.y);
                  if (dx > 10 || dy > 10) {
                    return;
                  }
                }
                // Prevent synthetic ghost click on underlying elements
                e.preventDefault();
                e.stopPropagation();
                handleSelect(opt);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 text-xs transition cursor-pointer ${
                highlightIndex === idx
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-200 hover:bg-slate-800/80 active:bg-slate-800"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-semibold truncate text-slate-100">
                  {opt.name}
                </span>
                {(opt.city || opt.state) && (
                  <span className="text-[10px] text-slate-400 truncate">
                    {[opt.city, opt.state].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
                {opt.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
