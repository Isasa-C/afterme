export type ActivityKey = "gym" | "focus" | "outside" | "social" | "custom";
export type ActivityColorKey = "green" | "orange" | "blue" | "pink" | "yellow";
export type CommitmentStatus = "active" | "completed" | "abandoned";
export type ReflectionOutcome = "better" | "same" | "worse";
export type ItemIconKey =
  | "droplet"
  | "headphones"
  | "shirt"
  | "footprints"
  | "key"
  | "door"
  | "cloud-sun"
  | "user"
  | "message-circle"
  | "pencil"
  | "send"
  | "x-square"
  | "smartphone"
  | "file-text"
  | "play";
export type ActivityItemPriority = "must" | "optional";

export type Activity = {
  id: string;
  user_id: string;
  key: ActivityKey;
  name: string;
  icon: ActivityKey;
  icon_key: string;
  color: string;
  color_key: ActivityColorKey;
  default_duration_min: number;
  minimum_minutes: number;
  benefits: string[];
  is_default: boolean;
  is_archived: boolean;
  archived_at: string | null;
  sort_order: number;
  created_at: string;
};

export type Commitment = {
  id: string;
  user_id: string;
  activity_id: string;
  duration_minutes: number;
  minimum_minutes: number;
  started_at: string;
  packing_started_at: string | null;
  gone_at: string | null;
  completed_at: string | null;
  status: CommitmentStatus;
};

export type ActivityItem = {
  id: string;
  user_id: string;
  activity_id: string;
  label: string;
  icon_key: ItemIconKey;
  priority: ActivityItemPriority;
  hint: string | null;
  sort_order: number;
  is_door_step: boolean;
  created_at: string;
};

export type Reflection = {
  id: string;
  commitment_id: string;
  outcome: ReflectionOutcome;
  feeling_score: number | null;
  note: string | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio_line: string;
  reminder_time: string;
  reminders_enabled: boolean;
  dark_mode: boolean;
  created_at: string;
};

export type RecentEntry = Commitment & {
  activity: Activity;
  reflection: Reflection | null;
};

export type OverallStats = {
  totalCommitments: number;
  feltBetterPct: number;
  feltSamePct: number;
  feltWorsePct: number;
  betterCount: number;
  sameCount: number;
  worseCount: number;
  reflectedCount: number;
  totalTimeMin: number;
  avgFeeling: number | null;
  completedThisWeek: number;
  targetThisWeek: number;
  activitiesTried: number;
};

export type ActivityStats = {
  activityId: string;
  name: string;
  key: ActivityKey;
  color: string;
  count: number;
  betterCount: number;
  reflectedCount: number;
  feltBetterPct: number;
};

export type MonthHistoryCommitment = {
  id: string;
  activityId: string;
  activityName: string;
  startedAt: string;
  durationMin: number;
  reflection: {
    outcome: ReflectionOutcome | null;
    note: string | null;
  } | null;
};

export type MonthHistoryDay = {
  date: string;
  commitments: MonthHistoryCommitment[];
};

export type MonthHistory = {
  days: MonthHistoryDay[];
  summary: {
    showedUpDays: number;
    daysElapsed: number;
  };
  previousMonthWithActivity: { year: number; month: number } | null;
};
