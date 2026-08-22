import { describe, expect, it } from "vitest";
import { morelessFrom } from "./moreless";
import { center } from "./load";
import { canonicalise } from "./sort";

const data = morelessFrom(center);

describe("morelessFrom", () => {
  it("emits the players holding the curated prize figure", () => {
    // Wins come from the scrape and every player has them, so `prize_money`
    // alone decides the pool.
    expect(data.players).toHaveLength(28);
  });

  it("gives every player both comparable stats", () => {
    const incomplets = data.players
      .filter(
        (p) =>
          typeof p.tournaments_won !== "number" ||
          typeof p.prize_money !== "number",
      )
      .map((p) => p.name);
    expect(incomplets).toEqual([]);
  });

  it("keeps the player HLTV renamed, under his current nickname", () => {
    expect(data.players.map((p) => p.name)).toContain("device");
    expect(data.players.map((p) => p.name)).not.toContain("dev1ce");
  });

  it("takes the team name from the centre, cleaned", () => {
    const parenthese = data.players.filter((p) => p.team.includes("("));
    expect(parenthese).toEqual([]);
  });

  it("comes out canonically sorted", () => {
    expect(data.players).toEqual(canonicalise(data.players));
  });
});
