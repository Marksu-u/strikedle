import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import GameNav from "./GameNav";

// `usePathname` from i18n/navigation returns the path WITHOUT the locale
// prefix, so one mock covers both /wordle and /fr/wordle.
const mockPathname = vi.fn(() => "/wordle");
vi.mock("@/i18n/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("@/i18n/navigation")>(
      "@/i18n/navigation",
    );
  return { ...actual, usePathname: () => mockPathname() };
});

function renderIn(locale: string, messages: object) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GameNav />
    </NextIntlClientProvider>,
  );
}

describe("GameNav", () => {
  it("links to all three games", () => {
    renderIn("en", en);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("marks the current game, and only it", () => {
    renderIn("en", en);
    const courant = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("aria-current") === "page");
    expect(courant).toHaveLength(1);
    expect(courant[0]).toHaveAttribute("href", "/wordle");
  });

  it("moves the marker when the route changes", () => {
    mockPathname.mockReturnValue("/guessr");
    renderIn("en", en);
    const courant = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("aria-current") === "page");
    expect(courant[0]).toHaveAttribute("href", "/guessr");
    mockPathname.mockReturnValue("/wordle");
  });

  it("labels the games in French too", () => {
    renderIn("fr", fr);
    expect(
      screen.getByRole("link", { name: /More or Lessr/i }),
    ).toBeInTheDocument();
  });
});
