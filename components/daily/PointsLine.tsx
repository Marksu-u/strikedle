"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useDailyState, useHydrated } from "@/lib/daily/store";
import { useCountUp } from "@/lib/useCountUp";
import RollingNumber from "./RollingNumber";

type Props = {
  points: number;
  detail: string; // e.g. "found in 1 try, no hints"
  practice?: boolean;
  // Count the score up, rather than printing it. False for a result read back
  // from storage: a reload should show where the run stands, not replay a
  // celebration for a puzzle finished hours ago.
  fresh?: boolean;
};

// Score line shown under every result banner. In practice mode it says outright
// that nothing counts — otherwise the player thinks they are scoring.
export default function PointsLine({
  points,
  detail,
  practice,
  fresh = false,
}: Props) {
  const t = useTranslations("game");
  const score = useTranslations("score");
  const format = useFormatter();
  const { meta } = useDailyState();
  const hydrated = useHydrated();
  const counted = useCountUp(points, true, { animateOnMount: fresh });
  if (practice) {
    return (
      <p className="mt-2 text-xs tracking-[0.2em] text-[color:var(--muted)] uppercase">
        {t("practiceNotCounted")}
      </p>
    );
  }
  return (
    <>
      <p className="mt-2 text-sm">
        <span className="cs2-display text-xl font-extrabold text-[color:var(--accent)] italic">
          {/* The whole rendered string goes to the reels — the digits roll and
              the unit stays put, without splitting a translated message. */}
          <RollingNumber value={t("points", { points: Math.round(counted) })} />
        </span>
        <span className="ml-2 text-[color:var(--muted)]">{detail}</span>
      </p>
      {/* The line above is what this puzzle was worth. This one is what the
          player actually has — they differ, because the run total is banked
          through the streak multiplier. */}
      <p className="mt-1 flex items-baseline justify-center gap-2">
        <span className="text-[0.65rem] tracking-[0.2em] text-[color:var(--muted)] uppercase">
          {score("score")}
        </span>
        <span className="cs2-display text-lg font-extrabold text-[color:var(--foreground)] italic">
          {hydrated ? format.number(meta.runScore) : score("pending")}
        </span>
      </p>
    </>
  );
}
