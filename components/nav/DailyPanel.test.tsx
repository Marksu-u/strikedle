import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import DailyPanel from "./DailyPanel";

vi.mock("@/i18n/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("@/i18n/navigation")>(
      "@/i18n/navigation",
    );
  // `useRouter` as well: LanguageSwitcher calls it, and the real hook needs an
  // App Router context no unit test has.
  return {
    ...actual,
    usePathname: () => "/wordle",
    useRouter: () => ({ replace: () => {}, push: () => {} }),
  };
});

describe("DailyPanel", () => {
  it("shows the day's four figures", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DailyPanel />
      </NextIntlClientProvider>,
    );
    for (const label of ["Streak", "Score", "Record"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows the three game links exactly once each", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DailyPanel />
      </NextIntlClientProvider>,
    );
    // Three games plus the wordmark's link home.
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });
});
