"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Keyboard, X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_ITEMS = [
  { keys: ["Cmd/Ctrl", "N"], label: "New Chat Session" },
  { keys: ["Cmd/Ctrl", "H"], label: "Toggle Chat History" },
  { keys: ["Cmd/Ctrl", "M"], label: "Developer MCP Setup" },
  { keys: ["Cmd/Ctrl", "Shift", "V"], label: "Toggle Voice Input" },
  { keys: ["Enter"], label: "Send Message" },
  { keys: ["Shift", "Enter"], label: "New Line in Input" },
  { keys: ["Esc"], label: "Cancel Reply / Dismiss" },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Keyboard className="w-4 h-4 text-sky-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {SHORTCUT_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-b-0"
            >
              <span className="text-slate-300">{item.label}</span>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 shadow-inner"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
