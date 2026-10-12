"use client";

import { useEffect, useState, useCallback } from "react";
import { StoredMessage } from "@/src/lib/chat-storage";

const FIRST_TIME_KEY = "confirmroute_first_time_welcomed_v1";

/**
 * Returns a time-of-day greeting in Indian Standard Time (IST / UTC+5:30)
 */
export function getTimeOfDayGreeting(): string {
  try {
    const istHourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false,
    }).format(new Date());
    const hour = parseInt(istHourStr, 10);
    if (hour >= 4 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  } catch {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  }
}

/**
 * Constructs the rich introductory welcome message for showcase visitors.
 * Zero plan / pricing / account creation clutter.
 */
export function generateWelcomeMessage(): StoredMessage {
  const greeting = getTimeOfDayGreeting();

  const content = `# ${greeting}! Welcome to ConfirmRoute AI 🚆

I am your intelligent Indian Railways travel companion powered by real-time railway telemetry. I help you find confirmed train tickets, uncover 2-leg break-journey routes when direct trains are waitlisted, track live delays, and find post-charting vacant berths.

---

### 🌟 Core Features & Capabilities
- 🔍 **Live Seat Availability & Confirmation Probability**: Real-time seat status across 1A, 2A, 3A, CC, and Sleeper (SL) with confirmation forecasts.
- 🔄 **2-Leg Connecting Trains (Break Journey)**: When direct trains are sold out or waitlisted, automatically uncover confirmed-availability options via intermediate junction hubs.
- 📍 **Live Running Status & Delays**: Real-time train tracking, current station location, arrival/departure delays, and platform numbers.
- 📅 **60-Day Seat Availability Trend Calendar**: Day-by-day availability trend calendar across future travel dates.
- 🎫 **10-Digit PNR Status**: Live passenger coach and berth allocation, charting status, and confirmation forecasts.
- 💺 **Vacant Berths After Charting**: Instant lookup of empty seats and current booking berths on departing or running trains.
- ⚡ **Tatkal Strategy Advisor**: Tatkal countdowns (10:00 AM AC / 11:00 AM Non-AC), quota guidance, and IRCTC booking tips.
- 🚉 **Timetable Schedules, Coach Layout & Ratings**: Complete station stoppage sequence, exact coach placement on platforms, and passenger ratings.

---

*Type your question in natural English or Hindi, or tap a quick-start prompt below:*`.trim();

  return {
    id: "welcome-message-first-time",
    role: "assistant",
    content,
    createdAt: new Date(),
    timestamp: Date.now(),
  };
}

export function useFirstTimeWelcome() {
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const welcomed = localStorage.getItem(FIRST_TIME_KEY);
    if (!welcomed) {
      setIsFirstTime(true);
    }
  }, []);

  const markWelcomed = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FIRST_TIME_KEY, "true");
      setIsFirstTime(false);
    }
  }, []);

  return {
    isFirstTime,
    generateWelcomeMessage,
    markWelcomed,
  };
}
