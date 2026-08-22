import { describe, expect, it } from "vitest";
import { guessrFrom } from "./guessr";
import { center } from "./load";
import { canonicalise } from "./sort";

const data = guessrFrom(center);

describe("guessrFrom", () => {
  it("projects the whole pool", () => {
    expect(data.players).toHaveLength(116);
  });

  it("maps wins onto tournaments_won", () => {
    const zywoo = data.players.find((p) => p.name === "ZywOo")!;
    expect(zywoo.tournaments_won).toBe(center.players.ZywOo.wins);
  });

  it("maps team onto current_team", () => {
    const zywoo = data.players.find((p) => p.name === "ZywOo")!;
    expect(zywoo.current_team).toBe(center.players.ZywOo.team);
  });

  it("comes out canonically sorted, as validate.ts requires", () => {
    expect(data.players).toEqual(canonicalise(data.players));
  });

  it("gives every player at least one achievement", () => {
    const vides = data.players.filter((p) => p.achievements.length === 0);
    expect(vides).toEqual([]);
  });

  it("never lists the current team among the former ones", () => {
    const fautifs = data.players
      .filter((p) => p.previous_teams.includes(p.current_team))
      .map((p) => p.name);
    expect(fautifs).toEqual([]);
  });
});
