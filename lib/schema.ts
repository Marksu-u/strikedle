import { SITE_NAME, pageUrl } from "@/lib/seo";

// Structured data for the three games and the hub. Every URL goes through
// `pageUrl`, the same helper the sitemap and the canonical tags use, so the
// schema can never claim a different host than the canonical does.

export type JsonLdNode = Record<string, unknown>;

export type FaqEntry = { q: string; a: string };

export function graph(nodes: JsonLdNode[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function websiteNode(locale: string) {
  return {
    "@type": "WebSite",
    "@id": `${pageUrl("/", locale)}#website`,
    name: SITE_NAME,
    url: pageUrl("/", locale),
    inLanguage: locale,
  };
}

export function videoGameNode(
  path: string,
  locale: string,
  name: string,
  description: string,
) {
  return {
    "@type": "VideoGame",
    "@id": `${pageUrl(path, locale)}#game`,
    name,
    description,
    url: pageUrl(path, locale),
    genre: "Puzzle",
    gamePlatform: "Web browser",
    applicationCategory: "GameApplication",
    isAccessibleForFree: true,
    inLanguage: locale,
  };
}

export function breadcrumbNode(
  path: string,
  locale: string,
  homeName: string,
  pageName: string,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: pageUrl("/", locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: pageUrl(path, locale),
      },
    ],
  };
}

export function faqNode(entries: FaqEntry[]) {
  return {
    "@type": "FAQPage",
    mainEntity: entries.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function itemListNode(
  locale: string,
  items: { path: string; name: string }[],
) {
  return {
    "@type": "ItemList",
    itemListElement: items.map(({ path, name }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      url: pageUrl(path, locale),
    })),
  };
}
