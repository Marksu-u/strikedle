// The ownership rule, executable. A refresh overwrites what HLTV owns and leaves
// what a human researched alone — which is what lets one file be both
// machine-refreshed and hand-curated.

import { cleanTeam } from "./team";
import type {
  Center,
  CenterPlayer,
  CuratedFields,
  ScrapedFields,
} from "./types";

// A player the centre has never seen starts with an empty curated half, filled
// by hand afterwards. Its scraped half arrives entirely from the refresh, so the
// record is only whole once `frais` has been merged over it.
function curatedVide(): CuratedFields {
  return { role: [], previous_teams: [] };
}

// Names the scrape must never write, whatever it sends under them.
const CURES = new Set([
  "role",
  "previous_teams",
  "peak_rating",
  "peak_year",
  "prize_money",
]);

// An incoming null/empty value is missing data, not a correction: the scrape
// ships three null nationalities that the migration filled from curated data.
function renseigne(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  return true;
}

export function mergeScrape(
  center: Center,
  scrape: Record<string, Partial<ScrapedFields>>,
  updated: string,
): Center {
  const players: Record<string, CenterPlayer> = { ...center.players };

  for (const [nick, entrant] of Object.entries(scrape)) {
    const base: CuratedFields & Partial<ScrapedFields> =
      players[nick] ?? curatedVide();

    const frais: Partial<ScrapedFields> = {};
    for (const [k, v] of Object.entries(entrant)) {
      if (!renseigne(v)) continue;
      if (CURES.has(k)) continue;
      (frais as Record<string, unknown>)[k] = v;
    }

    const fusionne = { ...base, ...frais } as CenterPlayer;
    if (fusionne.team) {
      fusionne.team = cleanTeam(fusionne.team, center.team_aliases);
    }
    players[nick] = fusionne;
  }

  // Players the scrape stopped returning are kept: a retirement or an upstream
  // hiccup both look like absence, and dropping one silently shrinks the pool
  // that `lib/daily/deck.ts` derives its rotation from.
  return {
    updated,
    players,
    extra_nicks: center.extra_nicks,
    team_aliases: center.team_aliases,
  };
}
