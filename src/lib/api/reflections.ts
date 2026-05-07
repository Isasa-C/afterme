import * as store from "./mockStore";

export const createReflection = store.createReflection;

export async function getReflectionForCommitment(commitmentId: string) {
  const entries = await store.getRecentEntries(100);
  return entries.find((entry) => entry.id === commitmentId)?.reflection ?? null;
}
