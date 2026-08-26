import type { CSSProperties } from "react";
import GuessRow from "./GuessRow";
import { MAX_ATTEMPTS, type BoardState } from "@/lib/wordle/types";

export default function Board({
  board,
  maxLength,
  bounceRow = null,
  onFlipEnd,
}: {
  board: BoardState;
  maxLength: number;
  // Row to celebrate, or null. Decided by the game rather than here: whether a
  // win is worth celebrating depends on whether it just happened or is being
  // read back out of storage, and the board cannot tell the two apart.
  bounceRow?: number | null;
  onFlipEnd?: () => void; // the row just played has finished revealing
}) {
  // The current row index = number of guesses already submitted.
  const currentRow = board.guesses.length;
  return (
    <div
      className="mx-auto grid w-fit gap-1.5"
      // Uniform tile size whatever the length: keyed to the MAX length (not the
      // current one) so the widest grid still fits on screen. Capped at 3.5rem on
      // large screens, shrunk otherwise to stay in the viewport. Every tile (3→8
      // letters) therefore ends up the same size.
      style={
        {
          "--tile-size": `min(3.5rem, calc((100vw - 2.5rem - ${maxLength - 1} * 0.375rem) / ${maxLength}))`,
        } as CSSProperties
      }
    >
      {Array.from({ length: MAX_ATTEMPTS }).map((_, r) => {
        const submitted = r < currentRow;
        const isCurrent = r === currentRow && board.status === "playing";
        // The two never overlap: the bounce is what replaces the flip once the
        // cascade has ended, and running both would leave the row wearing
        // whichever animation React rendered last.
        const bounce = r === bounceRow;
        return (
          <GuessRow
            key={r}
            length={board.length}
            letters={
              submitted ? board.guesses[r] : isCurrent ? board.current : ""
            }
            states={submitted ? board.evaluations[r] : []}
            revealed={submitted}
            flip={r === board.justSubmitted && !bounce}
            bounce={bounce}
            shake={isCurrent && board.invalid}
            onFlipEnd={r === board.justSubmitted ? onFlipEnd : undefined}
          />
        );
      })}
    </div>
  );
}
