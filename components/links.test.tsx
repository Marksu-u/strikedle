import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { linkTo, mailTo, pageTo, telTo } from "./links";

function renderIn(locale: string, messages: object, node: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );
}

describe("legal link helpers", () => {
  it("addresses an email", () => {
    render(<>{mailTo("support@strikedle.com")("write to us")}</>);
    expect(screen.getByText("write to us")).toHaveAttribute(
      "href",
      "mailto:support@strikedle.com",
    );
  });

  it("dials a telephone number without its formatting", () => {
    render(<>{telTo("+1 (555) 010-1234")("call")}</>);
    expect(screen.getByText("call")).toHaveAttribute(
      "href",
      "tel:+15550101234",
    );
  });

  it("opens an external link without leaking the referrer", () => {
    render(<>{linkTo("https://www.cnil.fr/")("cnil.fr")}</>);
    const anchor = screen.getByText("cnil.fr");
    expect(anchor).toHaveAttribute("href", "https://www.cnil.fr/");
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor.getAttribute("rel")).toContain("noopener");
    expect(anchor.getAttribute("rel")).toContain("noreferrer");
  });

  it.each([
    ["en", en, "/privacy"],
    ["fr", fr, "/fr/privacy"],
  ])(
    "keeps a cross-reference in the reader's language (%s)",
    (locale, messages, expected) => {
      const { unmount } = renderIn(
        locale as string,
        messages as object,
        <>{pageTo("/privacy")("privacy policy")}</>,
      );
      expect(screen.getByText("privacy policy")).toHaveAttribute(
        "href",
        expected as string,
      );
      unmount();
    },
  );
});
