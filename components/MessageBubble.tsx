"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StoredMessage, getMessageText, getMessageToolInvocations } from "@/src/lib/chat-storage";
import { AVAILABLE_MODELS } from "@/src/lib/models";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SuggestionChips } from "./SuggestionChips";
import { MessageAvatar } from "./chat/MessageAvatar";
import { MessageActionBar } from "./chat/MessageActionBar";
import { MessageToolWidget } from "./chat/MessageToolWidget";
import { DeveloperDiagnosticsBadge } from "./chat/DeveloperDiagnosticsBadge";
import { Cpu, Sparkles, TrainFront, Clock, Coins } from "lucide-react";
import { formatMessageTimestamp } from "@/src/utils/dates";

interface Props {
  message: StoredMessage;
  index: number;
  prevBoundModelName?: string;
  isLastMessage?: boolean;
  currentModelId: string;
  selectedSuggestion: string | null;
  onSuggestionClick: (promptText: string) => void;
  onReplyTo: (message: { id: string; role: string; content: string }) => void;
  isLoading: boolean;
  userDisplayName?: string | null;
  userEmail?: string | null;
  isCapped?: boolean;
}

// L2: Hoisted module-level subscriber for dev display settings so individual bubbles don't query localStorage synchronously on every mount
let cachedShowTokenCost: boolean | null = null;
let cachedShowDiagnostics: boolean | null = null;
const devDisplayListeners = new Set<() => void>();

function initDevDisplaySettings() {
  if (typeof window === "undefined" || cachedShowTokenCost !== null) return;
  cachedShowTokenCost = localStorage.getItem("confirmroute_dev_show_token_cost") === "true";
  cachedShowDiagnostics = localStorage.getItem("confirmroute_dev_show_diagnostics") === "true";

  window.addEventListener("confirmroute:show-token-cost-changed", (e: any) => {
    if (e?.detail?.enabled !== undefined) {
      cachedShowTokenCost = Boolean(e.detail.enabled);
      devDisplayListeners.forEach((fn) => fn());
    }
  });

  window.addEventListener("confirmroute:show-diagnostics-changed", (e: any) => {
    if (e?.detail?.enabled !== undefined) {
      cachedShowDiagnostics = Boolean(e.detail.enabled);
      devDisplayListeners.forEach((fn) => fn());
    }
  });
}

function useDevDisplaySettings() {
  const [, setTick] = useState(0);

  useEffect(() => {
    initDevDisplaySettings();
    const rerender = () => setTick((t) => t + 1);
    devDisplayListeners.add(rerender);
    return () => {
      devDisplayListeners.delete(rerender);
    };
  }, []);

  return {
    showTokenCost: cachedShowTokenCost ?? false,
    showDiagnostics: cachedShowDiagnostics ?? false,
  };
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  index,
  prevBoundModelName,
  isLastMessage = false,
  currentModelId,
  selectedSuggestion,
  onSuggestionClick,
  onReplyTo,
  isLoading,
  userDisplayName,
  userEmail,
  isCapped = false,
}: Props) {
  const isStreaming = Boolean(isLoading && isLastMessage && message.role === "assistant");
  const { showTokenCost, showDiagnostics } = useDevDisplaySettings();

  // Early return for system notification messages (CQ-11)
  if (message.role === "system") {
    return (
      <div className="flex items-center justify-center my-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
          <Cpu className="w-3 h-3 text-sky-400" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  // Model resolution: accurately displays the exact model that generated this specific reply
  const currentBoundModel =
    message.modelName ||
    (message.role === "assistant"
      ? AVAILABLE_MODELS.find((m) => m.id === (message.modelId || currentModelId))?.name
      : undefined);

  // Usage & cost annotations resolution (resilient to AI SDK metadata, annotations array, and data parts)
  const usageAnnotation =
    (message as any).metadata?.usage_metrics ||
    (Array.isArray((message as any).metadata?.annotations)
      ? (message as any).metadata.annotations.find(
          (a: any) => a && typeof a === "object" && a.type === "usage_metrics"
        )
      : undefined) ||
    (Array.isArray((message as any).annotations)
      ? ((message as any).annotations.find(
          (a: any) => a && typeof a === "object" && a.type === "usage_metrics"
        ) as any)
      : undefined) ||
    (Array.isArray((message as any).parts)
      ? (message as any).parts.find(
          (p: any) => p && p.type === "data-usage-metrics"
        )?.data
      : undefined);

  const usageTokens = usageAnnotation?.tokens || message.tokens;
  const usageCost = usageAnnotation?.cost || message.cost;
  const usageRole = usageAnnotation?.role || message.roleType;

  // Compute clean, localized timestamp
  const rawTimestamp =
    message.timestamp ||
    (message.createdAt ? new Date(message.createdAt).getTime() : undefined);
  const formattedTime = formatMessageTimestamp(rawTimestamp);

  const showModelSwitchDivider =
    showDiagnostics &&
    message.role === "assistant" &&
    index > 1 &&
    currentBoundModel &&
    prevBoundModelName &&
    currentBoundModel !== prevBoundModelName;

  const tokenTooltip = useMemo(() => {
    if (!usageTokens && !usageCost) return "";
    const lines: string[] = [];

    // Model & execution info
    const modelName =
      currentBoundModel ||
      usageAnnotation?.modelId ||
      (message as any).modelId ||
      "ConfirmRoute AI";
    const provider = usageAnnotation?.provider ? ` (${usageAnnotation.provider})` : "";
    lines.push(`🤖 Model: ${modelName}${provider}`);

    const mode = usageAnnotation?.mode;
    const role = usageRole || usageAnnotation?.role;
    if (mode || role) {
      const parts = [
        mode ? `Mode: ${mode}` : "",
        role ? `Role: ${String(role).toUpperCase()}` : "",
      ].filter(Boolean);
      lines.push(`⚙️ Execution: ${parts.join(" • ")}`);
    }

    if (usageAnnotation?.latencyMs) {
      const sec = (usageAnnotation.latencyMs / 1000).toFixed(2);
      const steps = usageAnnotation.stepsCount
        ? ` (${usageAnnotation.stepsCount} ${usageAnnotation.stepsCount === 1 ? "step" : "steps"})`
        : "";
      lines.push(`⏱️ Latency: ${sec}s (${usageAnnotation.latencyMs}ms)${steps}`);
    }

    // Tools invoked
    const messageTools = getMessageToolInvocations(message);
    const invokedTools =
      Array.isArray(usageAnnotation?.tools) && usageAnnotation.tools.length > 0
        ? usageAnnotation.tools
        : messageTools.length > 0
        ? Array.from(new Set(messageTools.map((t) => t.toolName)))
        : [];

    if (invokedTools.length > 0) {
      lines.push(`🔧 Tools Used (${invokedTools.length}): ${invokedTools.join(", ")}`);
    }

    lines.push("");
    lines.push("🧮 Token Breakdown:");
    lines.push(`• Total: ${(usageTokens?.total || 0).toLocaleString()} tokens`);
    lines.push(`• Input (Prompt): ${(usageTokens?.prompt || 0).toLocaleString()} tokens`);

    const cachedCount = usageTokens?.cached ?? 0;
    if (cachedCount > 0) {
      const hitPercent =
        usageAnnotation?.cache?.ratioPercent ||
        Math.round((cachedCount / (usageTokens?.prompt || 1)) * 100);
      lines.push(`  ↳ Cached: ${cachedCount.toLocaleString()} tokens (${hitPercent}% Cache Hit ⚡)`);
    }
    const uncachedCount =
      usageTokens?.uncached ??
      (usageTokens?.prompt && cachedCount > 0 ? Math.max(0, usageTokens.prompt - cachedCount) : 0);
    if (uncachedCount > 0 && cachedCount > 0) {
      lines.push(`  ↳ Uncached: ${uncachedCount.toLocaleString()} tokens`);
    }

    lines.push(`• Output (Reply): ${(usageTokens?.completion || 0).toLocaleString()} tokens`);
    if (usageTokens?.thinking != null && usageTokens.thinking > 0) {
      lines.push(`  ↳ Reasoning (Thinking): ${usageTokens.thinking.toLocaleString()} tokens`);
    }

    lines.push("");
    lines.push("💰 Cost & Savings:");
    const billedText = usageCost?.formattedInr || "₹0.00";
    const billedTier = usageCost?.isFreeTier ? "Free Tier" : usageCost?.formattedUsd || "$0.00";
    lines.push(`• Billed: ${billedText} (${billedTier})`);

    const realCostInr = usageCost?.realCostInr ?? usageCost?.estimatedPaidInr;
    const realCostUsd = usageCost?.realCostUsd ?? usageCost?.estimatedPaidUsd;
    if (realCostInr != null && realCostInr > 0) {
      lines.push(
        `• Real API Cost: ₹${realCostInr.toFixed(2)} ($${realCostUsd?.toFixed(4) || "0.0000"}) [Google / GCP Rate]`
      );
    }
    if (usageCost?.estimatedSavingsInr != null && usageCost.estimatedSavingsInr > 0) {
      lines.push(
        `• Cache Savings: ₹${usageCost.estimatedSavingsInr.toFixed(2)} ($${usageCost.estimatedSavingsUsd?.toFixed(4) || "0.0000"} saved)`
      );
    }

    // Dev mode status if applicable
    if (usageAnnotation?.isDev) {
      lines.push("");
      lines.push("🛠️ Dev Unlimited: Active (0 user quota deduction)");
    }

    return lines.join("\n");
  }, [usageTokens, usageCost, usageAnnotation, currentBoundModel, usageRole, message.toolInvocations]);

  return (
    <div className="space-y-2 group">
      {/* Model Switch In-feed Notification (Dev Only) */}
      {showModelSwitchDivider && (
        <div className="hidden sm:flex items-center justify-center my-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>Switched model to:</span>
            <span className="text-sky-300 font-semibold">{currentBoundModel}</span>
          </div>
        </div>
      )}

      {/* Message Row */}
      <div className={`flex gap-3 sm:gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
        {/* Assistant Avatar */}
        {message.role !== "user" && (
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 text-sky-400 shadow-md mt-0.5">
            <TrainFront className="w-4 h-4" />
          </div>
        )}

        {/* Message Bubble + Action Toolbar Container */}
        <div className="flex flex-col max-w-[92%] sm:max-w-[85%] min-w-0">
          <div
            className={`relative rounded-2xl p-4 sm:p-5 shadow-lg ${
              message.role === "user"
                ? "bg-gradient-to-br from-sky-600 to-sky-700 text-white rounded-tr-none"
                : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-3 backdrop-blur-sm"
            }`}
          >
            {/* Model & Time Tag for Assistant */}
            {message.role === "assistant" && (formattedTime || showTokenCost || showDiagnostics) && (
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 font-mono pb-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{showDiagnostics ? (currentBoundModel || "ConfirmRoute AI") : "ConfirmRoute AI"}</span>
                  {showDiagnostics && usageRole && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider bg-slate-800 text-sky-300 border border-slate-700">
                      {usageRole}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {showTokenCost && usageTokens && (
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition cursor-help select-none"
                      title={tokenTooltip}
                    >
                      <Coins className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      <span>{usageTokens.total || 0} tok</span>
                      <span className="text-slate-600">•</span>
                      <span className={usageCost?.isFreeTier ? "text-emerald-400" : "text-amber-300"}>
                        {usageCost?.formattedInr || "₹0.00"}
                      </span>
                    </div>
                  )}
                  {formattedTime && (
                    <div className="flex items-center gap-1 text-slate-400 shrink-0 font-sans">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{formattedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Message Content */}
            {message.role === "user" && (
              <div className="space-y-1.5">
                <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                  {getMessageText(message) || message.content}
                </div>
                {formattedTime && (
                  <div className="flex items-center justify-end gap-1 text-[10px] text-sky-200/80 font-sans select-none pt-0.5">
                    <Clock className="w-2.5 h-2.5 opacity-80" />
                    <span>{formattedTime}</span>
                  </div>
                )}
              </div>
            )}

            {/* Assistant Message Content (Markdown) */}
            {message.role === "assistant" && (getMessageText(message) || message.content) && (
              <MarkdownRenderer content={getMessageText(message) || message.content || ""} isStreaming={isStreaming} />
            )}

            {/* Tool Invocations Rendering (CRIT-4) */}
            {message.role === "assistant" && (() => {
              const messageTools = getMessageToolInvocations(message);
              if (messageTools.length === 0) return null;

              const hasPrimaryTool = messageTools.some(
                (t) => t.toolName !== "find_station_code" && t.toolName !== "find_train_by_name"
              );
              const hasConnectingToolWithResults = messageTools.some(
                (t) =>
                  t.toolName === "get_connecting_trains" &&
                  ((t as any).result?.connectionCount > 0 ||
                    (t as any).result?.connections?.length > 0)
              );

              const visibleTools = messageTools.filter((t) => {
                // Suppress intermediate lookup cards if a primary domain tool ran in the same turn
                if (hasPrimaryTool && (t.toolName === "find_station_code" || t.toolName === "find_train_by_name")) {
                  return false;
                }
                // If connecting trains were found, suppress redundant empty 0-result direct train card
                if (
                  hasConnectingToolWithResults &&
                  (t.toolName === "search_trains" || t.toolName === "find_nearby_terminal_trains") &&
                  ((t as any).result?.trainCount === 0 || (t as any).result?.trains?.length === 0)
                ) {
                  return false;
                }
                return true;
              });

              if (visibleTools.length === 0) return null;

              return (
                <div className="space-y-3 pt-2">
                  {visibleTools.map((tool, tIdx) => (
                    <MessageToolWidget key={tIdx} toolInvocation={tool} />
                  ))}
                </div>
              );
            })()}

            {/* Developer Diagnostics (Visible ONLY when Dev Diagnostics is toggled) */}
            {message.role === "assistant" && showDiagnostics && (
              <DeveloperDiagnosticsBadge
                role={usageRole || "WORKHORSE"}
                provider={usageAnnotation?.provider || "Gemini"}
                modelId={usageAnnotation?.modelId || message.modelId || "gemini-3.8-flash"}
                latencyMs={usageAnnotation?.latencyMs}
                fallbackTriggered={Boolean(usageAnnotation?.fallbackTriggered)}
              />
            )}

            {/* Suggestion Chips */}
            {message.role === "assistant" && (
              <SuggestionChips
                message={message}
                selectedSuggestion={selectedSuggestion}
                onSuggestionClick={onSuggestionClick}
                isLoading={isLoading}
                disabled={isCapped}
              />
            )}
          </div>

          {/* Action Bar Below Bubble */}
          <div className={`mt-1.5 px-1 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <MessageActionBar
              messageId={message.id}
              role={message.role as any}
              content={getMessageText(message) || message.content || ""}
              onReplyTo={onReplyTo}
              timestamp={message.role === "assistant" ? formattedTime : undefined}
            />
          </div>
        </div>

        {/* User Avatar with initials */}
        {message.role === "user" && (
          <MessageAvatar
            role="user"
            userDisplayName={userDisplayName}
            userEmail={userEmail}
          />
        )}
      </div>
    </div>
  );
});
