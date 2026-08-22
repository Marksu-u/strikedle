// The display prose shown on a Guessr win, derived from the numbers rather than
// typed beside them. Hand-written, the two drifted: nine players carried a
// "Career earnings" line that no longer matched any figure in the scrape.
//
// `guessr_players.test.ts` cross-checks the Major line against the `majors`
// column, so the two formats below are a contract, not a style choice.

import type { CenterPlayer } from "./types";

// "#1('19), #2('21)" → [{ rank: 1, year: 2019 }, { rank: 2, year: 2021 }]
function placings(top20: string | null): { rank: number; year: number }[] {
  if (!top20) return [];
  return [...top20.matchAll(/#(\d+)\('(\d{2})\)/g)].map((m) => ({
    rank: Number(m[1]),
    year: 2000 + Number(m[2]),
  }));
}

export function achievementsFor(p: CenterPlayer): string[] {
  const lines: string[] = [];

  if (p.majors === 1 && p.majorTrophies.length > 0) {
    lines.push(`Major Winner (${p.majorTrophies[0]})`);
  } else if (p.majors > 1) {
    lines.push(`${p.majors}x Major Winner`);
  }

  const rangs = placings(p.top20);
  if (rangs.length > 0) {
    const best = Math.min(...rangs.map((r) => r.rank));
    const years = rangs.filter((r) => r.rank === best).map((r) => r.year);
    lines.push(`HLTV Top ${best} (${years.join(", ")})`);
  }

  if (p.mvps > 0) lines.push(`${p.mvps}x event MVP`);

  if (p.wins > 0) {
    lines.push(`${p.wins} tournament win${p.wins > 1 ? "s" : ""}`);
  }

  // A player with no title, no MVP and no Top-20 would otherwise reveal with an
  // empty panel. Earnings are the one thing every player has.
  if (lines.length === 0) {
    lines.push(`Career earnings $${p.hltvPrize.toLocaleString("en-US")}`);
  }

  return lines;
}
