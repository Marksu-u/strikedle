"use client";

import { useFormatter } from "next-intl";
import { statValue } from "@/lib/more-or-lessr/compare";
import { useCountUp } from "@/lib/useCountUp";
import RollingNumber from "@/components/daily/RollingNumber";
import { nationToFlag } from "@/lib/more-or-lessr/flags";
import type { Category, Player } from "@/lib/more-or-lessr/types";

type Props = {
  player: Player;
  category: Category;
  revealed: boolean; // affiche la valeur seulement si vrai
  state?: "idle" | "correct" | "wrong"; // feedback flash after the reveal
  onPick?: () => void; // absent → card not clickable (disabled)
  onRevealDone?: () => void; // fired once the value has finished counting up
};

// You answer by CLICKING the card you think is bigger (see ChainBoard).
export default function PlayerCard({
  player,
  category,
  revealed,
  state = "idle",
  onPick,
  onRevealDone,
}: Props) {
  const format = useFormatter();

  // Both figures are whole numbers formatted in the player's locale, so a French
  // player reads "1 500 000 $" rather than the American form. `narrowSymbol`
  // gives the bare "$": the standard French rendering of USD is "$US", but the
  // French catalogue already writes "$" and the scene deals in dollars only.
  //
  // Rounded because the value arrives mid-count-up: a trophy count has no
  // fractional part to show on its way to the total.
  function formatValue(v: number): string {
    const n = Math.round(v);
    return category === "wins"
      ? format.number(n)
      : format.number(n, {
          style: "currency",
          currency: "USD",
          currencyDisplay: "narrowSymbol",
          maximumFractionDigits: 0,
        });
  }

  // Counts up over two seconds when the card flips: the reveal is the moment
  // the round turns on, and a number that simply appears throws it away.
  const shown = useCountUp(statValue(player, category), revealed, {
    onDone: onRevealDone,
  });

  const ring =
    state === "correct"
      ? "border-[color:var(--wordle-correct)]"
      : state === "wrong"
        ? "border-[color:var(--accent-hot)]"
        : "border-[color:var(--border)] enabled:hover:border-[color:var(--accent)]";

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!onPick}
      className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] p-6 text-center transition disabled:cursor-default ${ring}`}
    >
      <span className="text-3xl">{nationToFlag(player.nationality)}</span>
      <span className="cs2-display text-foreground text-2xl font-extrabold uppercase italic">
        {player.name}
      </span>
      <span className="text-xs tracking-widest text-[color:var(--muted)] uppercase">
        {player.team}
      </span>
      {/* The value sits on its own pill under the name: once it is rolling it
          needs an edge to roll against, not open background. */}
      <span
        className={`mt-1 flex min-h-8 items-center rounded-lg px-3 py-1 text-xl font-bold ${
          revealed
            ? "bg-[var(--accent-soft)] text-[color:var(--accent)] tabular-nums"
            : "text-[color:var(--muted)]"
        }`}
        aria-live="polite"
      >
        {revealed ? <RollingNumber value={formatValue(shown)} /> : "?"}
      </span>
    </button>
  );
}
