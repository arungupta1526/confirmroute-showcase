"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand";
import { useAuth } from "@/src/hooks/useAuth";
import {
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Radio,
  Bot,
  Cloud,
  LogIn,
  User,
} from "lucide-react";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Live Search", href: "#search", icon: Radio },
    { label: "AI Capabilities", href: "#capabilities", icon: Sparkles },
    { label: "Interactive Demo", href: "#assistant-demo", icon: Bot },
    { label: "Architecture", href: "/about", icon: Cloud },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" title="ConfirmRoute AI">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition"
              title={`Logged in as ${user.email}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="max-w-[120px] truncate">
                {profile?.user?.displayName || user.email?.split("@")[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log In</span>
            </Link>
          )}

          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
            <span>Launch AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 space-y-2">
            {user ? (
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-slate-200 border border-slate-800 bg-slate-900"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Logged in as {user.email?.split("@")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-slate-300 border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log In / Sign Up</span>
              </Link>
            )}

            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Chat</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
