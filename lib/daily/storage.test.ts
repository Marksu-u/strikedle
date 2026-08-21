import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { load, save } from "./storage";
import {
  EMPTY_PERSISTED,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  type Persisted,
} from "./types";

describe("load", () => {
  beforeEach(() => localStorage.clear());

  it("returns a fresh state when nothing is stored", () => {
    expect(load()).toEqual(EMPTY_PERSISTED);
  });

  it("reads back what was written", () => {
    const etat: Persisted = {
      version: 1,
      meta: { streak: 3, lastPlayedDay: 100, runScore: 500, recordScore: 900 },
      progress: null,
    };
    save(etat);
    expect(load()).toEqual(etat);
  });

  it("starts over on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{ pas du json");
    expect(load()).toEqual(EMPTY_PERSISTED);
  });

  it("starts over on an unknown version", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, meta: {}, progress: null }),
    );
    expect(load()).toEqual(EMPTY_PERSISTED);
  });

  it("starts over when `meta` is missing", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, progress: null }),
    );
    expect(load()).toEqual(EMPTY_PERSISTED);
  });

  it("starts over when a `meta` field is not a number", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        meta: { streak: "sept", lastPlayedDay: 1, runScore: 0, recordScore: 0 },
        progress: null,
      }),
    );
    expect(load()).toEqual(EMPTY_PERSISTED);
  });

  it("starts over when `progress` has no `puzzles`", () => {
    // Callers index into `progress.puzzles[id]`: a partial shape made them throw,
    // which amounts to the same thing as an exception from here.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        meta: { streak: 1, lastPlayedDay: 1, runScore: 0, recordScore: 0 },
        progress: { day: 1 },
      }),
    );
    expect(load().progress).toBeNull();
  });

  it("does not throw when localStorage is unreachable", () => {
    const spy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("SecurityError");
      });
    expect(() => load()).not.toThrow();
    expect(load()).toEqual(EMPTY_PERSISTED);
    spy.mockRestore();
  });
});

describe("save", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("does not throw when the quota is exceeded", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    expect(() => save(EMPTY_PERSISTED)).not.toThrow();
    spy.mockRestore();
  });
});

describe("migration depuis cs-gamedle:v1", () => {
  beforeEach(() => localStorage.clear());

  const ancien: Persisted = {
    version: 1,
    meta: { streak: 7, lastPlayedDay: 200, runScore: 1200, recordScore: 4000 },
    progress: null,
  };

  it("carries a legacy save over to the new key", () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(ancien));
    expect(load()).toEqual(ancien);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("removes the legacy key once carried over", () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(ancien));
    load();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("never lets a stale legacy key clobber a Strikedle save", () => {
    // The case that costs a real player their streak: both keys present, the
    // new one current. The legacy save must be ignored, not merged, not copied.
    const courant: Persisted = {
      version: 1,
      meta: { streak: 1, lastPlayedDay: 300, runScore: 10, recordScore: 4000 },
      progress: null,
    };
    save(courant);
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(ancien));
    expect(load()).toEqual(courant);
  });

  it("is a no-op when there is no legacy key", () => {
    expect(load()).toEqual(EMPTY_PERSISTED);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("still returns a fresh state when storage throws", () => {
    // storage.ts's one rule. A migration that throws would break every page.
    const spy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(load()).toEqual(EMPTY_PERSISTED);
    spy.mockRestore();
  });
});
