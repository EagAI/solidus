const STORAGE_KEY = "solidus_site_unlocked";
const PASSCODE = "uzgrudinti";

export function isSiteUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockSite(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore storage failures
  }
}

export function lockSite(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function verifyPasscode(value: string): boolean {
  return value.trim() === PASSCODE;
}
