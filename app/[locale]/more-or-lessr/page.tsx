import { Link } from "@/i18n/navigation";
import morelessData from "@/app/data/cs2/more-or-lessr.json";
import MorelessGame from "./MorelessGame";
import type { MorelessData } from "@/lib/more-or-lessr/types";
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
  return buildMetadata("/more-or-lessr", locale);
}

export default async function CsMoreOrLessrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Required for static rendering: without it this page opts into
  // dynamic rendering as soon as it reads a translation.
  setRequestLocale(locale);
  const t = await getTranslations("moreOrLessr");
  const nav = await getTranslations("nav");
  const seo = await getTranslations("seo");
  const site = await getTranslations("site");

  const schema = graph([
    videoGameNode(
      "/more-or-lessr",
      locale,
      seo("more-or-lessr.title"),
      seo("more-or-lessr.description"),
    ),
    breadcrumbNode(
      "/more-or-lessr",
      locale,
      site("name"),
      seo("more-or-lessr.title"),
    ),
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

        <MorelessGame data={morelessData as MorelessData} />

        <OtherGames current="more-or-lessr" />

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
