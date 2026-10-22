"use client";

import React, { useState } from "react";
import { Cpu, ChevronDown, ChevronUp } from "lucide-react";

interface DeveloperDiagnosticsBadgeProps {
  role?: string;
  provider?: string;
  modelId?: string;
  latencyMs?: number;
  fallbackTriggered?: boolean;
}

export const DeveloperDiagnosticsBadge: React.FC<DeveloperDiagnosticsBadgeProps> = ({
  role = "WORKHORSE",
  provider = "ConfirmRoute AI",
  modelId = "auto",
  latencyMs,
  fallbackTriggered = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Strictly hide diagnostics from end-users in production builds
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="mt-2 text-[10px] font-mono rounded-lg bg-slate-950/90 border border-indigo-900/40 text-indigo-300 p-2 select-none shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left font-semibold text-indigo-300 hover:text-indigo-200 transition cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-indigo-400" />
          <span>Dev Diagnostics</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
            {role.toUpperCase()}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-indigo-900/30 space-y-1 text-slate-400 font-mono text-[10px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Role:</span>
            <span className="text-indigo-300 font-semibold">{role.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Provider:</span>
            <span className="text-sky-300 font-semibold">{provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Model:</span>
            <span className="text-slate-300">{modelId}</span>
          </div>
          {latencyMs !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-500">Latency:</span>
              <span className="text-emerald-400">{latencyMs} ms</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Fallback:</span>
            <span className={fallbackTriggered ? "text-amber-400 font-semibold" : "text-slate-400"}>
              {fallbackTriggered ? "Yes" : "No"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
