import type { CSSProperties } from "react";
import {
  BOUNCE_MS,
  BOUNCE_STAGGER_MS,
  FLIP_MS,
  FLIP_STAGGER_MS,
} from "@/lib/wordle/timing";
import type { TileState } from "@/lib/wordle/types";

// State colours derived from the CS2 theme tokens (see cs2-theme.css).
const STATE_CLASS: Record<TileState, string> = {
  empty: "border-[color:var(--border)] bg-transparent text-foreground",
  absent:
    "border-transparent bg-[var(--wordle-absent)] text-[color:var(--muted)]",
  present: "border-transparent bg-[var(--wordle-present)] text-black",
  correct: "border-transparent bg-[var(--wordle-correct)] text-black",
};

// The same colours again, as custom properties this time. The flip keyframes
// read them at mid-turn, which is the whole point: the class above paints the
// tile from the first frame, and the animation withholds that paint until the
// tile is edge-on. One keyframe therefore serves all three states.
//
// The class is not redundant with it — it is what the tile wears once the
// animation is over, and what it wears when there is no animation at all
// (a reloaded board, or a player who asked for less movement).
const STATE_VARS: Record<TileState, CSSProperties> = {
  empty: {},
  absent: { "--tile-bg": "var(--wordle-absent)", "--tile-fg": "var(--muted)" },
  present: { "--tile-bg": "var(--wordle-present)", "--tile-fg": "#000" },
  correct: { "--tile-bg": "var(--wordle-correct)", "--tile-fg": "#000" },
} as Record<TileState, CSSProperties>;

type Props = {
  letter: string;
  state: TileState;
  index: number; // column: drives the cascading flip delay (left→right)
  revealed: boolean; // submitted row: wears its colour
  // Runs the flip. Separate from `revealed` because a row keeps its colour for
  // the rest of the game and must not re-flip every time the board renders —
  // least of all on a reload, where every past row would cascade again.
  flip: boolean;
  bounce: boolean; // winning row, cascade over: the victory wave
  onFlipEnd?: () => void; // last column only: the cascade is over
};

export default function Tile({
  letter,
  state,
  index,
  revealed,
  flip,
  bounce,
  onFlipEnd,
}: Props) {
  // Mutually exclusive by construction: a row bounces only once its flip has
  // ended, and a tile being typed into has been neither submitted nor won.
  const motion = flip
    ? "wordle-tile-flip"
    : bounce
      ? "wordle-tile-bounce"
      : !revealed && letter
        ? "wordle-tile-pop"
        : "";

  // Longhands, so they override the duration/delay of whatever `animation`
  // shorthand the class carries.
  const timing: CSSProperties = flip
    ? {
        animationDuration: `${FLIP_MS}ms`,
        animationDelay: `${index * FLIP_STAGGER_MS}ms`,
      }
    : bounce
      ? {
          animationDuration: `${BOUNCE_MS}ms`,
          animationDelay: `${index * BOUNCE_STAGGER_MS}ms`,
        }
      : {};

  return (
    <div
      className={`flex h-[var(--tile-size)] w-[var(--tile-size)] items-center justify-center rounded-md border-2 text-[calc(var(--tile-size)*0.45)] font-bold uppercase ${STATE_CLASS[state]} ${motion}`}
      style={{ ...STATE_VARS[state], ...timing }}
      onAnimationEnd={flip ? onFlipEnd : undefined}
    >
      {letter}
    </div>
  );
}
