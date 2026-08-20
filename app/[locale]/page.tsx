import GameModeCard from "@/components/GameModeCard";
import ScoreStrip from "@/components/daily/ScoreStrip";
import DayShare from "@/components/daily/DayShare";
import ModeProgress from "@/components/daily/ModeProgress";
import { csModes } from "@/data/modes";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LanguageSwitcher from "@/components/daily/LanguageSwitcher";
import GameContent from "@/components/seo/GameContent";
import JsonLd from "@/components/seo/JsonLd";
import {
  faqNode,
  graph,
  itemListNode,
  websiteNode,
  type FaqEntry,
} from "@/lib/schema";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const modes = await getTranslations("modes");
  const content = await getTranslations("content");
  const seo = await getTranslations("seo");

  const faq = content.raw("home.faq") as FaqEntry[];
  const schema = graph([
    websiteNode(locale),
    itemListNode(
      locale,
      csModes.map((mode) => ({
        path: mode.href,
        name: seo(`${mode.id}.title`),
      })),
    ),
    faqNode(faq),
  ]);

  return (
    <main className="cs2-hero relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-12 sm:px-10">
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1>
              <span className="mb-2.5 block text-xs tracking-[0.25em] text-[color:var(--muted)] uppercase">
                {t("eyebrow")}
              </span>
              <span className="cs2-display text-foreground block text-5xl leading-[0.9] font-extrabold uppercase italic sm:text-6xl">
                {/* Not a message: a proper noun reads the same in every
                    language, and cataloguing it invites translation. */}
                Strike<span className="cs2-outline">dle</span>
              </span>
            </h1>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <LanguageSwitcher />
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/30 text-[#0e0f12]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            </span>
          </div>
        </div>

        {/* The gap was already reserved at mt-3.5 plus one line of text-sm, so
            filling it costs no layout shift. */}
        <p className="mt-3.5 h-5 text-sm text-[color:var(--muted)]">
          {content("home.tagline")}
        </p>

        <ScoreStrip />
        <DayShare />

        <h2 className="cs2-display text-foreground mt-6 text-2xl font-extrabold uppercase italic">
          {content("home.heading")}
        </h2>

        <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {csModes.map((mode) => (
            <GameModeCard
              key={mode.id}
              label={modes(`${mode.id}.label`)}
              description={modes(`${mode.id}.description`)}
              href={mode.href}
              icon={mode.icon}
              progress={<ModeProgress modeId={mode.id} />}
            />
          ))}
        </div>

        <GameContent section="home" />
        <JsonLd data={schema} />
      </div>
    </main>
  );
}
