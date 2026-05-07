import { activities, activityItems, commitments, demoUserId, profile, reflections } from "../mockData";
import { getAuthUser } from "../auth";
import type { Activity, ActivityColorKey, ActivityItem, Commitment, MonthHistory, Reflection, ReflectionOutcome } from "../types";

let activityRows = [...activities];
let activityItemRows = [...activityItems];
let commitmentRows = [...commitments];
let reflectionRows = [...reflections];
let profileRow = { ...profile };

type MockState = {
  activityRows: Activity[];
  activityItemRows: ActivityItem[];
  commitmentRows: Commitment[];
  reflectionRows: Reflection[];
  profileRow: typeof profile;
};

const stateByUser = new Map<string, MockState>();
let activeStateUserId = demoUserId;

function storageKey(userId: string) {
  return `afterme.mock.${userId}`;
}

function currentUserMeta() {
  const user = getAuthUser();
  return {
    id: user?.id ?? demoUserId,
    email: user?.email,
  };
}

function cloneSeedForUser(userId: string, email?: string): MockState {
  const name = email ? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : profile.display_name;
  return {
    activityRows: activities.map((activity) => ({ ...activity, user_id: userId })),
    activityItemRows: activityItems.map((item) => ({ ...item, user_id: userId })),
    commitmentRows: commitments.map((commitment) => ({ ...commitment, user_id: userId })),
    reflectionRows: reflections.map((reflection) => ({ ...reflection })),
    profileRow: {
      ...profile,
      id: userId,
      display_name: name || profile.display_name,
      bio_line: email ? "A gentle push out the door." : profile.bio_line,
    },
  };
}

function currentState(): MockState {
  return { activityRows, activityItemRows, commitmentRows, reflectionRows, profileRow };
}

function applyState(state: MockState) {
  activityRows = state.activityRows;
  activityItemRows = state.activityItemRows;
  commitmentRows = state.commitmentRows;
  reflectionRows = state.reflectionRows;
  profileRow = state.profileRow;
}

function saveActiveState() {
  const state = currentState();
  stateByUser.set(activeStateUserId, state);
  try {
    window.localStorage.setItem(storageKey(activeStateUserId), JSON.stringify(state));
  } catch {
    // In-memory state is enough when storage is unavailable.
  }
}

function loadStoredState(userId: string): MockState | null {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as MockState) : null;
  } catch {
    return null;
  }
}

function syncActiveUserState() {
  const user = currentUserMeta();
  if (user.id === activeStateUserId) return;
  saveActiveState();
  const nextState = stateByUser.get(user.id) ?? loadStoredState(user.id) ?? cloneSeedForUser(user.id, user.email);
  activeStateUserId = user.id;
  applyState(nextState);
}

const delay = async () =>
  new Promise((resolve) => setTimeout(resolve, 120)).then(() => {
    syncActiveUserState();
  });
const id = () => crypto.randomUUID();

const colorByKey: Record<ActivityColorKey, string> = {
  green: "#22C55E",
  orange: "#F59E0B",
  blue: "#6D3DF2",
  pink: "#EC4899",
  yellow: "#EAB308",
};

export async function listActivities(options?: { includeArchived?: boolean }) {
  await delay();
  return activityRows
    .filter((activity) => options?.includeArchived || (!activity.is_archived && !activity.archived_at))
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function listArchivedActivities() {
  await delay();
  return activityRows
    .filter((activity) => activity.is_archived || activity.archived_at)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function createActivity(payload: {
  name: string;
  iconKey?: string;
  colorKey?: ActivityColorKey;
  defaultDurationMin?: number;
  minimumMinutes?: number;
}) {
  await delay();
  const colorKey = payload.colorKey ?? "blue";
  const nextOrder = Math.max(0, ...activityRows.filter((activity) => !activity.archived_at).map((activity) => activity.sort_order)) + 1;
  const row: Activity = {
    id: id(),
    user_id: activeStateUserId,
    key: "custom",
    name: payload.name,
    icon: "custom",
    icon_key: payload.iconKey ?? "sparkles",
    color: colorByKey[colorKey],
    color_key: colorKey,
    default_duration_min: payload.defaultDurationMin ?? 10,
    minimum_minutes: payload.minimumMinutes ?? 10,
    benefits: ["Proud that you showed up", "A little more momentum"],
    is_default: false,
    is_archived: false,
    archived_at: null,
    sort_order: nextOrder,
    created_at: new Date().toISOString(),
  };
  activityRows.push(row);
  // Soft starts matter: the seed list is intentionally minimal; richer setup lives in the activity editor.
  const starterItems: Array<Pick<ActivityItem, "label" | "icon_key" | "priority" | "hint">> = [
    { label: "keys + phone", icon_key: "key", priority: "must", hint: "in your pocket" },
    { label: payload.name, icon_key: "play", priority: "must", hint: "the first step" },
    { label: "water bottle", icon_key: "droplet", priority: "optional", hint: "if helpful" },
    { label: "headphones", icon_key: "headphones", priority: "optional", hint: "if helpful" },
  ];
  activityItemRows.push(
    ...starterItems.map((item, index) => ({
      id: id(),
      user_id: activeStateUserId,
      activity_id: row.id,
      label: item.label,
      icon_key: item.icon_key,
      priority: item.priority,
      hint: item.hint,
      sort_order: index + 1,
      is_door_step: false,
      created_at: new Date().toISOString(),
    })),
  );
  saveActiveState();
  return row;
}

export async function archiveActivity(activityId: string) {
  await delay();
  const archivedAt = new Date().toISOString();
  activityRows = activityRows.map((activity) =>
    activity.id === activityId ? { ...activity, is_archived: true, archived_at: archivedAt } : activity,
  );
  saveActiveState();
  return activityRows.find((activity) => activity.id === activityId)!;
}

export async function restoreActivity(activityId: string) {
  await delay();
  const nextOrder = Math.max(0, ...activityRows.filter((activity) => !activity.archived_at).map((activity) => activity.sort_order)) + 1;
  activityRows = activityRows.map((activity) =>
    activity.id === activityId ? { ...activity, is_archived: false, archived_at: null, sort_order: nextOrder } : activity,
  );
  saveActiveState();
  return activityRows.find((activity) => activity.id === activityId)!;
}

export async function reorderActivities(order: Array<{ id: string; sort_order: number }>) {
  await delay();
  activityRows = activityRows.map((activity) => {
    const next = order.find((item) => item.id === activity.id);
    return next ? { ...activity, sort_order: next.sort_order } : activity;
  });
  saveActiveState();
  return listActivities();
}

export async function updateActivity(activityId: string, patch: Partial<Pick<Activity, "name">>) {
  await delay();
  activityRows = activityRows.map((activity) => (activity.id === activityId ? { ...activity, ...patch } : activity));
  saveActiveState();
  return activityRows.find((activity) => activity.id === activityId)!;
}

export async function getProfile() {
  await delay();
  return profileRow;
}

export async function updateProfile(patch: Partial<typeof profileRow>) {
  await delay();
  profileRow = { ...profileRow, ...patch };
  saveActiveState();
  return profileRow;
}

export async function getActiveCommitment() {
  await delay();
  return commitmentRows.find((commitment) => commitment.status === "active") ?? null;
}

export async function getCommitment(commitmentId: string) {
  await delay();
  return commitmentRows.find((commitment) => commitment.id === commitmentId) ?? null;
}

export async function getActiveLauncherCommitment() {
  await delay();
  return (
    commitmentRows.find((commitment) => {
      const hasReflection = reflectionRows.some((reflection) => reflection.commitment_id === commitment.id);
      return commitment.status === "active" && Boolean(commitment.packing_started_at) && !hasReflection;
    }) ?? null
  );
}

export async function startCommitment(activityId: string, durationMin: number) {
  await delay();
  commitmentRows = commitmentRows.map((commitment) =>
    commitment.status === "active" ? { ...commitment, status: "abandoned" } : commitment,
  );
  const row: Commitment = {
    id: id(),
    user_id: activeStateUserId,
    activity_id: activityId,
    duration_minutes: durationMin,
    minimum_minutes: durationMin,
    started_at: new Date().toISOString(),
    packing_started_at: null,
    gone_at: null,
    completed_at: null,
    status: "active",
  };
  commitmentRows.unshift(row);
  saveActiveState();
  return row;
}

export async function startPackingCommitment(activityId: string, minimumMinutes: number) {
  await delay();
  const now = new Date().toISOString();
  commitmentRows = commitmentRows.map((commitment) =>
    commitment.status === "active" ? { ...commitment, status: "abandoned" } : commitment,
  );
  const row: Commitment = {
    id: id(),
    user_id: activeStateUserId,
    activity_id: activityId,
    duration_minutes: minimumMinutes,
    minimum_minutes: minimumMinutes,
    started_at: now,
    packing_started_at: now,
    gone_at: null,
    completed_at: null,
    status: "active",
  };
  commitmentRows.unshift(row);
  saveActiveState();
  return row;
}

export async function markCommitmentGone(commitmentId: string) {
  await delay();
  const goneAt = new Date().toISOString();
  commitmentRows = commitmentRows.map((commitment) =>
    commitment.id === commitmentId ? { ...commitment, gone_at: goneAt } : commitment,
  );
  saveActiveState();
  return commitmentRows.find((commitment) => commitment.id === commitmentId)!;
}

export async function completeCommitment(commitmentId: string) {
  await delay();
  const completedAt = new Date().toISOString();
  commitmentRows = commitmentRows.map((commitment) =>
    commitment.id === commitmentId ? { ...commitment, status: "completed", completed_at: completedAt } : commitment,
  );
  saveActiveState();
  return commitmentRows.find((commitment) => commitment.id === commitmentId)!;
}

export async function abandonCommitment(commitmentId: string) {
  await delay();
  commitmentRows = commitmentRows.map((commitment) =>
    commitment.id === commitmentId ? { ...commitment, status: "abandoned" } : commitment,
  );
  saveActiveState();
}

export async function createReflection(commitmentId: string, outcome: ReflectionOutcome, feelingScore?: number, note?: string) {
  await delay();
  const completedAt = new Date().toISOString();
  commitmentRows = commitmentRows.map((commitment) =>
    commitment.id === commitmentId ? { ...commitment, status: "completed", completed_at: commitment.completed_at ?? completedAt } : commitment,
  );
  const row: Reflection = {
    id: id(),
    commitment_id: commitmentId,
    outcome,
    feeling_score: feelingScore ?? null,
    note: note?.trim() || null,
    created_at: new Date().toISOString(),
  };
  reflectionRows = reflectionRows.filter((reflection) => reflection.commitment_id !== commitmentId);
  reflectionRows.unshift(row);
  saveActiveState();
  return row;
}

export async function getRecentEntries(limit = 20) {
  await delay();
  return commitmentRows
    .filter((commitment) => commitment.status === "completed")
    .slice()
    .sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))
    .slice(0, limit)
    .map((commitment) => ({
      ...commitment,
      activity: activityRows.find((activity) => activity.id === commitment.activity_id)!,
      reflection: reflectionRows.find((reflection) => reflection.commitment_id === commitment.id) ?? null,
    }));
}

export async function getEntry(idValue: string) {
  const entries = await getRecentEntries(100);
  return entries.find((entry) => entry.id === idValue) ?? null;
}

export async function listActivityItems(activityId: string) {
  await delay();
  return activityItemRows
    .filter((item) => item.activity_id === activityId)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function createActivityItem(activityId: string, label: string, iconKey: ActivityItem["icon_key"] = "key", priority: ActivityItem["priority"] = "must") {
  await delay();
  const nextOrder =
    Math.max(0, ...activityItemRows.filter((item) => item.activity_id === activityId).map((item) => item.sort_order)) + 1;
  const row: ActivityItem = {
    id: id(),
    user_id: activeStateUserId,
    activity_id: activityId,
    label,
    icon_key: iconKey,
    priority,
    hint: null,
    sort_order: nextOrder,
    is_door_step: false,
    created_at: new Date().toISOString(),
  };
  activityItemRows.push(row);
  saveActiveState();
  return row;
}

export async function updateActivityItem(itemId: string, patch: Partial<Pick<ActivityItem, "label" | "icon_key" | "is_door_step" | "priority" | "hint">>) {
  await delay();
  activityItemRows = activityItemRows.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
  saveActiveState();
  return activityItemRows.find((item) => item.id === itemId)!;
}

export async function deleteActivityItem(itemId: string) {
  await delay();
  activityItemRows = activityItemRows.filter((item) => item.id !== itemId);
  saveActiveState();
}

export async function reorderActivityItems(activityId: string, orderedIds: string[]) {
  await delay();
  activityItemRows = activityItemRows.map((item) => {
    if (item.activity_id !== activityId) return item;
    const index = orderedIds.indexOf(item.id);
    return index >= 0 ? { ...item, sort_order: index + 1 } : item;
  });
  saveActiveState();
  return listActivityItems(activityId);
}

export async function resetActivityItems(activityId: string) {
  await delay();
  activityItemRows = activityItemRows.filter((item) => item.activity_id !== activityId);
  const defaults = activityItems
    .filter((item) => item.activity_id === activityId)
    .map((item) => ({ ...item, id: id(), user_id: activeStateUserId, created_at: new Date().toISOString() }));
  activityItemRows.push(...defaults);
  saveActiveState();
  return listActivityItems(activityId);
}

export async function getOverallStats() {
  await delay();
  const completed = commitmentRows.filter((commitment) => commitment.status === "completed");
  const joined = completed.map((commitment) => reflectionRows.find((reflection) => reflection.commitment_id === commitment.id)).filter(Boolean) as Reflection[];
  const betterCount = joined.filter((reflection) => reflection.outcome === "better").length;
  const sameCount = joined.filter((reflection) => reflection.outcome === "same").length;
  const worseCount = joined.filter((reflection) => reflection.outcome === "worse").length;
  const reflectedCount = joined.length;
  const feelingScores = joined.map((reflection) => reflection.feeling_score).filter((score): score is number => score !== null);
  const activitiesTried = new Set(completed.map((commitment) => commitment.activity_id)).size;
  return {
    totalCommitments: completed.length,
    feltBetterPct: reflectedCount ? Math.round((betterCount / reflectedCount) * 100) : 0,
    feltSamePct: reflectedCount ? Math.round((sameCount / reflectedCount) * 100) : 0,
    feltWorsePct: reflectedCount ? Math.round((worseCount / reflectedCount) * 100) : 0,
    betterCount,
    sameCount,
    worseCount,
    reflectedCount,
    totalTimeMin: completed.reduce((sum, commitment) => sum + commitment.duration_minutes, 0),
    avgFeeling: feelingScores.length ? Number((feelingScores.reduce((sum, score) => sum + score, 0) / feelingScores.length).toFixed(1)) : null,
    completedThisWeek: completed.filter((commitment) => new Date(commitment.started_at) > new Date(Date.now() - 7 * 86400000)).length,
    targetThisWeek: 12,
    activitiesTried,
  };
}

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export async function getMonthHistory(year: number, month: number): Promise<MonthHistory> {
  await delay();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const today = new Date();
  const monthCommitments = commitmentRows
    .filter((commitment) => commitment.status !== "abandoned")
    .filter((commitment) => {
      const started = new Date(commitment.started_at);
      return started >= monthStart && started < monthEnd;
    });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = new Date(year, month, index + 1);
    const key = dateKey(day);
    const commitmentsForDay = monthCommitments
      .filter((commitment) => dateKey(new Date(commitment.started_at)) === key)
      .sort((a, b) => +new Date(a.started_at) - +new Date(b.started_at))
      .map((commitment) => {
        const activity = activityRows.find((row) => row.id === commitment.activity_id);
        const reflection = reflectionRows.find((row) => row.commitment_id === commitment.id);
        return {
          id: commitment.id,
          activityId: commitment.activity_id,
          activityName: activity?.name ?? "Activity",
          startedAt: commitment.started_at,
          durationMin: commitment.duration_minutes,
          reflection: reflection
            ? {
                outcome: reflection.outcome,
                note: reflection.note,
              }
            : null,
        };
      });
    return { date: key, commitments: commitmentsForDay };
  });

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
  const showedUpDays = days.filter((day) => day.commitments.length > 0).length;
  const previous = commitmentRows
    .filter((commitment) => commitment.status !== "abandoned")
    .map((commitment) => new Date(commitment.started_at))
    .filter((date) => date < monthStart)
    .sort((a, b) => +b - +a)[0];

  return {
    days,
    summary: { showedUpDays, daysElapsed },
    previousMonthWithActivity: previous ? { year: previous.getFullYear(), month: previous.getMonth() } : null,
  };
}

export async function getStatsByActivity() {
  await delay();
  return activityRows.map((activity) => {
    const activityCommitments = commitmentRows.filter(
      (commitment) => commitment.activity_id === activity.id && commitment.status === "completed",
    );
    const activityReflections = activityCommitments
      .map((commitment) => reflectionRows.find((reflection) => reflection.commitment_id === commitment.id))
      .filter(Boolean) as Reflection[];
    const betterCount = activityReflections.filter((reflection) => reflection.outcome === "better").length;
    return {
      activityId: activity.id,
      name: activity.name,
      key: activity.key,
      color: activity.color,
      count: activityCommitments.length,
      betterCount,
      reflectedCount: activityReflections.length,
      feltBetterPct: activityReflections.length ? Math.round((betterCount / activityReflections.length) * 100) : 0,
    };
  });
}

export async function getCurrentStreak() {
  await delay();
  const dates = new Set(
    commitmentRows
      .filter((commitment) => commitment.status === "completed")
      .map((commitment) => new Date(commitment.started_at).toDateString()),
  );
  let streak = 0;
  const cursor = new Date();
  while (dates.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getBestStreak() {
  await delay();
  return 12;
}

export async function getPatterns() {
  await delay();
  return {
    bestDayOfWeek: "Saturday",
    bestTimeOfDay: "Evening",
  };
}

export async function getWeekCompletions() {
  await delay();
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay() || 7;
  monday.setDate(today.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return commitmentRows.some(
      (commitment) => commitment.status === "completed" && new Date(commitment.started_at).toDateString() === date.toDateString(),
    );
  });
}
