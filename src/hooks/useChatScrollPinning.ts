"use client";

import { useRef, useCallback, useEffect } from "react";
import type { UIMessage } from "ai";

/**
 * High-performance scroll pinning hook.
 * Avoids layout thrashing and animation queue locks during high-frequency AI streaming.
 */
export function useChatScrollPinning(messages: UIMessage[], isLoading: boolean) {
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const scrollAnimationFrameRef = useRef<number | null>(null);

  const handleContainerScroll = useCallback(() => {
    const el = chatScrollContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Pinned if user is within 120px of bottom
    isNearBottomRef.current = distanceToBottom <= 120;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (!isNearBottomRef.current && !force) return;

    if (scrollAnimationFrameRef.current) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
    }

    scrollAnimationFrameRef.current = requestAnimationFrame(() => {
      const el = chatScrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, []);

  // Auto-scroll on new messages or stream chunks
  useEffect(() => {
    scrollToBottom();
    return () => {
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, [messages, isLoading, scrollToBottom]);

  return {
    chatScrollContainerRef,
    isNearBottomRef,
    handleContainerScroll,
    scrollToBottom,
  };
}
