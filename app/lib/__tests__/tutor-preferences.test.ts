import { describe, expect, it, vi } from "vitest";

import {
  readStoredMutePreference,
  TUTOR_MUTE_STORAGE_KEY,
  writeStoredMutePreference,
} from "../tutor-preferences";

describe("tutor-preferences", () => {
  it("reads and writes the stored mute preference", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    };

    expect(readStoredMutePreference(storage)).toBe(false);

    writeStoredMutePreference(true, storage);

    expect(storage.setItem).toHaveBeenCalledWith(TUTOR_MUTE_STORAGE_KEY, "true");
    expect(readStoredMutePreference(storage)).toBe(true);
  });

  it("fails closed when storage access throws", () => {
    const brokenStorage = {
      getItem: vi.fn(() => {
        throw new Error("no storage");
      }),
      setItem: vi.fn(() => {
        throw new Error("no storage");
      }),
    };

    expect(readStoredMutePreference(brokenStorage)).toBe(false);
    expect(() => writeStoredMutePreference(true, brokenStorage)).not.toThrow();
  });
});
