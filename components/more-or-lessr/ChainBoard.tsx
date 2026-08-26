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
  // Every revealed number has finished climbing. `revealed` is true from the
  // click; this only becomes true two seconds later, once the count-up has
  // actually arrived. Everything that passes judgement waits for it.
  settled: boolean;
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
  settled,
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

  // Which card was clicked, and what it may say about it. Which one is
  // recovered from the direction: "more" = the challenger was clicked,
  // "less" = the anchor.
  //
  // "picked" is the whole point of the four states. The click has to be
  // acknowledged at once — otherwise the board looks like it swallowed it — but
  // acknowledging is not judging, and the card holds a neutral ring until the
  // numbers it is being judged against have finished climbing.
  function cardState(
    which: "anchor" | "challenger",
  ): "idle" | "picked" | "correct" | "wrong" {
    if (!revealed || lastGuess === null) return "idle";
    const picked = lastGuess === "more" ? "challenger" : "anchor";
    if (which !== picked) return "idle";
    // lastCorrect is checked as well as lastGuess: null is not "wrong". A
    // ternary on it alone marked an unjudged round with a cross.
    if (!settled || lastCorrect === null) return "picked";
    return lastCorrect ? "correct" : "wrong";
  }

  // A round that has been ANSWERED and watched out. Two conditions, for two
  // different reasons: round one is revealed with no guess behind it when the
  // board is rebuilt from a saved run and there is nothing to judge, and a
  // round still counting up has an answer that the player has not yet been
  // shown the evidence for.
  const verdict = settled && lastCorrect !== null;

  // The header score is the third thing that used to answer the round on the
  // click. The reducer banks the point on the guess — correctly, it is the
  // score — but printing it straight away tells the player they were right two
  // seconds before the numbers get there. Until the round settles, the header
  // shows the score as it stood going in.
  const shownScore = verdict || lastCorrect !== true ? score : score - 1;

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
          <span>{t("score", { score: shownScore })}</span>
        </div>
      </div>

      <p className="text-center text-sm text-[color:var(--muted)]">
        {/* Rich text rather than concatenation: the stat name stays highlighted
            without the component having to know where it sits in the sentence. */}
        {t.rich(instruction, {
          stat: (chunks) => <span className="text-foreground">{chunks}</span>,
        })}
      </p>

      {/* The two cards ride a rail. Each round it steps one notch to the left:
          the challenger takes the anchor's place and a fresh challenger arrives
          from off-screen, which is the chain made visible — the value you just
          read is the value you now compare against.

          Both columns are keyed on the round, so the pair re-enters every time
          the chain moves. Remounting the anchor costs nothing: its number is
          already final when it appears, and the count-up shows a value that
          mounts settled outright rather than replaying a reveal already watched.

          The badge is laid OVER the seam rather than sitting between the cards.
          Between them it would push the columns apart by its own width, and the
          rail's step would no longer be one card wide — which is exactly the
          distance the slide animates. Overhead, it is also the fixed point the
          movement is read against. */}
      <div className="relative w-full overflow-hidden">
        <div className="flex w-full items-stretch gap-3">
          {/* Ancre : valeur visible. La cliquer = parier que le challenger a MOINS.
              Round one is the exception — there is no value carried forward yet,
              so both sides stay face down and turn over together on the pick. */}
          <div key={`anchor-${round}`} className="mol-advance flex flex-1">
            <PlayerCard
              player={anchor}
              category={category}
              revealed={round > 1 || revealed}
              state={cardState("anchor")}
              onPick={revealed ? undefined : () => onGuess("less")}
              onRevealDone={handleRevealDone}
            />
          </div>
          {/* Challenger: hidden. Clicking it = betting it is MORE than the anchor. */}
          <div
            key={`challenger-${round}`}
            className="mol-advance-in flex flex-1"
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

        {/* Le badge ne prend jamais le clic : il couvre la couture, donc le bord
            intérieur des deux cartes. */}
        <div
          key={verdict ? `verdict-${round}` : `vs-${round}`}
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 bg-[var(--background)] ${
            verdict ? "mol-verdict" : ""
          } ${
            !verdict
              ? "border-[color:var(--border)]"
              : lastCorrect
                ? "border-[color:var(--wordle-correct)]"
                : "border-[color:var(--accent-hot)]"
          }`}
        >
          {verdict ? (
            <>
              <span
                className={`cs2-display text-lg leading-none font-extrabold italic ${
                  lastCorrect
                    ? "text-[color:var(--wordle-correct)]"
                    : "text-[color:var(--accent-hot)]"
                }`}
              >
                {score}
              </span>
              <span className="text-[0.6rem] leading-none text-[color:var(--muted)]">
                /{round}
              </span>
            </>
          ) : (
            <span className="cs2-display text-base font-extrabold text-[color:var(--accent-hot)] italic">
              VS
            </span>
          )}
        </div>
      </div>

      {/* Le badge est décoratif : le verdict se dit ici, une fois, pour qui
          n'a pas l'image. */}
      <p role="status" className="sr-only">
        {verdict ? (lastCorrect ? t("correct") : t("wrong")) : ""}
      </p>
    </div>
  );
}
