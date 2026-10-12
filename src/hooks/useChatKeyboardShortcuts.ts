"use client";

import { useEffect } from "react";

interface UseChatKeyboardShortcutsProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
  isMcpModalOpen?: boolean;
  onOpenMcpModal?: () => void;
  onCloseMcpModal?: () => void;
  hasReplyingTo: boolean;
  onCancelReply: () => void;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export function useChatKeyboardShortcuts({
  onNewChat,
  onToggleSidebar,
  isMcpModalOpen,
  onOpenMcpModal,
  onCloseMcpModal,
  hasReplyingTo,
  onCancelReply,
  isSidebarOpen,
  onCloseSidebar,
}: UseChatKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        onNewChat();
      } else if (isMeta && e.key.toLowerCase() === "h") {
        e.preventDefault();
        onToggleSidebar();
      } else if (isMeta && !e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (isMcpModalOpen) {
          onCloseMcpModal?.();
        } else {
          onOpenMcpModal?.();
        }
      } else if (e.key === "Escape") {
        if (isMcpModalOpen) {
          onCloseMcpModal?.();
        } else if (hasReplyingTo) {
          onCancelReply();
        } else if (isSidebarOpen) {
          onCloseSidebar();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onNewChat,
    onToggleSidebar,
    isMcpModalOpen,
    onOpenMcpModal,
    onCloseMcpModal,
    hasReplyingTo,
    onCancelReply,
    isSidebarOpen,
    onCloseSidebar,
  ]);
}
