"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Code2, TrainFront } from "lucide-react";
import { ToolNoticeCard } from "./ToolNoticeCard";
import { normalizeToolInvocation } from "@/src/lib/chat-storage";

const WidgetCardSkeleton = () => (
  <div className="my-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="h-4 w-36 bg-slate-800 rounded" />
      <div className="h-3 w-20 bg-slate-800 rounded" />
    </div>
    <div className="h-24 bg-slate-800/50 rounded-xl" />
  </div>
);

const TrainListCard = dynamic(
  () => import("../widgets/TrainListCard").then((mod) => mod.TrainListCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const SeatAvailabilityCard = dynamic(
  () => import("../widgets/SeatAvailabilityCard").then((mod) => mod.SeatAvailabilityCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const LiveRunningStatusCard = dynamic(
  () => import("../widgets/LiveRunningStatusCard").then((mod) => mod.LiveRunningStatusCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const ConnectingTrainsCard = dynamic(
  () => import("../widgets/ConnectingTrainsCard").then((mod) => mod.ConnectingTrainsCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const AvailabilityCalendarCard = dynamic(
  () => import("../widgets/AvailabilityCalendarCard").then((mod) => mod.AvailabilityCalendarCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TrainScheduleCard = dynamic(
  () => import("../widgets/TrainScheduleCard").then((mod) => mod.TrainScheduleCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const AlternateTrainsCard = dynamic(
  () => import("../widgets/AlternateTrainsCard").then((mod) => mod.AlternateTrainsCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const Train2MonthCalendarCard = dynamic(
  () => import("../widgets/Train2MonthCalendarCard").then((mod) => mod.Train2MonthCalendarCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const PnrStatusCard = dynamic(
  () => import("../widgets/PnrStatusCard").then((mod) => mod.PnrStatusCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const CoachPositionCard = dynamic(
  () => import("../widgets/CoachPositionCard").then((mod) => mod.CoachPositionCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TrainRatingsCard = dynamic(
  () => import("../widgets/TrainRatingsCard").then((mod) => mod.TrainRatingsCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const FareComparisonCard = dynamic(
  () => import("../widgets/FareComparisonCard").then((mod) => mod.FareComparisonCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const PantryAmenitiesCard = dynamic(
  () => import("../widgets/PantryAmenitiesCard").then((mod) => mod.PantryAmenitiesCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TatkalAdvisorCard = dynamic(
  () => import("../widgets/TatkalAdvisorCard").then((mod) => mod.TatkalAdvisorCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const LiveStationBoardCard = dynamic(
  () => import("../widgets/LiveStationBoardCard").then((mod) => mod.LiveStationBoardCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const VacantBerthCard = dynamic(
  () => import("../widgets/VacantBerthCard").then((mod) => mod.VacantBerthCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TrainLeaderboardsCard = dynamic(
  () => import("../widgets/TrainLeaderboardsCard").then((mod) => mod.TrainLeaderboardsCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TrainImageCard = dynamic(
  () => import("../widgets/TrainImageCard").then((mod) => mod.TrainImageCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const StationInfoCard = dynamic(
  () => import("../widgets/StationInfoCard").then((mod) => mod.StationInfoCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TrainEncountersCard = dynamic(
  () => import("../widgets/TrainEncountersCard").then((mod) => mod.TrainEncountersCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const StationStoppageCard = dynamic(
  () => import("../widgets/StationStoppageCard").then((mod) => mod.StationStoppageCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const TrainSearchResultsCard = dynamic(
  () => import("../widgets/TrainSearchResultsCard").then((mod) => mod.TrainSearchResultsCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);
const FastestTrainCard = dynamic(
  () => import("../widgets/FastestTrainCard").then((mod) => mod.FastestTrainCard),
  { ssr: false, loading: () => <WidgetCardSkeleton /> }
);


interface MessageToolWidgetProps {
  toolInvocation: any;
}

class WidgetErrorBoundary extends React.Component<
  { toolName: string; children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { toolName: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[WidgetErrorBoundary] Failed to render widget for ${this.props.toolName}:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-xl my-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-200">
              Interactive card unavailable for {this.props.toolName}
            </div>
            <div className="text-amber-400/80 mt-0.5 text-[11px]">
              Unable to render visual card due to unexpected payload format. All details remain visible in the response text.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Dynamically renders the appropriate interactive domain widget card
 * for a completed tool invocation.
 */
export const MessageToolWidget = React.memo(function MessageToolWidget({
  toolInvocation: rawToolInvocation,
}: MessageToolWidgetProps) {
  const toolInvocation = normalizeToolInvocation(rawToolInvocation);
  if (!toolInvocation) return null;

  if (toolInvocation.state !== "result") {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-900/40 border border-slate-800 rounded-xl my-2 text-xs text-slate-400">
        <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        <span>Executing {toolInvocation.toolName || "railway query"}...</span>
      </div>
    );
  }

  const { toolName, result } = toolInvocation;
  if (!result) return null;

  // Gracefully fallback to conversational markdown if payload was truncated in storage
  if (result._truncated && !result.trains && !result.source && !result.status && !result.pnr && !result.trainNumber) {
    return null;
  }

  // Delegate all blocked plan gates, quota caps, and tool execution notices to ToolNoticeCard
  if (result.__cap_blocked || result.error) {
    return <ToolNoticeCard toolName={toolName} result={result} />;
  }

  const renderWidgetContent = () => {
    switch (toolName) {
      case "search_trains":
      case "find_nearby_terminal_trains":
      case "filter_trains_by_time_window":
        return <TrainListCard data={result} />;
      case "get_seat_availability":
        return <SeatAvailabilityCard data={result} />;
      case "get_live_running_status":
        return <LiveRunningStatusCard data={result} />;
      case "get_connecting_trains":
        return <ConnectingTrainsCard data={result} />;
      case "get_availability_calendar":
        return <AvailabilityCalendarCard data={result} />;
      case "get_train_schedule":
        return <TrainScheduleCard data={result} />;
      case "get_alternate_trains":
        return <AlternateTrainsCard data={result} />;
      case "get_train_availability_calendar":
        return <Train2MonthCalendarCard data={result} />;
      case "get_pnr_status":
      case "getPnrStatus":
        return <PnrStatusCard data={result} />;
      case "get_coach_position":
        return <CoachPositionCard data={result} />;
      case "get_train_ratings":
        return <TrainRatingsCard data={result} />;
      case "compare_train_fares":
        return <FareComparisonCard data={result} />;
      case "get_fastest_train":
        return <FastestTrainCard data={result} />;
      case "get_pantry_and_amenities":
        return <PantryAmenitiesCard data={result} />;
      case "get_tatkal_advisor":
        return <TatkalAdvisorCard data={result} />;
      case "get_station_live_board":
        return <LiveStationBoardCard data={result} />;
      case "get_vacant_chart_berths":
        return <VacantBerthCard data={result} />;
      case "get_train_leaderboards":
        return <TrainLeaderboardsCard data={result} />;
      case "get_train_image":
        return <TrainImageCard data={result} />;
      case "get_train_encounters":
        return <TrainEncountersCard data={result} />;
      case "find_station_code":
        return result.stationInfo || result.resolved ? <StationInfoCard data={result} /> : null;
      case "check_station_stoppage":
        return <StationStoppageCard data={result} />;
      case "find_train_by_name":
        return <TrainSearchResultsCard data={result} />;
      default:
        return null;
    }
  };

  const content = renderWidgetContent();
  if (!content) return null;

  return <WidgetErrorBoundary toolName={toolName}>{content}</WidgetErrorBoundary>;
});
