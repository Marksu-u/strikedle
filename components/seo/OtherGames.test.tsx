import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import OtherGames from "./OtherGames";

function hrefs(locale: string, messages: object, current: string) {
  const { container } = render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OtherGames current={current} />
    </NextIntlClientProvider>,
  );
  return [...container.querySelectorAll("a")].map((a) =>
    a.getAttribute("href"),
  );
}

describe("OtherGames", () => {
  it("links the two modes that are not the current one", () => {
    expect(hrefs("en", en, "wordle")).toEqual(["/guessr", "/more-or-lessr"]);
  });

  it("never links the page it is on", () => {
    expect(hrefs("en", en, "guessr")).not.toContain("/guessr");
  });

  // A link that drops the locale prefix sends a French player to the English
  // page, which is also a duplicate-content signal to a crawler.
  it("keeps the locale prefix in French", () => {
    expect(hrefs("fr", fr, "wordle")).toEqual([
      "/fr/guessr",
      "/fr/more-or-lessr",
    ]);
  });
});
