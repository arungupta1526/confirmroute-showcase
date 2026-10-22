export type AvailabilityType = "AVAILABLE" | "CURR_AVBL" | "RAC" | "WL" | "REGRET" | "UNKNOWN";

export interface ClassAvailability {
  travelClass: string; // "SL", "3A", "3E", "2A", "1A", "CC", "EC", "2S"
  status: string; // display string e.g. "AVL 31", "WL 12", "RAC 5", "Regret"
  availabilityType?: AvailabilityType; // Machine-readable status category
  priority?: number; // 1 = AVL/CURR_AVBL (Confirmed), 2 = RAC (Boarding/Sitting), 3 = WL (Waitlist), 4 = REGRET (Closed)
  seats: number | null; // numeric seat count when confirmed-available, else null
  racCount?: number | null; // numeric RAC count/position when status is RAC (e.g. 7 for "RAC 7"), else null
  fare: number | null; // ticket fare in INR
  confirmStatus: string | null; // ConfirmRoute prediction e.g. "Confirm"
  confirmChance: number | null; // 0-100 probability of confirmation
  quota: string | null;
}

export interface Train {
  trainNumber: string;
  trainName: string;
  fromStnCode: string;
  fromStnName: string;
  toStnCode: string;
  toStnName: string;
  trainOriginCode?: string | null;
  trainOriginName?: string | null;
  trainDestinationCode?: string | null;
  trainDestinationName?: string | null;
  departureTime: string;
  arrivalTime: string;
  duration: string; // minutes as string from API
  durationFormatted: string; // "8h 12m"
  distance: number | null;
  runningDays: string | null;
  hasPantry: boolean;
  trainType: string | null;
  trainRating: number | null;
  hasDeparted?: boolean;
  isTejas?: boolean;
  allowedQuotas?: string[];
  availability: ClassAvailability[];
}

export interface SearchResult {
  source: string;
  destination: string;
  date: string; // DD-MM-YYYY
  quota?: string;
  quotaList?: string[];
  trainCount: number;
  trains: Train[];
  terminalBreakdown?: Record<string, number>;
  originStationsSearched?: string[];
  destStationsSearched?: string[];
  lowestTrainFare?: number;
  sourceCityHasWifi?: boolean;
  destinationCityHasWifi?: boolean;
}

export interface Station {
  stationCode: string;
  stationName: string;
  city: string | null;
  state: string | null;
  isMajor: boolean;
}

export interface ScheduleStation {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: string;
  day: number;
  distance: number;
  expectedPlatformNo?: string | null;
}

export interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  totalDuration: string;
  totalDistance?: number | null;
  hasPantry: boolean;
  daysOfRun: Record<string, boolean>;
  rating?: number | null;
  schedule: ScheduleStation[];
}

export interface CalendarDay {
  date: string;
  state: "Available" | "FillingFast" | "FewSeats" | "Unknown" | string;
}

export interface AvailabilityCalendar {
  source: string;
  destination: string;
  startDate: string;
  days: number;
  availability: CalendarDay[];
}

export interface AlternateOption {
  date: string;
  trainNumber: string;
  trainName: string;
  travelClass: string;
  availability: string;
  fare: number | null;
  confirmChance?: number | null;
  sourceCode: string;
  destinationCode: string;
  description?: string;
}

export interface AlternateResult {
  trainNumber: string;
  source: string;
  destination: string;
  dates: string[];
  alternatesByDate: Record<string, AlternateOption[]>;
}

export interface TrainSearchResult {
  trainNumber: string;
  trainName: string;
  sourceCode?: string;
  sourceName?: string;
  destinationCode?: string;
  destinationName?: string;
  duration?: string;
}

export interface TrainCalendarDayDetails {
  date: string;
  status: string; // e.g. "WL 52", "AVL 15"
  confirmStatus: string | null; // e.g. "Confirm", "Probable"
  confirmChance: number | null; // percentage e.g. 81
  gradient?: string | null;
}

export interface Train2MonthCalendar {
  trainNumber: string;
  trainName?: string;
  source: string;
  destination: string;
  travelClass: string;
  quota: string;
  startDate: string;
  days: Record<string, TrainCalendarDayDetails>;
}

export interface TrainRatings {
  overall?: number | null;
  food?: number | null;
  punctuality?: number | null;
  cleanliness?: number | null;
  ratingCount?: number | null;
  writtenReviewCount?: number | null;
  reviews?: Array<{
    authorLabel: string;
    rating: number;
    text: string;
    updatedAt: string;
  }>;
  baseline?: {
    rating: number;
    tier: string;
  };
}

export interface DetailedScheduleStation extends ScheduleStation {
  intermediateStations?: Array<{
    stationCode: string;
    stationName: string;
    arrivalTime: string;
    departureTime: string;
    day: number;
    distance: string;
  }>;
}

export interface TrainScheduleDetailed extends TrainSchedule {
  coachPosition?: string | null;
  classes?: string[];
  ratings?: TrainRatings;
  schedule: DetailedScheduleStation[];
}

export interface LiveStationStatus {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  arrivalDelay: string | null;
  departureDelay: string | null;
  expectedPlatformNo?: string | null;
  platform?: string | null;
  haltMinutes?: string;
  distance?: string;
  day?: number;
  isHalted?: boolean;
  hasDeparted?: boolean;
  status?: string;
}

export interface LiveRunningStatus {
  trainNumber: string;
  trainName: string;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  date: string;
  currentStationCode?: string | null;
  currentStationName?: string | null;
  upcomingStation?: string;
  delayMinutes?: number | null;
  statusText?: string | null;
  journeyStatus?: "RUNNING" | "COMPLETED" | "NOT_STARTED" | "NOT_RUNNING_TODAY" | "SCHEDULED";
  doesRunToday?: boolean;
  runsOnDays?: string[];
  daysOfRun?: Record<string, boolean>;
  ratings?: TrainRatings;
  schedule: LiveStationStatus[];
  liveTelemetry?: {
    lat: number;
    lon: number;
    speed: number;
    power?: string;
    locoKind?: string;
    heading?: number | null;
    gpsTime?: string;
  } | null;
  congestion?: {
    stationCode?: string;
    stationName?: string;
    crossingTrains: Array<{
      trainNo: string;
      trainName: string;
      actualTime: string;
      blockSection: string;
      section?: string;
    }>;
    aheadTrains: Array<{
      trainNo: string;
      trainName: string;
      actualTime: string;
      blockSection: string;
      section?: string;
    }>;
    behindTrains: Array<{
      trainNo: string;
      trainName: string;
      actualTime: string;
      blockSection: string;
      section?: string;
    }>;
  } | null;
}

export interface ConnectingTrainLeg {
  trainNumber: string;
  trainName: string;
  fromStnCode: string;
  fromStnName?: string;
  toStnCode: string;
  toStnName?: string;
  departureTime: string;
  arrivalTime: string;
  durationFormatted: string;
  distance?: number | null;
  availability: ClassAvailability[];
}

export interface ConnectingTrainOption {
  hubStationCode: string;
  hubStationName?: string;
  tier?: "CONFIRMED_SEATS" | "MIX_OR_GENERAL" | "WAITING_LIST";
  hasConfirmedSeats?: boolean;
  isSameTrain?: boolean;
  haltMinutes?: number;
  interchangeType?: "SAME_TRAIN" | "SAME_STATION" | "CROSS_STATION";
  crossStationTransfer?: {
    arrivalStation: string;
    departureStation: string;
    transferNote?: string;
  };
  leg1: ConnectingTrainLeg;
  leg2: ConnectingTrainLeg;
  layoverMinutes: number;
  layoverFormatted: string;
  totalDurationMinutes?: number;
  totalDurationFormatted?: string;
  totalDistance?: number | null;
}

export interface ConnectingTrainsResult {
  source: string;
  destination: string;
  date: string;
  hubsSearched: string[];
  connectionCount: number;
  confirmedCount?: number;
  generalMixCount?: number;
  lastMileAddon?: {
    branchCode: string;
    branchName: string;
    railheadCode: string;
    railheadName: string;
    distanceKm: number;
    shuttles: Array<{
      trainNumber: string;
      trainName: string;
      scheduleInfo: string;
      ticketType: string;
    }>;
    roadAlternative: string;
  } | null;
  connections: ConnectingTrainOption[];
}

export interface PnrPassengerStatus {
  number: number;
  bookingStatus: string;
  currentStatus: string;
  coach: string | null;
  berth: number | string | null;
  berthCode?: string | null;
  confirmationStatus?: string | null;
  prediction?: string | null;
}

export interface PnrStatusResult {
  pnr: string;
  trainNumber: string;
  trainName: string;
  doj: string;
  bookingDate: string;
  quota: string;
  travelClass: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  boardingStationCode: string;
  boardingStationName: string;
  reservationUptoCode: string;
  reservationUptoName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance?: string | number | null;
  expectedPlatformNo: string | null;
  chartPrepared: boolean;
  bookingFare: string | number | null;
  ticketFare: string | number | null;
  passengerCount: number;
  passengers: PnrPassengerStatus[];
  coachPosition?: string | null;
  ratings?: TrainRatings;
  hasPantry?: boolean;
  informationMessage?: string | null;
  ctProResponse?: any | null;
  cacheTime?: string;
  error?: string | null;
  errorCode?: number | null;
}

export interface BoardingDepartureStatus {
  hasDeparted: boolean;
  scheduledDepartureTime: string;
  scheduledDepartureDate: string;
  timeDiffText: string;
  lastPassedStationCode?: string;
  lastPassedStationName?: string;
  nextUpcomingStationCode?: string;
  nextUpcomingStationName?: string;
  nextUpcomingArrivalTime?: string;
}

export interface VacantBerthItem {
  coachName: string;
  cabinCoupe?: string | null;
  cabinCoupeNo?: string | null;
  berthCode?: string | null;
  berthNumber: number;
  from: string;
  to: string;
  fromStationName?: string;
  toStationName?: string;
  classCode: string;
  splitNo?: number;
  isAvailableAtBoarding?: boolean;
  isDownstream?: boolean;
  isExpiredBeforeBoarding?: boolean;
}

export interface VacantChartBerthsResult {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  boardingStation: string;
  trainStartDate: string;
  chartOneDate: string | null;
  chartTwoDate?: string | null;
  isChartPrepared: boolean;
  totalVacantBerths: number;
  classSummary: Record<string, number>;
  coaches: Array<{
    coachName: string;
    classCode: string;
    vacantBerths: number;
  }>;
  vacantBerths: VacantBerthItem[];
  isTestFixture?: boolean;
  fallbackReason?: string;
  remoteStation?: string | null;
  remoteStationName?: string | null;
  nextRemoteStation?: string | null;
  nextRemoteStationName?: string | null;
  remoteLocationChartDate?: string | null;
  destinationStation?: string | null;
  departureStatus?: BoardingDepartureStatus | null;
  stationNames?: Record<string, string>;
}

export interface StationInfoDetails {
  code: string;
  name: string;
  hindiName?: string;
  division?: string;
  zone?: string;
  category?: string;
  platforms?: number;
  elevationM?: number;
  speedMax?: number;
  address?: string;
  phone?: string;
  lat?: number;
  lon?: number;
  photoUrl?: string;
  galleryPhotoUrl?: string;
  stationUrl?: string;
}

export interface StationLiveBoardItem {
  trainNumber: string;
  trainName: string;
  type: "DEPARTURE" | "ARRIVAL";
  scheduledTime: string;
  expectedTime: string;
  delayMinutes: number;
  expectedPlatform: string;
  destination: string;
  source: string;
  status: string;
}

export interface StationLiveBoardResult {
  stationCode: string;
  stationName: string;
  queryTimeIst: string;
  windowHours: number;
  totalTrains: number;
  trains: StationLiveBoardItem[];
}

export interface TatkalAdvisorResult {
  trainNumber: string;
  journeyDate: string;
  travelClass: string;
  fromStation?: string;
  toStation?: string;
  bookingWindow: {
    bookingDate: string;
    bookingTime: string;
    bookingOpenIso: string;
    isAcClass: boolean;
    isWindowOpen: boolean;
    hoursRemaining: number;
  };
  preparationChecklist: {
    masterListWarning: string;
    lockoutWindow: string;
    recommendedPayment: {
      primary: string;
      reason: string;
      secondary: string;
    };
    bookingTips: string[];
  };
  rulesAndRefundPolicy: {
    confirmedRefund: string;
    waitlistRefund: string;
    railwayDelayRefund: string;
    criticalSetting: string;
  };
  fallbackStrategies: Array<{
    title: string;
    description: string;
    actionPrompt: string;
  }>;
}
