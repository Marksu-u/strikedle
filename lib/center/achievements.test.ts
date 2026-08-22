import { describe, expect, it } from "vitest";
import { achievementsFor } from "./achievements";
import type { CenterPlayer } from "./types";

// Minimal player; each test overrides only what it exercises.
function joueur(over: Partial<CenterPlayer> = {}): CenterPlayer {
  return {
    id: 1,
    real: "Someone Someone",
    nationality: "France",
    age: 25,
    team: "Vitality",
    teamRaw: "Vitality",
    hltvPrize: 0,
    top20: null,
    majors: 0,
    majorMVP: 0,
    mvps: 0,
    trophies: [],
    aggWins: [],
    majorTrophies: [],
    wins: 0,
    role: ["Rifler"],
    previous_teams: [],
    ...over,
  };
}

describe("achievementsFor", () => {
  it("names the event when there is exactly one Major", () => {
    const a = achievementsFor(
      joueur({ majors: 1, majorTrophies: ["PGL Major Stockholm 2021"] }),
    );
    expect(a).toContain("Major Winner (PGL Major Stockholm 2021)");
  });

  it("counts instead of naming when there are several Majors", () => {
    const a = achievementsFor(
      joueur({ majors: 3, majorTrophies: ["A", "B", "C"] }),
    );
    expect(a).toContain("3x Major Winner");
  });

  it("reports the best Top-20 rank and every year at it", () => {
    const a = achievementsFor(
      joueur({ top20: "#1('19), #1('20), #2('21), #2('22), #1('23), #3('24)" }),
    );
    expect(a).toContain("HLTV Top 1 (2019, 2020, 2023)");
  });

  it("handles a player whose best rank is not first", () => {
    const a = achievementsFor(joueur({ top20: "#7('23), #12('24)" }));
    expect(a).toContain("HLTV Top 7 (2023)");
  });

  it("pluralises tournament wins", () => {
    expect(achievementsFor(joueur({ wins: 1 }))).toContain("1 tournament win");
    expect(achievementsFor(joueur({ wins: 9 }))).toContain("9 tournament wins");
  });

  it("counts event MVPs", () => {
    expect(achievementsFor(joueur({ mvps: 32 }))).toContain("32x event MVP");
  });

  it("falls back to career earnings when there is nothing else to say", () => {
    const a = achievementsFor(joueur({ hltvPrize: 235024 }));
    expect(a).toEqual(["Career earnings $235,024"]);
  });

  it("never leaves a player with an empty list", () => {
    expect(achievementsFor(joueur()).length).toBeGreaterThan(0);
  });

  it("does not add the earnings fallback when there is a real achievement", () => {
    const a = achievementsFor(joueur({ wins: 3, hltvPrize: 900000 }));
    expect(a.some((l) => l.startsWith("Career earnings"))).toBe(false);
  });

  it("orders the lines Majors, Top 20, MVPs, wins", () => {
    const a = achievementsFor(
      joueur({
        majors: 3,
        majorTrophies: ["A", "B", "C"],
        top20: "#1('19)",
        mvps: 32,
        wins: 30,
      }),
    );
    expect(a).toEqual([
      "3x Major Winner",
      "HLTV Top 1 (2019)",
      "32x event MVP",
      "30 tournament wins",
    ]);
  });
});
