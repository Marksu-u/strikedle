import { describe, expect, it } from "vitest";
import { dailySequence, practiceSequence } from "./selection";
import { TOTAL_ROUNDS, type MorelessData } from "./types";

// Fixture: 28 players, like the real pool (the draw requires pool >= count).
const data: MorelessData = {
  game: "test",
  players: Array.from({ length: 28 }, (_, i) => ({
    name: `P${i}`,
    team: "T",
    nationality: "France",
    tournaments_won: i + 1,
    prize_money: (i + 1) * 100000,
  })),
};

describe("dailySequence", () => {
  it("returns TOTAL_ROUNDS + 1 players", () => {
    expect(dailySequence(data, 100, "wins")).toHaveLength(TOTAL_ROUNDS + 1);
  });

  it("is deterministic (same day + category → same sequence)", () => {
    expect(dailySequence(data, 100, "wins")).toEqual(
      dailySequence(data, 100, "wins"),
    );
  });

  it("differs by category", () => {
    expect(dailySequence(data, 100, "wins")).not.toEqual(
      dailySequence(data, 100, "prize"),
    );
  });

  it("differs by day", () => {
    expect(dailySequence(data, 100, "wins")).not.toEqual(
      dailySequence(data, 101, "wins"),
    );
  });

  it("never contains a duplicate", () => {
    for (let day = 0; day < 500; day++) {
      const seq = dailySequence(data, day, "wins");
      expect(new Set(seq.map((p) => p.name)).size).toBe(seq.length);
    }
  });

  it("throws when the pool is too small", () => {
    const small: MorelessData = {
      game: "t",
      players: data.players.slice(0, 5),
    };
    expect(() => dailySequence(small, 100, "wins")).toThrow();
  });
});

describe("practiceSequence", () => {
  it("returns TOTAL_ROUNDS + 1 players distincts", () => {
    const seq = practiceSequence(data, "wins");
    expect(seq).toHaveLength(TOTAL_ROUNDS + 1);
    expect(new Set(seq.map((p) => p.name)).size).toBe(seq.length);
  });

  it("varies from call to call", () => {
    const a = practiceSequence(data, "wins")
      .map((p) => p.name)
      .join();
    const b = practiceSequence(data, "wins")
      .map((p) => p.name)
      .join();
    // Two random shuffles of 28 players: a collision is negligible.
    expect(a).not.toBe(b);
  });

  it("throws when the pool is too small", () => {
    const small: MorelessData = {
      game: "t",
      players: data.players.slice(0, 5),
    };
    expect(() => practiceSequence(small, "wins")).toThrow();
  });

  it("does NOT walk the epoch chain (instant practice)", () => {
    // The daily draw walks ~10,000 epochs for the current day; practice must stay
    // under a millisecond, otherwise every "Play again" click freezes the UI.
    const t0 = performance.now();
    for (let i = 0; i < 50; i++) practiceSequence(data, "wins");
    expect((performance.now() - t0) / 50).toBeLessThan(1);
  });
});
