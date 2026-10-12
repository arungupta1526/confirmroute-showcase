import React from "react";
import { AlertCircle, Zap, RotateCcw, Sparkles } from "lucide-react";

interface ChatErrorBannerProps {
  errorMessage: string | null;
  error?: Error | null;
  onRetry: () => void;
  onOpenAccountModal: (tab?: "plan" | "mcp" | "auth") => void;
  currentModelId?: string;
  onSwitchModel?: (modelId: string) => void;
}

export const ChatErrorBanner: React.FC<ChatErrorBannerProps> = ({
  errorMessage,
  error,
  onRetry,
  onOpenAccountModal,
  currentModelId,
  onSwitchModel,
}) => {
  if (!errorMessage && !error) return null;

  const isQuotaError =
    errorMessage &&
    (errorMessage.toLowerCase().includes("limit") ||
      errorMessage.toLowerCase().includes("quota") ||
      errorMessage.toLowerCase().includes("searches"));

  // Suggest alternate capability mode without exposing raw model IDs
  const suggestedAlternativeMode =
    currentModelId === "BALANCED" ? "FAST" : "BALANCED";

  const handleSwitchAndRetry = () => {
    if (onSwitchModel) {
      onSwitchModel(suggestedAlternativeMode);
    }
    setTimeout(onRetry, 100);
  };

  return (
    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 text-xs text-rose-300 flex items-start gap-3 shadow-lg">
      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="font-bold text-rose-200">Query Failed</div>
        <div className="leading-relaxed">{errorMessage || error?.message}</div>
        {isQuotaError ? (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenAccountModal("plan")}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold flex items-center gap-1.5 transition text-[11px] shadow-sm shadow-orange-950 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" /> View Quota & Upgrade
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onRetry}
              className="px-2.5 py-1.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-100 font-semibold flex items-center gap-1.5 transition text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Retry Query
            </button>
            {onSwitchModel && (
              <button
                type="button"
                onClick={handleSwitchAndRetry}
                className="px-2.5 py-1.5 rounded bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-sky-300 font-semibold flex items-center gap-1.5 transition text-[11px] cursor-pointer"
                title="Switch to alternative model and retry query"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Switch Engine & Retry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
