export type BerthStatus = "available" | "rac" | "booked";

export interface Berth {
  num: string;
  status: BerthStatus;
}

export interface CoachData {
  type: string;
  availableCount: number;
  berths: Berth[];
}

export const COACH_LIST = ["B1", "B2", "B3", "S1", "S2", "S3"] as const;

export const COACH_BERTHS_MAP: Record<string, CoachData> = {
  B1: {
    type: "3A (AC 3-Tier)",
    availableCount: 4,
    berths: [
      { num: "1 LB", status: "available" },
      { num: "2 MB", status: "booked" },
      { num: "3 UB", status: "available" },
      { num: "4 LB", status: "rac" },
      { num: "5 MB", status: "booked" },
      { num: "6 UB", status: "available" },
      { num: "7 SL", status: "available" },
      { num: "8 SU", status: "booked" },
    ],
  },
  B2: {
    type: "3A (AC 3-Tier)",
    availableCount: 6,
    berths: [
      { num: "1 LB", status: "available" },
      { num: "2 MB", status: "available" },
      { num: "3 UB", status: "available" },
      { num: "4 LB", status: "available" },
      { num: "5 MB", status: "booked" },
      { num: "6 UB", status: "available" },
      { num: "7 SL", status: "booked" },
      { num: "8 SU", status: "available" },
    ],
  },
  B3: {
    type: "3A (AC 3-Tier)",
    availableCount: 2,
    berths: [
      { num: "1 LB", status: "booked" },
      { num: "2 MB", status: "booked" },
      { num: "3 UB", status: "available" },
      { num: "4 LB", status: "rac" },
      { num: "5 MB", status: "booked" },
      { num: "6 UB", status: "booked" },
      { num: "7 SL", status: "booked" },
      { num: "8 SU", status: "available" },
    ],
  },
  S1: {
    type: "SL (Sleeper)",
    availableCount: 5,
    berths: [
      { num: "1 LB", status: "available" },
      { num: "2 MB", status: "booked" },
      { num: "3 UB", status: "available" },
      { num: "4 LB", status: "available" },
      { num: "5 MB", status: "available" },
      { num: "6 UB", status: "booked" },
      { num: "7 SL", status: "rac" },
      { num: "8 SU", status: "available" },
    ],
  },
  S2: {
    type: "SL (Sleeper)",
    availableCount: 1,
    berths: [
      { num: "1 LB", status: "booked" },
      { num: "2 MB", status: "booked" },
      { num: "3 UB", status: "booked" },
      { num: "4 LB", status: "rac" },
      { num: "5 MB", status: "booked" },
      { num: "6 UB", status: "available" },
      { num: "7 SL", status: "rac" },
      { num: "8 SU", status: "booked" },
    ],
  },
  S3: {
    type: "SL (Sleeper)",
    availableCount: 7,
    berths: [
      { num: "1 LB", status: "available" },
      { num: "2 MB", status: "available" },
      { num: "3 UB", status: "available" },
      { num: "4 LB", status: "booked" },
      { num: "5 MB", status: "available" },
      { num: "6 UB", status: "available" },
      { num: "7 SL", status: "available" },
      { num: "8 SU", status: "available" },
    ],
  },
};
