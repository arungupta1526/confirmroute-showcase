/**
 * Share Route Helper for WhatsApp & Clipboard Sharing
 * Formats structured train itineraries, connecting journeys, and availability cards
 * into clean, readable text with emoji accents.
 */

import { SITE_URL, WHATSAPP_SHARE_URL } from "../config/urls.config.js";
export interface ShareTrainDetails {
  trainNumber?: string;
  trainName?: string;
  fromStation: string;
  toStation: string;
  date?: string;
  travelClass?: string;
  status?: string;
  confirmationChance?: string | number;
  fare?: number;
  departureTime?: string;
  arrivalTime?: string;
  totalDuration?: string;
  totalDistance?: number;
  combinedFareSummary?: string;
  connectingLegs?: Array<{
    trainNumber: string;
    trainName?: string;
    fromStation: string;
    toStation: string;
    travelClass?: string;
    status?: string;
    fare?: number | null;
    seatOptions?: string;
    layoverDuration?: string;
  }>;
}

export function formatTrainShareMessage(details: ShareTrainDetails): string {
  const lines: string[] = [];

  lines.push("🚆 *ConfirmRoute Journey Summary*");
  lines.push("━━━━━━━━━━━━━━━━━━━━");

  if (details.connectingLegs && details.connectingLegs.length > 0) {
    // 2-Leg connecting train route
    lines.push(`📍 *Route:* ${details.fromStation} ➔ ${details.toStation}`);
    if (details.date) lines.push(`📅 *Date:* ${details.date}`);
    lines.push("");
    lines.push("🔄 *Connecting Journey (2 Legs):*");

    details.connectingLegs.forEach((leg, idx) => {
      lines.push(
        `• *Leg ${idx + 1}:* Train #${leg.trainNumber}${leg.trainName ? ` (${leg.trainName})` : ""}`
      );
      lines.push(`  ${leg.fromStation} ➔ ${leg.toStation}`);
      if (leg.seatOptions) {
        lines.push(`  Seats: ${leg.seatOptions}`);
      } else if (leg.travelClass || leg.status) {
        const fareStr = leg.fare != null ? ` (₹${leg.fare})` : "";
        lines.push(`  Class: ${leg.travelClass || "N/A"} | Status: ${leg.status || "Check Live"}${fareStr}`);
      }
      if (leg.layoverDuration && idx === 0) {
        lines.push(`  ⏳ *Layover:* ${leg.layoverDuration}`);
      }
    });

    if (details.combinedFareSummary) {
      lines.push("");
      lines.push(`💰 *Est. Total Fare:* ${details.combinedFareSummary}`);
    }
    if (details.totalDuration) {
      const distStr = details.totalDistance ? ` · ${details.totalDistance} km` : "";
      lines.push(`⏱ *Total Duration:* ${details.totalDuration}${distStr}`);
    }
  } else {
    // Direct train
    const title = details.trainName
      ? `${details.trainName} (#${details.trainNumber})`
      : details.trainNumber
      ? `Train #${details.trainNumber}`
      : "Train Service";

    lines.push(`🚄 *${title}*`);
    lines.push(`📍 ${details.fromStation} ➔ ${details.toStation}`);
    if (details.date) lines.push(`📅 *Date:* ${details.date}`);
    if (details.departureTime && details.arrivalTime) {
      lines.push(`⏰ ${details.departureTime} ➔ ${details.arrivalTime}`);
    }
    if (details.travelClass) lines.push(`💺 *Class:* ${details.travelClass}`);
    if (details.status) lines.push(`🎫 *Status:* ${details.status}`);
    if (details.confirmationChance) {
      lines.push(`📈 *Confirmation Chance:* ${details.confirmationChance}%`);
    }
    if (details.fare) lines.push(`💰 *Fare:* ₹${details.fare}`);
  }

  lines.push("");
  lines.push("⚡ Smart Railway Intelligence via ConfirmRoute");
  lines.push(SITE_URL);

  return lines.join("\n");
}

export interface ShareTrainListItem {
  trainNumber: string;
  trainName: string;
  departureTime?: string;
  arrivalTime?: string;
  fromStation?: string;
  toStation?: string;
  duration?: string;
  availability?: Array<{
    travelClass: string;
    status: string;
    fare?: number | null;
  }>;
}

export interface ShareTrainListDetails {
  fromStation: string;
  toStation: string;
  date?: string;
  trainCount?: number;
  trains: ShareTrainListItem[];
}

export const CLASS_HIERARCHY_ORDER: Record<string, number> = {
  "2S": 1,
  SL: 2,
  "3E": 3,
  "3A": 4,
  "2A": 5,
  "1A": 6,
  CC: 7,
  EC: 8,
  EA: 9,
  FC: 10,
};

export function sortAvailabilityByClassHierarchy<T extends { travelClass?: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const pA = CLASS_HIERARCHY_ORDER[a.travelClass?.toUpperCase() || ""] ?? 99;
    const pB = CLASS_HIERARCHY_ORDER[b.travelClass?.toUpperCase() || ""] ?? 99;
    return pA - pB;
  });
}

export function formatTrainListShareMessage(details: ShareTrainListDetails): string {
  const lines: string[] = [];

  lines.push("🚆 *ConfirmRoute Train Search*");
  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push(`📍 *Route:* ${details.fromStation} ➔ ${details.toStation}`);
  if (details.date) lines.push(`📅 *Date:* ${details.date}`);
  const total = details.trainCount ?? details.trains.length;
  lines.push(`📊 *Total Trains Found:* ${total}`);
  lines.push("");

  const topTrains = details.trains.slice(0, 5);
  topTrains.forEach((train, idx) => {
    lines.push(`${idx + 1}. *${train.trainName} (#${train.trainNumber})*`);
    const fromText = train.fromStation ? ` (${train.fromStation})` : "";
    const toText = train.toStation ? ` (${train.toStation})` : "";
    const durText = train.duration ? ` | ${train.duration}` : "";
    lines.push(`   ⏰ ${train.departureTime || "--:--"}${fromText} ➔ ${train.arrivalTime || "--:--"}${toText}${durText}`);

    if (Array.isArray(train.availability) && train.availability.length > 0) {
      // Sort classes in standard passenger hierarchy: SL > 3E > 3A > 2A > 1A > CC > EC > 2S
      const sortedAvail = sortAvailabilityByClassHierarchy(train.availability);
      const availText = sortedAvail
        .map((a) => `${a.travelClass}: ${a.fare ? `₹${a.fare} ` : ""}(${a.status})`)
        .join(" • ");
      lines.push(`   💺 ${availText}`);
    }
    lines.push("");
  });

  if (total > topTrains.length) {
    lines.push(`_...and ${total - topTrains.length} more trains available_`);
    lines.push("");
  }

  lines.push("⚡ Check live availability on ConfirmRoute:");
  lines.push(SITE_URL);

  return lines.join("\n");
}

export function openWhatsAppShare(text: string): void {
  // Auto-copy full text to clipboard as safety buffer (useful for desktop apps that only grab URLs)
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  const url = `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(text)}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export async function copyShareText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
