import type { MorelessData, Player } from "@/lib/more-or-lessr/types";
import { canonicalise } from "./sort";
import type { Center } from "./types";

// More or Lessr compares `tournaments_won` or `prize_money`. Wins come from the
// scrape and every player has them; `prize_money` is curated and only some do,
// so it alone decides who enters the pool — the game picks its category per run,
// and a record holding one figure and not the other would be undrawable half the
// time.
export function morelessFrom(center: Center): MorelessData {
  const players: Player[] = Object.entries(center.players)
    .filter(([, p]) => p.prize_money !== undefined)
    .map(([name, p]) => ({
      name,
      team: p.team,
      nationality: p.nationality,
      tournaments_won: p.wins,
      prize_money: p.prize_money!,
    }));

  return { game: "more-or-lessr", players: canonicalise(players) };
}
