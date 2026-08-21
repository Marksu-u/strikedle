"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { msUntilNextRotation } from "@/lib/daily/clock";
import { streakMultiplier } from "@/lib/daily/scoring";
import { useDailyState, useHydrated } from "@/lib/daily/store";

const LABEL =
  "text-[0.65rem] tracking-[0.2em] text-[color:var(--muted)] uppercase";

function Stat({
  label,
  value,
  layout,
}: {
  label: string;
  value: string;
  layout: Layout;
}) {
  // Centred column in the hub's wide grid; label-left/value-right in the rail,
  // where a 256px column is too narrow for "Next puzzle" to sit under a value
  // without wrapping.
  if (layout === "stack") {
    return (
      <div className="flex items-baseline justify-between gap-3">
        <span className={LABEL}>{label}</span>
        <span className="cs2-display text-base font-extrabold text-[color:var(--accent)] italic">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="cs2-display text-2xl font-extrabold text-[color:var(--accent)] italic">
        {value}
      </span>
      <span className={LABEL}>{label}</span>
    </div>
  );
}

// Countdown to the next rollover. Recomputed every second from the absolute
// clock, so no drift accumulates.
function useCountdown(): string {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msUntilNextRotation());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (ms === null) return "--:--:--";
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

type Layout = "row" | "stack";

export default function ScoreStrip({ layout = "row" }: { layout?: Layout }) {
  const t = useTranslations("score");
  const { meta } = useDailyState();
  const hydrated = useHydrated();
  const countdown = useCountdown();

  // Until hydration has happened we show a dash: better a blank than a wrong zero
  // that flickers into the real value.
  const v = (n: number) => (hydrated ? String(n) : t("pending"));
  const mult = streakMultiplier(meta.streak);

  return (
    <div
      className={`rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 ${
        layout === "row"
          ? "mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
          : "flex flex-col gap-2"
      }`}
    >
      <Stat
        layout={layout}
        label={t("streak")}
        value={
          hydrated
            ? `${meta.streak}${mult > 1 ? ` ×${mult}` : ""}`
            : t("pending")
        }
      />
      <Stat layout={layout} label={t("score")} value={v(meta.runScore)} />
      <Stat layout={layout} label={t("record")} value={v(meta.recordScore)} />
      <Stat layout={layout} label={t("nextPuzzle")} value={countdown} />
    </div>
  );
}
