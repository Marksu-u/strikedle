import { describe, expect, it } from "vitest";
import meta from "@/app/data/cs2/meta.json";
import { ROUTES, SITE_URL } from "@/lib/seo";
import sitemap from "./sitemap";

const entries = sitemap();

describe("sitemap", () => {
  it("covers every route in both locales", () => {
    expect(entries).toHaveLength(ROUTES.length * 2);
  });

  // The puzzles rotate every day. Without lastModified the sitemap presents a
  // site that changes daily as one that has never changed at all.
  it("dates the daily routes from the pool refresh", () => {
    const daily = entries.filter((e) =>
      ["/wordle", "/guessr", "/more-or-lessr"].some((p) => e.url.endsWith(p)),
    );
    expect(daily).toHaveLength(6);
    for (const entry of daily) {
      expect(entry.lastModified).toEqual(new Date(`${meta.updated}T00:00:00Z`));
    }
  });

  it("leaves the legal pages undated", () => {
    const legal = entries.filter((e) => e.url.endsWith("/terms"));
    expect(legal).toHaveLength(2);
    for (const entry of legal) expect(entry.lastModified).toBeUndefined();
  });

  it("emits no URL outside SITE_URL", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith(SITE_URL)).toBe(true);
    }
  });
});
