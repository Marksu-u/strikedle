import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import type { Category, Player } from "@/lib/more-or-lessr/types";
import ChainBoard from "./ChainBoard";

// This board carried four untranslated strings for a while, one of them a French
// sentence rendered on the English site. Nothing static could see it: the strings
// were literals in JSX, so only a render in both languages catches the class.

const player = (name: string): Player => ({
  name,
  team: "Vitality",
  nationality: "France",
  tournaments_won: 28,
  prize_money: 1_500_000,
});

function renderIn(locale: string, messages: object, category: Category) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ChainBoard
        anchor={player("dupreeh")}
        challenger={player("flameZ")}
        category={category}
        round={3}
        score={2}
        revealed={false}
        lastGuess={null}
        lastCorrect={null}
        onGuess={() => {}}
        onRevealComplete={() => {}}
      />
    </NextIntlClientProvider>,
  );
}

describe("ChainBoard", () => {
  it.each([
    ["en", en, "Round 3/10", "Click the player with more tournament wins"],
    ["fr", fr, "Manche 3/10", "Clique sur le joueur avec le plus de trophées"],
  ])(
    "renders the round and the instruction in %s",
    (locale, m, round, hint) => {
      const { container, unmount } = renderIn(
        locale as string,
        m as object,
        "wins",
      );
      expect(screen.getByText(round as string)).toBeInTheDocument();
      // The stat name sits in its own <span>, so match across element boundaries.
      expect(container.textContent).toContain(hint as string);
      unmount();
    },
  );

  it.each([
    ["en", en, "prize money"],
    ["fr", fr, "prize money"],
  ])("names the prize category in %s", (locale, m, stat) => {
    const { container, unmount } = renderIn(
      locale as string,
      m as object,
      "prize",
    );
    expect(container.textContent).toContain(stat as string);
    unmount();
  });

  it.each([
    ["en", en],
    ["fr", fr],
  ])("never renders a raw translation key (%s)", (locale, m) => {
    for (const category of ["wins", "prize"] as const) {
      const { container, unmount } = renderIn(
        locale as string,
        m as object,
        category,
      );
      expect(container.textContent ?? "").not.toMatch(
        /\b(share|guessr|wordle|moreOrLessr|game|menu|score|nav|modes|site)\.[a-zA-Z]/,
      );
      unmount();
    }
  });
});

describe("the opening face-off", () => {
  function board(round: number, revealed: boolean) {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ChainBoard
          anchor={{ ...player("dupreeh"), tournaments_won: 21 }}
          challenger={{ ...player("flameZ"), tournaments_won: 34 }}
          category="wins"
          round={round}
          score={0}
          revealed={revealed}
          lastGuess={null}
          lastCorrect={null}
          onGuess={() => {}}
          onRevealComplete={() => {}}
        />
      </NextIntlClientProvider>,
    );
  }

  function values(container: HTMLElement): string[] {
    return [...container.querySelectorAll("[role='text']")].map(
      (e) => e.getAttribute("aria-label") ?? "",
    );
  }

  it("hides BOTH values in round one — there is nothing to compare against yet", () => {
    const { container } = board(1, false);
    expect(values(container)).toHaveLength(0);
    expect(container.textContent).not.toContain("21");
    expect(container.textContent).not.toContain("34");
  });

  it("turns both over together when round one is played", () => {
    const { container } = board(1, true);
    expect(values(container)).toEqual(["21", "34"]);
  });

  it("keeps the anchor visible from round two, since it is the value carried forward", () => {
    const { container } = board(2, false);
    expect(values(container)).toEqual(["21"]);
  });
});

describe("what makes the chain advance", () => {
  afterEach(() => vi.useRealTimers());

  function board(
    round: number,
    revealed: boolean,
    onRevealComplete: () => void,
  ) {
    return (
      <NextIntlClientProvider locale="en" messages={en}>
        <ChainBoard
          anchor={{ ...player("dupreeh"), tournaments_won: 21 }}
          challenger={{ ...player("flameZ"), tournaments_won: 34 }}
          category="wins"
          round={round}
          score={0}
          revealed={revealed}
          lastGuess={null}
          lastCorrect={null}
          onGuess={() => {}}
          onRevealComplete={onRevealComplete}
        />
      </NextIntlClientProvider>
    );
  }

  function useReelClock() {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
  }

  it("says nothing while the numbers are still climbing", async () => {
    useReelClock();
    const done = vi.fn();
    const { rerender } = render(board(2, false, done));
    rerender(board(2, true, done));

    await act(async () => {
      vi.advanceTimersByTime(1900);
    });
    // The whole point: at 1900ms the value has not reached its target, and
    // nothing may move. A fixed delay used to fire here regardless.
    expect(done).not.toHaveBeenCalled();
  });

  it("reports once the number has landed", async () => {
    useReelClock();
    const done = vi.fn();
    const { rerender } = render(board(2, false, done));
    rerender(board(2, true, done));

    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("waits for BOTH numbers in round one, not just the challenger", async () => {
    useReelClock();
    const done = vi.fn();
    const { rerender } = render(board(1, false, done));
    rerender(board(1, true, done));

    await act(async () => {
      vi.advanceTimersByTime(1900);
    });
    expect(done).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(done).toHaveBeenCalledTimes(1);
  });
});
