import { describe, expect, it } from "vitest";
import { center } from "@/lib/center/load";

// Asserts on the COMMITTED centre, not on re-running the migration.
//
// `migrate-center.ts` folded the three hand-typed pools into the centre once.
// Those pools are now generated FROM the centre, so re-running the fold would
// feed output back into input — the Guessr projection drops a club a player has
// rejoined, and a second pass would read that back as the true history. The
// migration is history; this file guards the artefact it produced.
describe("app/data/cs2/players.json", () => {
  it("carries every player from the scrape", () => {
    expect(Object.keys(center.players)).toHaveLength(116);
  });

  it("every player keeps a role", () => {
    const missing = Object.entries(center.players)
      .filter(([, p]) => p.role.length === 0)
      .map(([nick]) => nick);
    expect(missing).toEqual([]);
  });

  it("keeps the curated previous_teams", () => {
    const withHistory = Object.values(center.players).filter(
      (p) => p.previous_teams.length > 0,
    );
    expect(withHistory).toHaveLength(104);
  });

  it("keeps the 28 researched More or Lessr figures", () => {
    // Both stats are curated and arrive together: a record with one and not the
    // other would be undrawable whenever the run picked the missing category.
    const withPrize = Object.values(center.players).filter(
      (p) => p.prize_money !== undefined,
    );
    const withRating = Object.values(center.players).filter(
      (p) => p.peak_rating !== undefined,
    );
    expect(withPrize).toHaveLength(28);
    expect(withRating).toHaveLength(28);
  });

  it("fills the three null nationalities from the curated data", () => {
    for (const nick of ["olofmeister", "f0rest", "GeT_RiGhT"]) {
      expect(center.players[nick].nationality).toBe("Sweden");
    }
  });

  it("no player is left without a nationality", () => {
    const flagless = Object.entries(center.players)
      .filter(([, p]) => !p.nationality?.trim())
      .map(([nick]) => nick);
    expect(flagless).toEqual([]);
  });

  it("carries the Wordle-only nicknames", () => {
    expect(center.extra_nicks).toHaveLength(243);
  });

  it("no extra_nick duplicates a player nickname", () => {
    const pool = new Set(
      Object.keys(center.players).map((n) => n.toUpperCase()),
    );
    const overlap = center.extra_nicks.filter((n) => pool.has(n.toUpperCase()));
    expect(overlap).toEqual([]);
  });

  it("finds a player HLTV has since renamed", () => {
    // The pools were typed when HLTV called him `dev1ce`; the scrape says
    // `device`. Without the alias his curated figures are dropped on the floor.
    expect(center.players.device.peak_rating).toBeDefined();
    expect(center.players.device.prize_money).toBeDefined();
  });

  it("aliases the team spelling the curated data settled on", () => {
    expect(center.team_aliases.HEROIC).toBe("Heroic");
  });
});

describe("nickname styling", () => {
  it("takes HLTV's published spelling over the scrape's key", () => {
    // The scrape keys these two differently from the `hltvNick` it reports, and
    // the hand-typed pools copied the keys. HLTV publishes `electroNic` and
    // `EliGE`; those are the names players should see and type.
    expect(center.players.electroNic).toBeDefined();
    expect(center.players.EliGE).toBeDefined();
    expect(center.players.electronic).toBeUndefined();
    expect(center.players.ELiGE).toBeUndefined();
  });

  it("keeps their curated data through the rename", () => {
    expect(center.players.electroNic.role.length).toBeGreaterThan(0);
    expect(center.players.EliGE.role.length).toBeGreaterThan(0);
  });
});
