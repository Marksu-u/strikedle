import { describe, expect, it } from "vitest";
import { isCorrectGuess, statValue, unambiguousPool } from "./compare";
import type { Player } from "./types";

const strong: Player = {
  name: "A",
  team: "T",
  nationality: "France",
  tournaments_won: 1.3,
  prize_money: 500000,
};
const weak: Player = {
  name: "B",
  team: "T",
  nationality: "France",
  tournaments_won: 1.1,
  prize_money: 900000,
};

describe("statValue", () => {
  it("rating → tournaments_won", () => {
    expect(statValue(strong, "wins")).toBe(1.3);
  });
  it("prize → prize_money", () => {
    expect(statValue(strong, "prize")).toBe(500000);
  });
});

describe("isCorrectGuess", () => {
  it("'more' juste si le challenger a une valeur supérieure à l'ancre", () => {
    // ancre = weak (1.1), challenger = strong (1.3)
    expect(isCorrectGuess(weak, strong, "wins", "more")).toBe(true);
    expect(isCorrectGuess(weak, strong, "wins", "less")).toBe(false);
  });
  it("'less' juste si le challenger a une valeur inférieure à l'ancre", () => {
    // ancre = strong (1.3), challenger = weak (1.1)
    expect(isCorrectGuess(strong, weak, "wins", "less")).toBe(true);
    expect(isCorrectGuess(strong, weak, "wins", "more")).toBe(false);
  });
  it("respecte la catégorie (prize : weak 900k > strong 500k)", () => {
    expect(isCorrectGuess(strong, weak, "prize", "more")).toBe(true);
  });
  it("égalité comptée juste dans les deux sens", () => {
    const tie: Player = { ...strong, name: "C" };
    expect(isCorrectGuess(strong, tie, "wins", "more")).toBe(true);
    expect(isCorrectGuess(strong, tie, "wins", "less")).toBe(true);
  });
});

describe("unambiguousPool", () => {
  const pool = (wins: number[]): Player[] =>
    wins.map((w, i) => ({
      name: `P${i}`,
      team: "T",
      nationality: "France",
      tournaments_won: w,
      prize_money: (i + 1) * 1000,
    }));

  it("keeps one player per win count and drops the rest", () => {
    const kept = unambiguousPool(pool([17, 17, 17, 5, 17]), "wins");
    expect(kept.map((p) => p.name)).toEqual(["P0", "P3"]);
  });

  it("keeps the FIRST of each value, so the day is the same for everyone", () => {
    const players = pool([19, 19, 19]);
    expect(unambiguousPool(players, "wins")[0].name).toBe("P0");
    expect(unambiguousPool([...players], "wins")[0].name).toBe("P0");
  });

  it("takes nothing from prize money, where values do not collide", () => {
    const players = pool([17, 17, 17]);
    expect(unambiguousPool(players, "prize")).toHaveLength(3);
  });
});
