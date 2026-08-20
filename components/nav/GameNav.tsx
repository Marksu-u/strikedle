"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { csModes } from "@/data/modes";
import ModeProgress from "@/components/daily/ModeProgress";

export default function GameNav() {
  const modes = useTranslations("modes");
  const nav = useTranslations("nav");
  // Returns the path WITHOUT the locale prefix, so this comparison works
  // identically under /wordle and /fr/wordle.
  const pathname = usePathname();

  return (
    <nav aria-label={nav("games")} className="flex flex-col gap-1">
      {csModes.map((mode) => {
        const active = pathname === mode.href;
        return (
          <Link
            key={mode.id}
            href={mode.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[var(--accent-soft)] text-[color:var(--accent)]"
                : "text-[color:var(--muted)] hover:bg-white/5 hover:text-[color:var(--accent)]"
            }`}
          >
            {modes(`${mode.id}.label`)}
            <ModeProgress modeId={mode.id} />
          </Link>
        );
      })}
    </nav>
  );
}
