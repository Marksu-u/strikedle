import { draw } from "@/lib/daily/deck";
import { unambiguousPool } from "./compare";
import {
  TOTAL_ROUNDS,
  type Category,
  type MorelessData,
  type Player,
} from "./types";

// Deterministic player sequence for the day: same (day, category) → same order
// for everyone. The anti-repeat draw lives in lib/daily/deck, which guarantees a
// run never contains the same player twice and that two consecutive days never
// produce the same run.
export function dailySequence(
  data: MorelessData,
  day: number,
  category: Category,
): Player[] {
  const need = TOTAL_ROUNDS + 1;
  // Filtered BEFORE the draw, not after: dropping a tie from a drawn sequence
  // would leave the run short, and dropping it from the pool keeps every player
  // on the same eleven.
  const pool = unambiguousPool(data.players, category);
  if (pool.length < need) {
    throw new Error(
      `Pool insuffisant : ${pool.length} joueurs comparables, ${need} requis.`,
    );
  }
  return draw(pool, `mol-${category}`, day, need);
}

// PRACTICE sequence: a plain random shuffle, outside the rotation.
//
// It deliberately does not go through `draw`. The daily draw walks the epoch
// chain from the origin to guarantee its gaps; at 11 players a day that is
// ~10,000 iterations for the current day, amortised by the cache. A randomly
// picked day misses the cache every time — practice froze the UI for nearly a
// second on every "Play again" click.
//
// Practice scores nothing and need not match other players: none of those
// guarantees serve it.
export function practiceSequence(
  data: MorelessData,
  category: Category,
  rand: () => number = Math.random,
): Player[] {
  const need = TOTAL_ROUNDS + 1;
  const comparable = unambiguousPool(data.players, category);
  if (comparable.length < need) {
    throw new Error(
      `Pool insuffisant : ${comparable.length} joueurs comparables, ${need} requis.`,
    );
  }
  const pool = [...comparable];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, need);
}
