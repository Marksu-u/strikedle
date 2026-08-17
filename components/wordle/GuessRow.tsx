import Tile from "./Tile";
import type { TileState } from "@/lib/wordle/types";

type Props = {
  length: number;
  letters: string; // row contents ("" when empty)
  states: TileState[]; // coloriage ([] = tout empty)
  revealed: boolean; // row already submitted
  flip: boolean; // this row was just played: run the reveal
  shake: boolean; // invalid guess on the current row
  onFlipEnd?: () => void; // fired once this row has finished revealing
};

export default function GuessRow({
  length,
  letters,
  states,
  revealed,
  flip,
  shake,
  onFlipEnd,
}: Props) {
  return (
    <div
      className={`grid gap-1.5 ${shake ? "animate-[wordle-shake_0.4s_ease]" : ""}`}
      style={{ gridTemplateColumns: `repeat(${length}, var(--tile-size))` }}
    >
      {Array.from({ length }).map((_, i) => (
        <Tile
          key={i}
          index={i}
          letter={letters[i] ?? ""}
          state={states[i] ?? "empty"}
          revealed={revealed}
          flip={flip}
          // The last column carries the longest delay, so its end is the end of
          // the whole cascade.
          onFlipEnd={i === length - 1 ? onFlipEnd : undefined}
        />
      ))}
    </div>
  );
}
