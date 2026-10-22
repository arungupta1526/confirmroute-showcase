"use client";

import React, { useState, useEffect } from "react";
import { Send, Loader2, X, Mic, MicOff, Keyboard } from "lucide-react";
import { useVoiceInput } from "@/src/hooks/useVoiceInput";
import { SessionTurnWarning } from "./SessionTurnWarning";
import { SessionLimitReachedCard } from "./SessionLimitReachedCard";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { isMobileDevice, safeFocusChatInput } from "@/src/utils/focusHelper";

interface ReplyingToState {
  id: string;
  role: string;
  content: string;
}

interface ChatInputBarProps {
  replyingTo: ReplyingToState | null;
  onCancelReply: () => void;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  hasAnyKey: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isWarning?: boolean;
  isCapped?: boolean;
  remainingTurns?: number;
  maxTurns?: number;
  onNewChat?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  replyingTo,
  onCancelReply,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  hasAnyKey,
  inputRef,
  isWarning = false,
  isCapped = false,
  remainingTurns = 4,
  maxTurns = 20,
  onNewChat = () => {},
}) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  useEffect(() => {
    if (!isMobileDevice()) {
      setShouldAutoFocus(true);
    }
  }, []);
  const { isListening, isSupported, language, setLanguage, toggleListening, error: voiceError, clearError: clearVoiceError } = useVoiceInput({
    defaultLanguage: "en-IN",
    onTranscript: (transcript) => {
      // Set the clean voice query directly (replaces any stale unsent text to prevent mashed-up queries)
      const fakeEvent = {
        target: { value: transcript.trim() },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onInputChange(fakeEvent);
      safeFocusChatInput(inputRef.current, true);
    },
  });

  // Auto-resize textarea height as user types (up to 4-5 text lines max)
  React.useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    if (!input.trim()) {
      textarea.style.height = "";
      textarea.style.overflowY = "hidden";
      return;
    }
    textarea.style.height = "auto";
    const maxHeight = 136; // ~4-5 lines of text
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    // Only enable vertical scrollbar when content actually exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input, inputRef]);

  // Global keyboard shortcut for toggling mic: Cmd/Ctrl + Shift + V
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        e.stopPropagation();
        if (hasAnyKey && !isLoading && isSupported) {
          toggleListening();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasAnyKey, isLoading, isSupported, toggleListening]);

  return (
    <div className="px-3 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Voice Input Error Toast / Banner */}
        {voiceError && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-200 animate-in fade-in slide-in-from-bottom-2 shadow-lg">
            <div className="flex items-center gap-2">
              <MicOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={clearVoiceError}
              className="p-1 hover:text-white transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Reply Preview Banner (UX-1: Truncated to 80 chars) */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 animate-in fade-in">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sky-400 font-bold uppercase text-[10px]">
                Replying to {replyingTo.role}:
              </span>
              <span className="text-slate-400 truncate max-w-[280px] sm:max-w-[480px]">
                &quot;{replyingTo.content.slice(0, 80)}
                {replyingTo.content.length > 80 ? "..." : ""}&quot;
              </span>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 hover:text-rose-400 transition cursor-pointer"
              title="Cancel reply (Escape)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Session Turn Warning Banner (when nearing turn limit) */}
        {isWarning && !isCapped && (
          <SessionTurnWarning remainingTurns={remainingTurns} onNewChat={onNewChat} />
        )}

        {/* Capped Session Card (when max turn limit reached) */}
        {isCapped ? (
          <SessionLimitReachedCard maxTurns={maxTurns} onNewChat={onNewChat} />
        ) : (
          /* Input Form */
          <form onSubmit={onSubmit} className="relative flex items-end">
          <textarea
            ref={inputRef}
            id="chat-input"
            autoFocus={shouldAutoFocus}
            rows={1}
            value={input}
            onChange={onInputChange}
            data-grammarly="false"
            data-enable-grammarly="false"
            spellCheck={false}
            suppressHydrationWarning
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (hasAnyKey && input.trim() && !isLoading) {
                  onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }
            }}
            disabled={!hasAnyKey}
            placeholder={
              !hasAnyKey
                ? "Add GEMINI_API_KEY in .env.local..."
                : "Ask about trains, PNR status, or live delays..."
            }
            className={`w-full rounded-2xl bg-slate-900/90 border text-xs sm:text-sm pl-3.5 sm:pl-4 pr-24 sm:pr-28 py-3 sm:py-3.5 leading-5 min-h-[44px] focus:outline-none transition-colors shadow-inner backdrop-blur resize-none overflow-y-hidden max-h-[136px] sm:max-h-[144px] placeholder:truncate placeholder:text-[11px] xs:placeholder:text-xs sm:placeholder:text-sm placeholder:text-slate-500 ${
              !hasAnyKey
                ? "border-amber-900/60 bg-slate-950 text-slate-500 cursor-not-allowed"
                : "border-slate-800 text-slate-100 hover:border-slate-700 focus:border-sky-500"
            }`}
          />

          {isSupported && (
            <div className="absolute right-11 sm:right-12 bottom-2 sm:bottom-2.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLanguage(language === "en-IN" ? "hi-IN" : "en-IN")}
                disabled={!hasAnyKey || isLoading || isListening}
                aria-label="Toggle voice language"
                title={`Language: ${language === "en-IN" ? "English (Click for Hindi)" : "Hindi (Click for English)"}`}
                className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60 cursor-pointer"
              >
                {language === "en-IN" ? "EN" : "हिं"}
              </button>

              <button
                type="button"
                onClick={toggleListening}
                disabled={!hasAnyKey || isLoading}
                aria-label={isListening ? "Stop listening" : "Voice input"}
                title={
                  isListening
                    ? "Listening... Click to stop (Cmd/Ctrl+Shift+V)"
                    : `Voice Input (${language === "en-IN" ? "English" : "Hindi"}) [Cmd/Ctrl+Shift+V]`
                }
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isListening
                    ? "text-rose-400 bg-rose-950/80 border border-rose-500/50 animate-pulse shadow-lg shadow-rose-900/50"
                    : "text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!hasAnyKey || !input.trim() || isLoading}
            aria-label="Send message"
            className={`absolute right-2 bottom-2 sm:bottom-2.5 p-2 rounded-xl transition cursor-pointer ${
              !hasAnyKey || !input.trim() || isLoading
                ? "text-slate-600 bg-slate-800/40 cursor-not-allowed"
                : "text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        )}

        {/* Bottom Bar: Shortcuts Trigger (Left) · Copyright (Center) · Mandatory Links (Right) */}
        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500 px-1 pt-1 overflow-hidden" suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800/60 hover:border-slate-700 transition cursor-pointer shrink-0 text-[10px] sm:text-[11px]"
            title="View Keyboard Shortcuts"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>

          {/* Center: Copyright directly in the middle */}
          <span className="text-[10px] text-slate-500 font-sans select-none text-center truncate">
            &copy; {new Date().getFullYear()} ConfirmRoute. All rights reserved.
          </span>

          {/* Right: Policy Links */}
          <span className="flex items-center gap-1.5 sm:gap-2 text-[10px] shrink-0">
            <a href="/about" target="_blank" rel="noreferrer" className="hover:text-slate-300 text-sky-400/90 transition underline underline-offset-2">
              About
            </a>
            <span>·</span>
            <a href="/contact" target="_blank" rel="noreferrer" className="hover:text-slate-300 text-orange-400/90 transition underline underline-offset-2">
              Contact
            </a>
            <span>·</span>
            <a href="/terms" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition underline underline-offset-2">
              Terms
            </a>
            <span>·</span>
            <a href="/privacy" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition underline underline-offset-2">
              Privacy
            </a>
          </span>
        </div>

        {/* Keyboard Shortcuts Dialog Modal */}
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
      </div>
    </div>
  );
};
