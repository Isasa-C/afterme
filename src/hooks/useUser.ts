import { useSyncExternalStore } from "react";
import { getAuthUser, subscribeToAuth } from "../lib/auth";

export function useUser() {
  const user = useSyncExternalStore(subscribeToAuth, getAuthUser, () => null);
  return {
    user,
    isLoading: false,
  };
}
