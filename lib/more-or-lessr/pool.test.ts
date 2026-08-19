import { describe, expect, it } from "vitest";
import morelessJson from "@/app/data/cs2/more-or-lessr.json";
import { statValue, unambiguousPool } from "./compare";
import { dailySequence } from "./selection";
import { TOTAL_ROUNDS, type Category, type MorelessData } from "./types";

// The real pool, not a fixture. The tie problem is a property of the actual
// numbers — four players on 17 wins, three on $1.3M — so a synthetic pool would
// prove nothing about the puzzle anyone plays.
const data = morelessJson as MorelessData;
const CATEGORIES: Category[] = ["wins", "prize"];

describe("the drawable pool", () => {
  it.each(CATEGORIES)("holds no two players with the same %s", (category) => {
    const values = unambiguousPool(data.players, category).map((p) =>
      statValue(p, category),
    );
    expect(new Set(values).size).toBe(values.length);
  });

  it.each(CATEGORIES)("stays big enough to draw a run of %s", (category) => {
    expect(
      unambiguousPool(data.players, category).length,
    ).toBeGreaterThanOrEqual(TOTAL_ROUNDS + 1);
  });

  it("thins prize money too, because the figures are curated to the $100k", () => {
    // Not obvious from looking at them: $1,300,000 reads like a precise number
    // until three players turn out to share it.
    expect(unambiguousPool(data.players, "prize").length).toBeLessThan(
      data.players.length,
    );
  });
});

describe("a day's run", () => {
  // The guarantee that matters to a player: no round can be a tie, on any day.
  // A tie scores as correct either way, so it was a free point and a flat
  // face-off — both reels rolling to the same number.
  it.each(CATEGORIES)("never puts two equal %s side by side", (category) => {
    for (let day = 0; day < 400; day++) {
      const sequence = dailySequence(data, day, category);
      for (let i = 1; i < sequence.length; i++) {
        const previous = statValue(sequence[i - 1], category);
        const current = statValue(sequence[i], category);
        expect(
          current,
          `day ${day}, round ${i}: ${sequence[i - 1].name} and ${sequence[i].name} both on ${current}`,
        ).not.toBe(previous);
      }
    }
  });
});
