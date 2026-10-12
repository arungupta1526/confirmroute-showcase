"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UsePullToRefreshOptions {
  threshold?: number;
  maxPull?: number;
  onRefresh?: () => void;
}

export function usePullToRefresh(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UsePullToRefreshOptions = {}
) {
  const { threshold = 65, maxPull = 120, onRefresh } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const el = containerRef.current;
      if (!el || isRefreshing || !e.touches[0]) return;

      // Only engage pull-to-refresh if scrolled to or past the top
      if (el.scrollTop <= 0) {
        startXRef.current = e.touches[0].clientX;
        startYRef.current = e.touches[0].clientY;
        isDraggingRef.current = true;
      }
    },
    [containerRef, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const el = containerRef.current;
      if (!el || !isDraggingRef.current || isRefreshing || !e.touches[0]) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startXRef.current;
      const diffY = currentY - startYRef.current;

      // If horizontal movement is dominant, this is a horizontal scroll/swipe - cancel pull-to-refresh
      if (Math.abs(diffX) > Math.abs(diffY)) {
        isDraggingRef.current = false;
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      // Only pull downwards from top
      if (diffY > 0 && el.scrollTop <= 0) {
        // Damped pull distance curve
        const distance = Math.min(maxPull, Math.pow(diffY, 0.82) * 1.5);
        setPullDistance(distance);
        setIsPulling(true);

        // Prevent native rubber-band bounce when pulling
        if (e.cancelable && distance > 10) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [containerRef, isRefreshing, maxPull]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      // Trigger user refresh or fallback to page reload
      if (onRefresh) {
        onRefresh();
      } else if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Passive false on touchmove to allow preventDefault if cancelable
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    canRefresh: pullDistance >= threshold,
    threshold,
  };
}
