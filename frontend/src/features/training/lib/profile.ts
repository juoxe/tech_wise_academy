/* The player is identified by an anonymous profile ID, created once per browser. It is a stopgap
   until the login with Keycloak is in place (TD-17). If the browser does not keep it, a new ID is
   used for this page visit only. */

const STORAGE_KEY = "twa-profile-id";

let fallbackId: string | null = null;

export function getProfileId(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const created = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    fallbackId ??= crypto.randomUUID();
    return fallbackId;
  }
}
