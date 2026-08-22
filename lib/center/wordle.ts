// The dictionary: every playable nickname, pooled players and Wordle-only names
// alike.

import type { WordleData } from "@/lib/wordle/types";
import type { Center } from "./types";

// Pinned, NOT derived from a minimum word count.
//
// Merging the pool nicknames introduces buckets at 2, 9, 10 and 11 letters. The
// 9/10/11 buckets are too thin to be playable, but the 2-letter bucket holds
// four words (IM, JL, JT, JW) — enough to look legitimate to any floor check,
// while adding a seventh length to a dictionary built for six and repeating far
// sooner than any other.
export const WORDLE_LENGTHS = [3, 4, 5, 6, 7, 8] as const;

// A Wordle word is typed on a keyboard of letters and digits. Nicknames carrying
// anything else (GeT_RiGhT, NBK-, huNter-) are players, not words.
const PLAYABLE = /^[A-Z0-9]+$/;

export function wordleFrom(center: Center): WordleData {
  const mots = new Set<string>();
  for (const nick of Object.keys(center.players)) mots.add(nick.toUpperCase());
  for (const nick of center.extra_nicks) mots.add(nick.toUpperCase());

  const words: Record<string, string[]> = {};
  for (const len of WORDLE_LENGTHS) {
    words[String(len)] = [...mots]
      .filter((m) => m.length === len && PLAYABLE.test(m))
      .sort((a, b) => a.localeCompare(b, "en"));
  }

  return { game: "cs2", words };
}
