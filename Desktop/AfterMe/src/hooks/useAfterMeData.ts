import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as store from "../lib/api/mockStore";
import type { ActivityColorKey, ActivityItem, ReflectionOutcome } from "../lib/types";

export function useActivities(options?: { includeArchived?: boolean }) {
  return useQuery({ queryKey: ["activities", options?.includeArchived ? "all" : "active"], queryFn: () => store.listActivities(options) });
}

export function useArchivedActivities() {
  return useQuery({ queryKey: ["activities", "archived"], queryFn: store.listArchivedActivities });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; iconKey?: string; colorKey?: ActivityColorKey; defaultDurationMin?: number; minimumMinutes?: number }) =>
      store.createActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["activity-items"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useArchiveActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.archiveActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useRestoreActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.restoreActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useReorderActivities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.reorderActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, patch }: { activityId: string; patch: { name?: string } }) =>
      store.updateActivity(activityId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useUserProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: store.getProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useActiveCommitment() {
  return useQuery({ queryKey: ["commitments", "active"], queryFn: store.getActiveCommitment, refetchInterval: 15_000 });
}

export function useCommitment(commitmentId: string | undefined) {
  return useQuery({
    queryKey: ["commitments", commitmentId],
    queryFn: () => store.getCommitment(commitmentId!),
    enabled: Boolean(commitmentId),
  });
}

export function useActiveLauncherCommitment() {
  return useQuery({
    queryKey: ["commitments", "launcher-active"],
    queryFn: store.getActiveLauncherCommitment,
    refetchInterval: 30_000,
  });
}

export function useStartCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, durationMin }: { activityId: string; durationMin: number }) =>
      store.startCommitment(activityId, durationMin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useStartPackingCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, minimumMinutes }: { activityId: string; minimumMinutes: number }) =>
      store.startPackingCommitment(activityId, minimumMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useMarkCommitmentGone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.markCommitmentGone,
    onSuccess: (commitment) => {
      queryClient.invalidateQueries({ queryKey: ["commitments"] });
      queryClient.invalidateQueries({ queryKey: ["commitments", commitment.id] });
    },
  });
}

export function useCompleteCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.completeCommitment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commitments"] }),
  });
}

export function useAbandonCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.abandonCommitment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commitments"] }),
  });
}

export function useCreateReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commitmentId, outcome, feelingScore, note }: { commitmentId: string; outcome: ReflectionOutcome; feelingScore?: number; note?: string }) =>
      store.createReflection(commitmentId, outcome, feelingScore, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useOverallStats() {
  return useQuery({ queryKey: ["stats", "overall"], queryFn: store.getOverallStats });
}

export function useStatsByActivity() {
  return useQuery({ queryKey: ["stats", "activity"], queryFn: store.getStatsByActivity });
}

export function useCurrentStreak() {
  return useQuery({ queryKey: ["stats", "streak", "current"], queryFn: store.getCurrentStreak });
}

export function useBestStreak() {
  return useQuery({ queryKey: ["stats", "streak", "best"], queryFn: store.getBestStreak });
}

export function usePatterns() {
  return useQuery({ queryKey: ["stats", "patterns"], queryFn: store.getPatterns });
}

export function useRecentEntries(limit = 20) {
  return useQuery({ queryKey: ["entries", "recent", limit], queryFn: () => store.getRecentEntries(limit) });
}

export function useMonthHistory(year: number, month: number) {
  return useQuery({
    queryKey: ["history", year, month],
    queryFn: () => store.getMonthHistory(year, month),
    staleTime: 30_000,
  });
}

export function useEntry(id: string | undefined) {
  return useQuery({ queryKey: ["entries", id], queryFn: () => store.getEntry(id!), enabled: Boolean(id) });
}

export function useWeekCompletions() {
  return useQuery({ queryKey: ["stats", "week"], queryFn: store.getWeekCompletions });
}

export function useActivityItems(activityId: string | undefined) {
  return useQuery({
    queryKey: ["activity-items", activityId],
    queryFn: () => store.listActivityItems(activityId!),
    enabled: Boolean(activityId),
  });
}

export function useCreateActivityItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, label, iconKey, priority }: { activityId: string; label: string; iconKey?: ActivityItem["icon_key"]; priority?: ActivityItem["priority"] }) =>
      store.createActivityItem(activityId, label, iconKey, priority),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ["activity-items", variables.activityId] }),
  });
}

export function useUpdateActivityItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, patch }: { itemId: string; patch: Partial<Pick<ActivityItem, "label" | "icon_key" | "is_door_step" | "priority" | "hint">> }) =>
      store.updateActivityItem(itemId, patch),
    onSuccess: (item) => queryClient.invalidateQueries({ queryKey: ["activity-items", item.activity_id] }),
  });
}

export function useDeleteActivityItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, activityId }: { itemId: string; activityId: string }) => store.deleteActivityItem(itemId),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ["activity-items", variables.activityId] }),
  });
}

export function useReorderActivityItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, orderedIds }: { activityId: string; orderedIds: string[] }) =>
      store.reorderActivityItems(activityId, orderedIds),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ["activity-items", variables.activityId] }),
  });
}

export function useResetActivityItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: store.resetActivityItems,
    onSuccess: (_, activityId) => queryClient.invalidateQueries({ queryKey: ["activity-items", activityId] }),
  });
}
