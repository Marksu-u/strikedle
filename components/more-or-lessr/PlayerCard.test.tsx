import { act, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import type { Category, Player } from "@/lib/more-or-lessr/types";
import PlayerCard from "./PlayerCard";

// The stat values used to be formatted with a hardcoded "en-US", so a French
// player read "$1,500,000" and "1.12". Only a render in both locales sees it.

// The value renders as a reel of 0-9 per digit, so `textContent` is every digit
// of every reel. The aria-label carries the number the player actually reads.
function shown(container: HTMLElement): string {
  const reel = container.querySelector("[role='text']");
  return reel?.getAttribute("aria-label") ?? container.textContent ?? "";
}

const player: Player = {
  name: "flameZ",
  team: "Vitality",
  nationality: "France",
  tournaments_won: 24,
  prize_money: 1_500_000,
};

function renderIn(locale: string, messages: object, category: Category) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PlayerCard player={player} category={category} revealed />
    </NextIntlClientProvider>,
  );
}

describe("PlayerCard value formatting", () => {
  it("keeps the American forms in English", () => {
    const prize = renderIn("en", en, "prize");
    expect(shown(prize.container)).toContain("$1,500,000");
    prize.unmount();
  });

  it("shows a win count as a whole number, with no currency or decimals", () => {
    const { container, unmount } = renderIn("en", en, "wins");
    expect(shown(container)).toBe("24");
    unmount();
  });

  it("groups the prize the French way, with the symbol trailing", () => {
    const { container, unmount } = renderIn("fr", fr, "prize");
    const text = shown(container);
    // The group separator is a narrow no-break space whose codepoint moves
    // between ICU versions, so assert the shape rather than the exact string.
    expect(text).not.toContain("$1,500,000");
    expect(text).toMatch(/1\s?500\s?000\s?\$/u);
    unmount();
  });

  it("shows nothing but a mark while the value is hidden", () => {
    const { container, unmount } = render(
      <NextIntlClientProvider locale="fr" messages={fr}>
        <PlayerCard player={player} category="prize" revealed={false} />
      </NextIntlClientProvider>,
    );
    expect(container.textContent).toContain("?");
    expect(container.textContent).not.toMatch(/500/);
    unmount();
  });
});

describe("PlayerCard reveal", () => {
  afterEach(() => vi.useRealTimers());

  function card(revealed: boolean) {
    return (
      <NextIntlClientProvider locale="en" messages={en}>
        <PlayerCard player={player} category="wins" revealed={revealed} />
      </NextIntlClientProvider>
    );
  }

  it("counts up from zero instead of snapping to the value", async () => {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
    const { container, rerender } = render(card(false));
    expect(container.textContent).toContain("?");

    rerender(card(true));
    await act(async () => {
      vi.advanceTimersByTime(16);
    });
    // Near zero rather than exactly it: one frame in, the eased value is a
    // fraction of a trophy and rounds to 0 or 1 depending on the target.
    expect(Number(shown(container))).toBeLessThan(3);
  });

  it("is still climbing after a second, and lands on the value", async () => {
    // The point of the reveal is that it takes long enough to watch: a number
    // that arrives in 300ms is a flicker, not an animation.
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
    const { container, rerender } = render(card(false));
    rerender(card(true));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(shown(container)).not.toBe("24");

    await act(async () => {
      vi.advanceTimersByTime(1200);
    });
    expect(shown(container)).toBe("24");
  });

  it("follows the player when the card is reused for the next round", () => {
    // The anchor card has no key: React keeps ONE instance and swaps the player
    // underneath it. Holding the value in state froze it on the first player's
    // number for the rest of the run.
    const other: Player = { ...player, name: "donk", tournaments_won: 31 };
    const { container, rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <PlayerCard player={player} category="wins" revealed />
      </NextIntlClientProvider>,
    );
    expect(shown(container)).toBe("24");

    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <PlayerCard player={other} category="wins" revealed />
      </NextIntlClientProvider>,
    );
    expect(shown(container)).toBe("31");
    expect(shown(container)).not.toBe("24");
  });

  it("shows the value outright when it mounts already revealed", () => {
    // A resumed round must not replay the reveal for a number already read.
    const { container } = render(card(true));
    expect(shown(container)).toBe("24");
  });
});
