import * as store from "./mockStore";

export const startCommitment = store.startCommitment;
export const completeCommitment = store.completeCommitment;
export const abandonCommitment = store.abandonCommitment;
export const getActiveCommitment = store.getActiveCommitment;
export const listCommitments = store.getRecentEntries;

export async function getCommitmentsByActivity(activityId: string) {
  const entries = await store.getRecentEntries(100);
  return entries.filter((entry) => entry.activity_id === activityId);
}
