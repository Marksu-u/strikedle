"use client";

import { Link } from "@/i18n/navigation";
import ScoreStrip from "@/components/daily/ScoreStrip";
import DayShare from "@/components/daily/DayShare";
import LanguageSwitcher from "@/components/daily/LanguageSwitcher";
import GameNav from "./GameNav";

// The day at a glance: where to go next, and how the run is going. Lives in the
// MenuDrawer on the game pages; the hub shows the same parts inline.
export default function DailyPanel() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="cs2-display text-foreground text-2xl font-extrabold uppercase italic"
      >
        Strike<span className="cs2-outline">dle</span>
      </Link>

      <GameNav />

      <ScoreStrip layout="stack" />

      <DayShare layout="stack" />

      {/* Plain div so the inline-flex switcher keeps its intrinsic width
          instead of being stretched by the surrounding flex column. */}
      <div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
