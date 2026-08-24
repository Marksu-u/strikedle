import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { faqNode } from "@/lib/schema";
import GameContent from "./GameContent";

function renderIn(locale: string, messages: object) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GameContent section="home" />
    </NextIntlClientProvider>,
  );
}

describe("GameContent", () => {
  it.each([
    ["en", en, "Frequently asked questions"],
    ["fr", fr, "Questions fréquentes"],
  ])("renders the FAQ heading in %s", (locale, messages, heading) => {
    const { unmount } = renderIn(locale as string, messages as object);
    expect(
      screen.getByRole("heading", { name: heading as string }),
    ).toBeInTheDocument();
    unmount();
  });

  it.each([
    ["en", en],
    ["fr", fr],
  ])("renders every FAQ question and answer (%s)", (locale, messages) => {
    const { container, unmount } = renderIn(
      locale as string,
      messages as object,
    );
    for (const { q, a } of (messages as typeof en).content.home.faq) {
      expect(container.textContent).toContain(q);
      expect(container.textContent).toContain(a);
    }
    unmount();
  });

  it("gives the FAQ questions their own heading level", () => {
    const { unmount } = renderIn("en", en);
    expect(
      screen.getByRole("heading", { level: 3, name: en.content.home.faq[0].q }),
    ).toBeInTheDocument();
    unmount();
  });

  // The FAQPage schema is built from the same `content.home.faq` entries this
  // component renders. Markup that promises a question the page does not show
  // is a manual action, not merely a lost rich result, so the two are pinned
  // together rather than trusted to stay in step.
  it.each([
    ["en", en],
    ["fr", fr],
  ])(
    "renders every question the FAQ schema declares (%s)",
    (locale, messages) => {
      const declared = faqNode(
        (messages as typeof en).content.home.faq,
      ).mainEntity.map((q) => q.name);
      const { container, unmount } = renderIn(
        locale as string,
        messages as object,
      );
      for (const name of declared) {
        expect(container.textContent).toContain(name);
      }
      unmount();
    },
  );

  it.each([
    ["en", en],
    ["fr", fr],
  ])("never renders a raw translation key (%s)", (locale, messages) => {
    const { container, unmount } = renderIn(
      locale as string,
      messages as object,
    );
    expect(container.textContent ?? "").not.toMatch(
      /\b(content|footer|legalPages|share|guessr|wordle|moreOrLessr|game|menu|score|nav|modes|site|seo)\.[a-zA-Z]/,
    );
    unmount();
  });
});
