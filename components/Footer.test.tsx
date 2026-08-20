import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { LEGAL_PATHS } from "@/lib/seo";
import meta from "@/app/data/cs2/meta.json";
import Footer from "./Footer";

function renderIn(locale: string, messages: object) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Footer />
    </NextIntlClientProvider>,
  );
}

describe("Footer", () => {
  it.each([
    ["en", en, "Legal notice"],
    ["fr", fr, "Mentions légales"],
  ])("labels the legal notice in %s", (locale, messages, label) => {
    const { unmount } = renderIn(locale as string, messages as object);
    expect(screen.getByText(label as string)).toBeInTheDocument();
    unmount();
  });

  // LCEN requires the notice to be reachable from every page, so losing a link
  // here is a compliance bug, not a cosmetic one.
  it.each([
    ["en", en],
    ["fr", fr],
  ])("links every legal page (%s)", (locale, messages) => {
    const { container, unmount } = renderIn(
      locale as string,
      messages as object,
    );
    const hrefs = [...container.querySelectorAll("a")].map((a) =>
      a.getAttribute("href"),
    );
    for (const path of LEGAL_PATHS) {
      const expected = locale === "fr" ? `/fr${path}` : path;
      expect(hrefs).toContain(expected);
    }
    unmount();
  });

  // The pool is refreshed by hand, so a player has no other way to tell whether
  // a missing transfer is a bug or just an old scrape. Expected date is derived
  // from `meta.json` rather than written out, so the next refresh moves the date
  // without failing the test; both locales, because a line that renders only in
  // English is the same silence for half the readers.
  it.each([
    ["en", en],
    ["fr", fr],
  ])("dates the player pool (%s)", (locale, messages) => {
    const expected = new Intl.DateTimeFormat(locale as string, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${meta.updated}T00:00:00Z`));

    const { container, unmount } = renderIn(
      locale as string,
      messages as object,
    );
    expect(container.textContent).toContain(expected);
    // The ISO form reads as a database field, and would also mean the date
    // slipped past the formatter untranslated.
    expect(container.textContent).not.toContain(meta.updated);
    unmount();
  });

  it("names Valve so the fan-project disclaimer is on every page", () => {
    const { container, unmount } = renderIn("en", en);
    expect(container.textContent).toContain("Valve Corporation");
    unmount();
  });

  it.each([
    ["en", en],
    ["fr", fr],
  ])("never renders a raw translation key (%s)", (locale, messages) => {
    const { container, unmount } = renderIn(
      locale as string,
      messages as object,
    );
    expect(container.textContent ?? "").not.toMatch(
      /\b(footer|legalPages|share|guessr|wordle|moreOrLessr|game|menu|score|nav|modes|site|seo)\.[a-zA-Z]/,
    );
    unmount();
  });
});
