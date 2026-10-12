import React, { useState } from "react";
import { Sparkles, Trash2, AlertCircle, ArrowRight } from "lucide-react";
import { getMaxSavedRoutes } from "@/src/config/plans.config";
import { useSavedRoutes } from "@/src/hooks/useSavedRoutes";

export interface SavedJourney {
  id: string;
  origin: string;
  destination: string;
  travel_class?: string;
  created_at: string;
}

interface SavedRoutesTabProps {
  accessToken?: string;
  journeys: SavedJourney[];
  isLoadingJourneys: boolean;
  onRefreshJourneys: () => void;
  onSelectJourney?: (journey: { origin: string; destination: string; travelClass?: string }) => void;
  onOpenAccountModal?: () => void;
  onClose: () => void;
  planId?: string | null;
}

export const SavedRoutesTab: React.FC<SavedRoutesTabProps> = ({
  accessToken,
  journeys,
  isLoadingJourneys,
  onRefreshJourneys,
  onSelectJourney,
  onOpenAccountModal,
  onClose,
  planId,
}) => {
  const { saveRoute, deleteRoute } = useSavedRoutes(accessToken);
  const [newOrigin, setNewOrigin] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newClass, setNewClass] = useState("3A");
  const [isAddingJourney, setIsAddingJourney] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const maxAllowed = getMaxSavedRoutes(planId);
  const isUnlimited = maxAllowed === -1 || maxAllowed === Number.POSITIVE_INFINITY || maxAllowed >= 9999;
  const isLimitReached = !isUnlimited && journeys.length >= maxAllowed;

  const handleAddJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim() || !newDest.trim() || !accessToken) return;
    if (isLimitReached) {
      setSaveError(`Limit reached (${journeys.length}/${maxAllowed}). Upgrade your plan to save more routes.`);
      return;
    }
    setIsAddingJourney(true);
    setSaveError(null);
    try {
      const res = await saveRoute(newOrigin, newDest, newClass);
      if (res.success) {
        setNewOrigin("");
        setNewDest("");
        onRefreshJourneys();
      } else {
        setSaveError(res.error || "Failed to save route");
      }
    } catch (err: any) {
      console.error("Failed to add journey:", err);
      setSaveError("Network error while saving journey");
    } finally {
      setIsAddingJourney(false);
    }
  };

  const handleDeleteJourney = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accessToken) return;
    try {
      const success = await deleteRoute(id);
      if (success) {
        onRefreshJourneys();
      }
    } catch (err) {
      console.error("Failed to delete journey:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      {!accessToken ? (
        <div className="py-8 text-center text-slate-400 text-xs px-3 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-orange-400/80" />
          <p className="font-semibold text-slate-200">Save Your Favorite Train Routes</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Sign in to save repeat routes (e.g., Delhi ➔ Varanasi in 3A) for 1-click availability monitoring!
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAccountModal?.();
            }}
            className="py-2 px-3.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-md transition cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      ) : (
        <>
          {/* Add Journey Form */}
          <form onSubmit={handleAddJourney} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-300">Add Route Preference</p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-700">
                {journeys.length} / {isUnlimited ? "∞" : maxAllowed} saved
              </span>
            </div>

            {saveError && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{saveError}</span>
                  {isLimitReached && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAccountModal?.();
                      }}
                      className="mt-1 text-orange-400 hover:text-orange-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Upgrade Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Origin (NDLS)"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value.toUpperCase())}
                maxLength={5}
                disabled={isLimitReached}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-100 focus:outline-hidden focus:border-orange-500 font-mono disabled:opacity-50"
                required
              />
              <input
                type="text"
                placeholder="Dest (CNB)"
                value={newDest}
                onChange={(e) => setNewDest(e.target.value.toUpperCase())}
                maxLength={5}
                disabled={isLimitReached}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-100 focus:outline-hidden focus:border-orange-500 font-mono disabled:opacity-50"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                disabled={isLimitReached}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-hidden focus:border-orange-500 font-mono disabled:opacity-50"
              >
                <option value="3A">3A (3rd AC)</option>
                <option value="2A">2A (2nd AC)</option>
                <option value="SL">SL (Sleeper)</option>
                <option value="1A">1A (1st AC)</option>
                <option value="CC">CC (Chair Car)</option>
              </select>
              <button
                type="submit"
                disabled={isAddingJourney || isLimitReached}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
              >
                {isAddingJourney ? "Saving..." : isLimitReached ? "Limit Reached" : "+ Save Route"}
              </button>
            </div>
          </form>

          {/* Journeys List */}
          <div className="space-y-2">
            {isLoadingJourneys ? (
              <p className="text-center text-xs text-slate-500 py-6">Loading saved journeys...</p>
            ) : journeys.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-1">
                <p>No saved journeys yet.</p>
                <p className="text-[10px] text-slate-600">Save frequent routes above for instant search!</p>
              </div>
            ) : (
              journeys.map((j) => (
                <div
                  key={j.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectJourney?.({
                      origin: j.origin,
                      destination: j.destination,
                      travelClass: j.travel_class,
                    });
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectJourney?.({
                        origin: j.origin,
                        destination: j.destination,
                        travelClass: j.travel_class,
                      });
                      onClose();
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-orange-500/50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-slate-100">
                      <span>{j.origin}</span>
                      <span className="text-orange-400">➔</span>
                      <span>{j.destination}</span>
                    </div>
                    {j.travel_class && (
                      <span className="inline-block mt-1 px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Class: {j.travel_class}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteJourney(j.id, e)}
                    aria-label="Delete saved journey"
                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
