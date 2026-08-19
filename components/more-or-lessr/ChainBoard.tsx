"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import PlayerCard from "@/components/more-or-lessr/PlayerCard";
import {
  TOTAL_ROUNDS,
  type Category,
  type Direction,
  type Player,
} from "@/lib/more-or-lessr/types";

type Props = {
  anchor: Player; // reference value, always visible
  challenger: Player; // hidden value to guess
  category: Category;
  round: number;
  score: number;
  revealed: boolean; // round played: the challenger's value is shown
  lastGuess: Direction | null;
  lastCorrect: boolean | null;
  onGuess: (direction: Direction) => void;
  onRevealComplete: () => void; // every revealed number has finished counting
};

export default function ChainBoard({
  anchor,
  challenger,
  category,
  round,
  score,
  revealed,
  lastGuess,
  lastCorrect,
  onGuess,
  onRevealComplete,
}: Props) {
  const t = useTranslations("moreOrLessr");
  // Literal keys either side of the branch, never a template: a key built from a
  // variable renders as its own raw path when it misses, and only a render test
  // sees it. The two sentences are separate messages rather than one with the
  // stat name interpolated, so each language can agree the adjective with the
  // noun it actually carries.
  const label = category === "wins" ? t("tournamentWins") : t("prizeMoney");
  const instruction = category === "wins" ? "pickMoreWins" : "pickHigherPrize";

  // Round one flips both cards, so two numbers have to land before the chain
  // may move; from round two only the challenger animates. Counted in refs, not
  // state: tallying completions must not itself cause a render.
  const expected = round === 1 ? 2 : 1;
  const landed = useRef(0);
  useEffect(() => {
    landed.current = 0;
  }, [round]);
  function handleRevealDone() {
    // A card restored mid-round reports "done" the moment it mounts, having
    // nothing to animate. That is not this round's reveal — only count it once
    // the round has actually been played.
    if (!revealed) return;
    landed.current += 1;
    if (landed.current >= expected) onRevealComplete();
  }

  // The green/red flash applies to the clicked card. Which one is recovered from
  // the direction: "more" = the challenger was clicked, "less" = the anchor.
  function cardState(
    which: "anchor" | "challenger",
  ): "idle" | "correct" | "wrong" {
    if (!revealed || lastGuess === null) return "idle";
    const picked = lastGuess === "more" ? "challenger" : "anchor";
    if (which !== picked) return "idle";
    return lastCorrect ? "correct" : "wrong";
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <div className="flex w-full flex-col items-center gap-3">
        {/* The run at a glance: which round you are on and how many are left,
            read off the shape instead of parsed out of "3/10". */}
        <ol
          aria-label={t("round", { round, total: TOTAL_ROUNDS })}
          className="flex items-center gap-1.5"
        >
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
            const n = i + 1;
            const done = n < round;
            const current = n === round;
            return (
              <li
                key={n}
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all ${
                  current
                    ? "w-6 bg-[var(--accent)]"
                    : done
                      ? "w-3 bg-[color:var(--accent-hot)]/60"
                      : "w-3 bg-[color:var(--border)]"
                }`}
              />
            );
          })}
        </ol>
        <div className="flex w-full items-center justify-between text-xs tracking-widest text-[color:var(--muted)] uppercase">
          <span>{t("round", { round, total: TOTAL_ROUNDS })}</span>
          <span className="text-[color:var(--accent)]">{label}</span>
          <span>{t("score", { score })}</span>
        </div>
      </div>

      <p className="text-center text-sm text-[color:var(--muted)]">
        {/* Rich text rather than concatenation: the stat name stays highlighted
            without the component having to know where it sits in the sentence. */}
        {t.rich(instruction, {
          stat: (chunks) => <span className="text-foreground">{chunks}</span>,
        })}
      </p>

      <div className="flex w-full items-stretch gap-3">
        {/* Ancre : valeur visible. La cliquer = parier que le challenger a MOINS.
            Round one is the exception — there is no value carried forward yet,
            so both sides stay face down and turn over together on the pick. */}
        <PlayerCard
          player={anchor}
          category={category}
          revealed={round > 1 || revealed}
          state={cardState("anchor")}
          onPick={revealed ? undefined : () => onGuess("less")}
          onRevealDone={handleRevealDone}
        />
        <span className="cs2-display self-center text-xl font-extrabold text-[color:var(--accent-hot)] italic">
          VS
        </span>
        {/* Challenger: hidden. Clicking it = betting it is MORE than the anchor.
            key sur le pseudo : rejoue l'animation d'entrée à chaque challenger. */}
        <div
          key={challenger.name}
          className="flex flex-1 animate-[mol-slide-in_0.25s_ease]"
        >
          <PlayerCard
            player={challenger}
            category={category}
            revealed={revealed}
            state={cardState("challenger")}
            onPick={revealed ? undefined : () => onGuess("more")}
            onRevealDone={handleRevealDone}
          />
        </div>
      </div>
    </div>
  );
}
