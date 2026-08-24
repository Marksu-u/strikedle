import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/i18n/routing";
import { ROUTES, localePath, pageUrl } from "@/lib/seo";
import meta from "@/app/data/cs2/meta.json";

export default function sitemap(): MetadataRoute.Sitemap {
  // One entry per route AND per locale, each carrying the full set of language
  // alternates. Listing only one language would leave the others undiscovered
  // until a crawler stumbled on them.
  //
  // The route list comes from lib/seo.ts, the same one the metadata uses, so a
  // page cannot be referenced in one and forgotten in the other — and each route
  // carries its own frequency, since the legal pages do not rotate at 3am.
  return locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: pageUrl(route.path, locale),
      // The puzzles rotate every day; without this the sitemap presents a site
      // that changes daily as one that has never changed at all.
      lastModified:
        "daily" in route ? new Date(`${meta.updated}T00:00:00Z`) : undefined,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries([
          ...locales.map((l) => [l, pageUrl(route.path, l)]),
          ["x-default", pageUrl(route.path, defaultLocale)],
        ]),
      },
    })),
  );
}

// Kept for the metadata layer, which needs paths rather than absolute URLs.
export { localePath };
