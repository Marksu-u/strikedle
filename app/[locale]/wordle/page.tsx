import { Link } from "@/i18n/navigation";
import WordleGame from "./WordleGame";
import wordleData from "@/app/data/cs2/wordle.json";
import type { WordleData } from "@/lib/wordle/types";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import GameShell from "@/components/GameShell";
import OtherGames from "@/components/seo/OtherGames";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbNode, graph, videoGameNode } from "@/lib/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata("/wordle", locale);
}

export default async function CsWordlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Required for static rendering: without it this page opts into
  // dynamic rendering as soon as it reads a translation.
  setRequestLocale(locale);
  const t = await getTranslations("wordle");
  const nav = await getTranslations("nav");
  const seo = await getTranslations("seo");
  const site = await getTranslations("site");

  // The schema reads the same messages the page renders, so the markup and the
  // visible text cannot drift apart — a mismatch there is a manual action, not
  // just a lost rich result.
  const schema = graph([
    videoGameNode(
      "/wordle",
      locale,
      seo("wordle.title"),
      seo("wordle.description"),
    ),
    breadcrumbNode("/wordle", locale, site("name"), seo("wordle.title")),
  ]);

  return (
    <GameShell>
      <main className="flex flex-col items-center">
        <header className="mb-6 text-center">
          <h1>
            <span className="mb-2 block text-xs tracking-[0.25em] text-[color:var(--accent)] uppercase">
              {t("eyebrow")}
            </span>
            <span className="cs2-display text-foreground block text-4xl font-extrabold uppercase italic">
              {t("title")}
            </span>
          </h1>
        </header>

        <WordleGame data={wordleData as WordleData} />

        <OtherGames current="wordle" />

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[color:var(--accent-hot)] uppercase"
        >
          {nav("backToHub")}
        </Link>
      </main>
      <JsonLd data={schema} />
    </GameShell>
  );
}
