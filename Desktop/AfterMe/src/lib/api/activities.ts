import * as store from "./mockStore";

export const listActivities = store.listActivities;
export const createActivity = store.createActivity;
export const updateActivity = store.updateActivity;

export async function deleteActivity() {
  throw new Error("Supabase deleteActivity is not wired yet; mock mode currently supports read/create.");
}
