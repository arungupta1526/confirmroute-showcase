"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export function ScrollToTopButton({ targetRef }: Props) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const distanceToBottom = el.scrollHeight - scrollTop - el.clientHeight;

    setShowScrollTop(scrollTop > 250);
    setShowScrollBottom(distanceToBottom > 180);
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll, { passive: true });

    // Re-check when container resizes or new messages are appended
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [targetRef, checkScroll]);

  const scrollToTop = () => {
    targetRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    const el = targetRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  };

  if (!showScrollTop && !showScrollBottom) return null;

  return (
    <div className="fixed bottom-24 right-6 sm:right-10 z-30 flex flex-col gap-2 items-center pointer-events-auto">
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top of chat"
          className="p-2.5 rounded-full bg-slate-900/90 border border-sky-500/40 text-sky-400 hover:text-white hover:bg-sky-600 shadow-lg shadow-black/50 backdrop-blur transition-all duration-200 animate-in fade-in cursor-pointer active:scale-95"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to latest messages"
          className="p-2.5 rounded-full bg-slate-900/90 border border-sky-500/40 text-sky-400 hover:text-white hover:bg-sky-600 shadow-lg shadow-black/50 backdrop-blur transition-all duration-200 animate-in fade-in cursor-pointer active:scale-95"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
