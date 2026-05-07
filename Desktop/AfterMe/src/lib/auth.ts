export type AuthUser = {
  id: string;
  email: string;
};

const authStorageKey = "afterme.auth.user";
const authEventName = "afterme-auth-change";
let cachedRaw: string | null = null;
let cachedUser: AuthUser | null = null;

function userIdFromEmail(email: string) {
  return `local-${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "user"}`;
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(authStorageKey);
    if (raw === cachedRaw) return cachedUser;
    cachedRaw = raw;
    cachedUser = raw ? (JSON.parse(raw) as AuthUser) : null;
    return cachedUser;
  } catch {
    cachedRaw = null;
    cachedUser = null;
    return null;
  }
}

export function signInWithEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = { id: userIdFromEmail(normalized), email: normalized };
  cachedRaw = JSON.stringify(user);
  cachedUser = user;
  window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  window.dispatchEvent(new Event(authEventName));
  return user;
}

export function signOut() {
  cachedRaw = null;
  cachedUser = null;
  window.localStorage.removeItem(authStorageKey);
  window.dispatchEvent(new Event(authEventName));
}

export function subscribeToAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(authEventName, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(authEventName, handler);
    window.removeEventListener("storage", handler);
  };
}
