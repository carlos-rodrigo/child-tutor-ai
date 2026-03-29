import { TUTOR_MUTE_STORAGE_KEY } from "./tutor-constants";

interface StorageReader {
  getItem(key: string): string | null;
}

interface StorageWriter {
  setItem(key: string, value: string): void;
}

export { TUTOR_MUTE_STORAGE_KEY };

export function readStoredMutePreference(storage: StorageReader | null = getBrowserStorage()) {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(TUTOR_MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeStoredMutePreference(
  isMuted: boolean,
  storage: StorageWriter | null = getBrowserStorage()
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(TUTOR_MUTE_STORAGE_KEY, String(isMuted));
  } catch {
    // Ignore storage failures so tutoring keeps working in private browsing / restricted contexts.
  }
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
