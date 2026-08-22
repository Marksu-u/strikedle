// The single source every game file is generated from.
//
// Two halves with two different lifecycles, and the split is the whole point:
// `mergeScrape` overwrites the scraped half and never touches the curated one.

// Owned by the HLTV scrape. Overwritten wholesale on every refresh.
export type ScrapedFields = {
  id: number;
  real: string;
  nationality: string;
  age: number;
  team: string;
  teamRaw: string; // carries "(benched)"; `team` is the cleaned form
  hltvPrize: number; // HLTV's team-total/5 estimate — NOT `prize_money`
  top20: string | null; // "#1('19), #2('21)" — parsed by achievements.ts
  majors: number;
  majorMVP: number;
  mvps: number;
  trophies: string[];
  aggWins: string[];
  majorTrophies: string[];
  wins: number; // → `tournaments_won` in Guessr AND More or Lessr
};

// Owned by humans. The scrape does not carry these and must never clear them.
export type CuratedFields = {
  role: string[]; // closed vocabulary, see guessr_players.test.ts
  previous_teams: string[];
  // `prize_money` is the one curated More or Lessr stat, and holding it is what
  // puts a player in that pool: it is Esports Earnings' individual figure, not
  // HLTV's team-total/5 estimate, so the scrape cannot supply it.
  prize_money?: number;

  // No game reads these two any more. More or Lessr compared `peak_rating`
  // until it moved to tournament wins — a rating is re-published every few
  // months, so yesterday's puzzle stopped agreeing with today's source. Kept
  // because they are hand-curated and cost real work to gather; delete them
  // (and their entries in merge.ts) if nothing has claimed them by then.
  peak_rating?: number;
  peak_year?: number;
};

export type CenterPlayer = ScrapedFields & CuratedFields;

export type Center = {
  // Calendar date the FACTS are current to, and the only place that knows it.
  // `generate.ts` copies it into `meta.json` for the footer line; the three game
  // files still carry no date of their own.
  updated: string;
  // Keyed by nickname: uniqueness comes free and there is no `hltvNick` field
  // to drift from its own key.
  players: Record<string, CenterPlayer>;
  // Wordle-only nicknames — pros with no stats in the pool. A flat list rather
  // than stub player records, so a stub can never read as a player with holes.
  extra_nicks: string[];
  // Scrape spelling → canonical spelling. The Guessr team column compares by
  // exact text, so "HEROIC" and "Heroic" would be two different clubs.
  team_aliases: Record<string, string>;
};
