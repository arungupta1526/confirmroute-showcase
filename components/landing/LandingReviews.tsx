"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Train, Users, ShieldCheck, Award } from "lucide-react";

export function LandingReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const stats = [
    { icon: Users, value: "10K+", label: "Happy Travellers" },
    { icon: ShieldCheck, value: "95%", label: "Prediction Accuracy" },
    { icon: Train, value: "5K+", label: "Daily Train Searches" },
    { icon: Award, value: "4.8/5", label: "User Rating" },
  ];

  const reviews = [
    {
      name: "Rohit Sharma",
      city: "Delhi",
      persona: "Young Commuter",
      route: "12301 Rajdhani Express",
      quote:
        "My WL 32 got confirmed exactly as predicted by ConfirmRoute! Saved me so much stress before my family trip.",
      avatar: "/images/avatars/boy-curly.jpg",
    },
    {
      name: "Priya Verma",
      city: "Bengaluru",
      persona: "Working Professional",
      route: "22436 Vande Bharat",
      quote:
        "The 2-leg route suggestion feature is amazing. I got a confirmed seat via Prayagraj when direct trains were full.",
      avatar: "/images/avatars/cartoon-woman.jpg",
    },
    {
      name: "Kavya Patel",
      city: "Ahmedabad",
      persona: "College Student",
      route: "12952 Mumbai Tejas",
      quote:
        "Booking Tatkal was so stressful before. The Tatkal advisor told me the exact booking opening seconds and chances!",
      avatar: "/images/avatars/cartoon-girl.jpg",
    },
    {
      name: "Aarav Mehta",
      city: "Jaipur",
      persona: "School Explorer",
      route: "12015 Ajmer Shatabdi",
      quote:
        "I loved checking our coach position and window seats before boarding. The bogie map is so easy and fun to use!",
      avatar: "/images/avatars/school-boy.jpg",
    },
    {
      name: "Sneha Kulkarni",
      city: "Pune",
      persona: "Architect & Mother",
      route: "12124 Deccan Queen",
      quote:
        "The 60-day availability calendar is a game changer for festival planning. Spotted open berths weeks in advance.",
      avatar: "/images/avatars/cartoon-woman.jpg",
    },
    {
      name: "Aditya Verma",
      city: "Lucknow",
      persona: "Techie Commuter",
      route: "12004 Shatabdi Express",
      quote:
        "Live running status and accurate platform delay alerts make this my go-to app for every rail journey.",
      avatar: "/images/avatars/boy-curly.jpg",
    },
    {
      name: "Diya Sen",
      city: "Kolkata",
      persona: "Student Traveler",
      route: "12305 Howrah Rajdhani",
      quote:
        "Natural language AI chat feels so refreshing. No confusing railway portals — just direct answers in seconds.",
      avatar: "/images/avatars/cartoon-girl.jpg",
    },
    {
      name: "Kabir Joshi",
      city: "Patna",
      persona: "Junior Traveler",
      route: "12393 Sampoorna Kranti",
      quote:
        "Vacant chart berths radar found my family empty berths right after charting! Highly recommended for all rail travelers.",
      avatar: "/images/avatars/school-boy.jpg",
    },
  ];

  // Auto-advance carousel every 4s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, reviews.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const visibleReviews = [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ];

  return (
    <section id="reviews" className="py-16 bg-[#040711] border-t border-slate-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. Trusted by 50,000+ Travellers Banner (Matching Reference 1) */}
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Trusted by <span className="text-cyan-400">10,000+</span> Railway Travellers
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              People across India rely on ConfirmRoute for accurate predictions and smarter journeys.
            </p>
          </div>

          {/* 4 Circular Golden/Amber Stats Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center space-y-2 group">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. What Our Users Say (Auto-Slide Carousel matching Reference 1) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              What Our Users Say
            </h3>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {visibleReviews.map((r, idx) => (
              <div
                key={`${r.name}-${idx}`}
                className="p-6 rounded-2xl bg-[#090e1c] border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-5 shadow-xl text-left"
              >
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
                  "{r.quote}"
                </p>

                {/* Author Info with Cartoon Avatar */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-cyan-500/30 bg-slate-900 shrink-0 shadow-md">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{r.name}</h4>
                      <span className="text-[10px] text-cyan-400 font-medium">({r.persona})</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{r.city} • {r.route}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-cyan-400" : "w-1.5 bg-slate-800 hover:bg-slate-700"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
