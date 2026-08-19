import type { Category, Direction, Player } from "./types";

// The value being compared, per the active category.
export function statValue(player: Player, category: Category): number {
  return category === "wins" ? player.tournaments_won : player.prize_money;
}

// Is the challenger "more" or "less" than the anchor? The answer is right when
// the guessed direction matches. A tie counts as right either way.
export function isCorrectGuess(
  anchor: Player,
  challenger: Player,
  category: Category,
  direction: Direction,
): boolean {
  const a = statValue(anchor, category);
  const c = statValue(challenger, category);
  return direction === "more" ? c >= a : c <= a;
}

// The players whose value in this category is unambiguous.
//
// A tie scores as correct either way, so two players sharing a value are a free
// point and a flat face-off — both reels rolling to the same number.
//
// BOTH categories collide, for different reasons. Tournament wins are small
// integers: four players sit on 17, three on 19. Prize money looks unique but is
// curated to the nearest $100k, so it stacks just as hard — three players on
// $700k, three on $1.3M. Each pool loses nine of its twenty-eight.
//
// The survivor is the first of each value in the pool's own canonical order,
// which is arbitrary between equals but identical for everyone: the day's puzzle
// has to be the same puzzle for every player.
export function unambiguousPool(
  players: Player[],
  category: Category,
): Player[] {
  const seen = new Set<number>();
  return players.filter((player) => {
    const value = statValue(player, category);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
