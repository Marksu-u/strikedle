import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/seo";
import {
  breadcrumbNode,
  faqNode,
  graph,
  itemListNode,
  videoGameNode,
  websiteNode,
} from "@/lib/schema";

describe("JSON-LD builders", () => {
  it("wraps nodes in a single schema.org graph", () => {
    const g = graph([websiteNode("en")]);
    expect(g["@context"]).toBe("https://schema.org");
    expect(g["@graph"]).toHaveLength(1);
  });

  it("describes a game as free and browser-based", () => {
    const node = videoGameNode("/wordle", "en", "CS2 Wordle", "Guess the tag.");
    expect(node["@type"]).toBe("VideoGame");
    expect(node.isAccessibleForFree).toBe(true);
    expect(node.gamePlatform).toBe("Web browser");
    expect(node.inLanguage).toBe("en");
  });

  it("builds an FAQ node from question/answer pairs", () => {
    const node = faqNode([{ q: "Is it free?", a: "Yes." }]);
    expect(node["@type"]).toBe("FAQPage");
    expect(node.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "Is it free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes." },
      },
    ]);
  });

  it("positions breadcrumb items from one, not zero", () => {
    const node = breadcrumbNode("/guessr", "en", "Strikedle", "CS2 Guessr");
    expect(node.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });

  it("lists the games in order", () => {
    const node = itemListNode("en", [
      { path: "/wordle", name: "CS2 Wordle" },
      { path: "/guessr", name: "CS2 Guessr" },
    ]);
    expect(node.itemListElement).toHaveLength(2);
    expect(node.itemListElement[0].position).toBe(1);
  });

  // A schema URL on a different host than the canonical is a contradiction a
  // crawler resolves by trusting neither. Everything must come from pageUrl.
  it("emits no URL outside SITE_URL", () => {
    const g = graph([
      websiteNode("fr"),
      videoGameNode("/wordle", "fr", "Wordle CS2", "Devine le pseudo."),
      breadcrumbNode("/wordle", "fr", "Strikedle", "Wordle CS2"),
      itemListNode("fr", [{ path: "/guessr", name: "Guessr CS2" }]),
    ]);
    const urls = [...JSON.stringify(g).matchAll(/"(https?:\/\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter((u) => u !== "https://schema.org");
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url.startsWith(SITE_URL)).toBe(true);
  });
});
