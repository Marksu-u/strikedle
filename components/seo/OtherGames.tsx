import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { csModes } from "@/data/modes";

// Cross-links between the three games. Without it every path between them runs
// through the hub, which buries each game one click deeper than it needs to be.
export default function OtherGames({ current }: { current: string }) {
  const t = useTranslations("content");
  const modes = useTranslations("modes");
  const others = csModes.filter((mode) => mode.id !== current);

  return (
    <nav
      className="mx-auto mt-12 w-full max-w-2xl"
      aria-label={t("otherGames")}
    >
      <h2 className="text-xs font-semibold tracking-widest text-[color:var(--muted)] uppercase">
        {t("otherGames")}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-3">
        {others.map((mode) => (
          <li key={mode.id}>
            <Link
              href={mode.href}
              className="text-sm font-semibold text-[color:var(--accent-hot)]"
            >
              {modes(`${mode.id}.label`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
