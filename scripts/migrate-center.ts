// One-shot: folded the three hand-typed game files into the centre. Lossless by
// construction — every value it wrote already existed in the repo.
//
// ALREADY RUN. Do not run it again: the three files it reads are now GENERATED
// from the centre, so a second pass would feed output back into input. The
// Guessr projection drops a club a player has rejoined, and re-folding would
// read that absence back as the true history, quietly eroding `previous_teams`.
//
// Kept as the record of how the centre was assembled, and as the thing to adapt
// if a fourth game ever needs folding in.

import { writeFileSync } from "node:fs";
import guessrJson from "@/app/data/cs2/guessr_players.json";
import morelessJson from "@/app/data/cs2/more-or-lessr.json";
import wordleJson from "@/app/data/cs2/wordle.json";
import scrape from "@/app/data/cs2/hltv_raw.json";
import { cleanTeam } from "@/lib/center/team";
import type { Center, CenterPlayer, ScrapedFields } from "@/lib/center/types";

// The scrape spells one club differently from the curated pool. The Guessr team
// column compares by exact text, so the two spellings would be two clubs.
const TEAM_ALIASES: Record<string, string> = { HEROIC: "Heroic" };

// Curated records filed under a nickname HLTV has since changed. Keyed by the
// scrape's current spelling, valued by the old one the pools were typed under.
// HLTV renamed `dev1ce` to `device`; without this his More or Lessr figures are
// silently dropped and the pool comes out one player short.
const NICK_ALIASES: Record<string, string> = { device: "dev1ce" };

// The date the HLTV figures were captured. The game files carry no date of their
// own, so this lives in the centre for whoever maintains it.
const DATA_DATE = "2026-08-22";

// The scrape as it sits on disk: the scraped half, plus a `hltvNick` the centre
// drops, and a `nationality` that is null for three players.
type ScrapeRecord = Omit<ScrapedFields, "nationality"> & {
  hltvNick: string;
  nationality: string | null;
};

export function buildCenter(): Center {
  const guessr = new Map(guessrJson.players.map((p) => [p.name, p] as const));
  const moreless = new Map(
    morelessJson.players.map((p) => [p.name, p] as const),
  );

  const players: Record<string, CenterPlayer> = {};

  for (const [cle, brut] of Object.entries(
    scrape as unknown as Record<string, ScrapeRecord>,
  )) {
    // `hltvNick` is the field HLTV publishes the nickname in; the scrape's own
    // object key has drifted from it for two players — `electronic`/`electroNic`
    // and `ELiGE`/`EliGE` — and the hand-typed pools inherited the drift. The
    // published styling wins, which is the entire point of having one source.
    //
    // The key is kept only to find the curated records, filed under the old
    // spelling. Past this loop the nickname exists in one place: the centre key.
    const { hltvNick: nick, nationality, ...reste } = brut;

    const ancien = NICK_ALIASES[nick];
    const curated =
      guessr.get(cle) ?? guessr.get(nick) ?? (ancien && guessr.get(ancien));
    if (!curated) {
      throw new Error(
        `${nick} : dans le scrape, absent de guessr_players.json`,
      );
    }
    const mol =
      moreless.get(cle) ??
      moreless.get(nick) ??
      (ancien && moreless.get(ancien));

    players[nick] = {
      ...reste,
      // The scrape has three nulls; the curated pool has all three. Filling here
      // rather than patching by hand keeps the migration provably lossless.
      nationality: nationality ?? curated.nationality,
      team: cleanTeam(reste.team, TEAM_ALIASES),
      role: curated.role,
      previous_teams: curated.previous_teams,
      // Neither figure is in the scrape: both come from the More or Lessr pool,
      // and only its 28 players have them.
      //
      // HISTORICAL. This reads the PRE-wins More or Lessr file, which carried a
      // curated `peak_rating`. Today's generated file compares tournament wins
      // and no longer has that field, so the cast describes the input this
      // one-shot migration was written against, not the file on disk now.
      ...(mol
        ? (() => {
            const legacy = mol as unknown as {
              peak_rating?: number;
              peak_year?: number;
              prize_money: number;
            };
            return {
              peak_rating: legacy.peak_rating,
              prize_money: legacy.prize_money,
              ...(legacy.peak_year !== undefined
                ? { peak_year: legacy.peak_year }
                : {}),
            };
          })()
        : {}),
    };
  }

  // Every Wordle word that is not one of the 116 nicknames. Compared upper-cased
  // because the dictionary is upper-case and the nicknames are not.
  const poolNicks = new Set(Object.keys(players).map((n) => n.toUpperCase()));
  const extra_nicks = [
    ...new Set(
      Object.values(wordleJson.words)
        .flat()
        .filter((mot) => !poolNicks.has(mot.toUpperCase())),
    ),
  ].sort((a, b) => a.localeCompare(b, "en"));

  return {
    updated: DATA_DATE,
    players,
    extra_nicks,
    team_aliases: TEAM_ALIASES,
  };
}

function main() {
  const center = buildCenter();
  writeFileSync(
    "app/data/cs2/players.json",
    JSON.stringify(center, null, 2) + "\n",
  );
  console.log(
    `migrate: ${Object.keys(center.players).length} players, ` +
      `${center.extra_nicks.length} extra nicknames`,
  );
}

// Only writes when run directly, so importing it from the test is side-effect free.
if (process.argv[1]?.endsWith("migrate-center.ts")) main();
