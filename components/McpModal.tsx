"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Server, X, Terminal, Copy, Check } from "lucide-react";

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpModal: React.FC<McpModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        confirmroute: {
          command: "npx",
          args: ["-y", "confirmroute-mcp-server"],
          env: {
            CONFIRMROUTE_API_KEY: "cr_live_showcase_key",
          },
        },
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(mcpConfigSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl text-slate-100 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Model Context Protocol (MCP)</h3>
              <p className="text-xs text-slate-400">Connect ConfirmRoute to Cursor, Windsurf, or Claude Desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            ConfirmRoute exposes 25 specialized Indian Railways intelligence tools via the open standard <strong>Model Context Protocol (MCP)</strong>.
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 font-mono text-[11px] relative">
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy JSON"}</span>
            </button>
            <pre className="text-slate-300 overflow-x-auto pr-16">{mcpConfigSnippet}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
