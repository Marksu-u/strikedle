import type { GuessrData } from "@/lib/guessr/types";
import { achievementsFor } from "./achievements";
import { canonicalise } from "./sort";
import type { Center } from "./types";

export function guessrFrom(center: Center): GuessrData {
  const players = Object.entries(center.players).map(([name, p]) => ({
    name,
    nationality: p.nationality,
    current_team: p.team,
    // Five players returned to a former club. The centre keeps the true
    // history, but the grid compares "current" and "former" as separate
    // columns: left in both, the club would read as current AND former at once.
    previous_teams: p.previous_teams.filter((t) => t !== p.team),
    role: p.role,
    age: p.age,
    majors: p.majors,
    tournaments_won: p.wins,
    achievements: achievementsFor(p),
  }));

  return { game: "guessr", players: canonicalise(players) };
}
