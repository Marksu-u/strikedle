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
        settled={false}
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
          settled={false}
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
          settled={false}
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

describe("what the board says once the round is answered", () => {
  function answered(
    lastCorrect: boolean | null,
    { revealed = true, settled = true } = {},
  ) {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ChainBoard
          anchor={{ ...player("dupreeh"), tournaments_won: 21 }}
          challenger={{ ...player("flameZ"), tournaments_won: 34 }}
          category="wins"
          round={3}
          score={2}
          revealed={revealed}
          settled={settled}
          // The reducer sets the two together and clears them together, so a
          // round with no verdict has no guess either.
          lastGuess={lastCorrect === null ? null : "more"}
          lastCorrect={lastCorrect}
          onGuess={() => {}}
          onRevealComplete={() => {}}
        />
      </NextIntlClientProvider>,
    );
  }

  // Two marks share the verdict animation: the tick on the card that was
  // clicked, and the badge over the seam. They are told apart by where they
  // sit — the tick is inside its card, the badge belongs to neither.
  function marks(container: HTMLElement) {
    const all = [...container.querySelectorAll(".mol-verdict")];
    return {
      seam: all.find((e) => !e.closest("button")) ?? null,
      onCards: all.filter((e) => e.closest("button")),
    };
  }

  it("holds VS while the round is still open", () => {
    const { container } = answered(null, { revealed: false });
    expect(marks(container).seam).toBeNull();
    expect(container.textContent).toContain("VS");
  });

  it("turns the seam badge into the running score once answered", () => {
    const { container } = answered(true);
    // Score over rounds played, so the badge reads as a tally rather than a
    // bare number that could be mistaken for the round.
    expect(marks(container).seam?.textContent).toBe("2/3");
    expect(container.textContent).not.toContain("VS");
  });

  it("marks the card that was clicked, and only that one", () => {
    // "more" means the challenger was picked. Marking both would say nothing;
    // marking the wrong one would rewrite what the player did.
    const { container } = answered(true);
    const { onCards } = marks(container);
    expect(onCards).toHaveLength(1);
    expect(onCards[0].textContent).toBe("\u2713");
    expect(onCards[0].closest("button")?.textContent).toContain("flameZ");
  });

  it("says the verdict in words for anyone who cannot see the colour", () => {
    // Both marks are aria-hidden: the tick and the badge exist to be glanced
    // at, and announcing each of them would say the same thing three times.
    const correct = answered(true);
    expect(screen.getByRole("status").textContent).toBe("Correct");
    correct.unmount();

    answered(false);
    expect(screen.getByRole("status").textContent).toBe("Wrong");
  });

  it("stays silent on a round turned face up with no guess behind it", () => {
    // A run rebuilt from storage lands here: revealed, but nothing was played
    // in this session to pass judgement on. Neither mark may appear — least of
    // all the cross, which a ternary on a null verdict used to draw.
    const { container } = answered(null);
    const { seam, onCards } = marks(container);
    expect(seam).toBeNull();
    expect(onCards).toHaveLength(0);
    expect(screen.getByRole("status").textContent).toBe("");
  });
});

describe("what the board withholds while the numbers are still climbing", () => {
  // The count-up runs for two seconds and IS the round: watching a figure race
  // past the value it is being compared against, or fall short of it, is the
  // whole game. Everything that answers the round has to wait for it.
  //
  // Three things used to give it away on the click, because all three keyed off
  // `revealed`, which is set the moment the guess is dispatched.
  function midCount(lastCorrect: boolean) {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ChainBoard
          anchor={{ ...player("dupreeh"), tournaments_won: 21 }}
          challenger={{ ...player("flameZ"), tournaments_won: 34 }}
          category="wins"
          round={3}
          score={lastCorrect ? 2 : 1}
          revealed
          settled={false}
          lastGuess="more"
          lastCorrect={lastCorrect}
          onGuess={() => {}}
          onRevealComplete={() => {}}
        />
      </NextIntlClientProvider>,
    );
  }

  it("shows no tick, and no cross, on the card that was clicked", () => {
    const { container } = midCount(true);
    expect(container.querySelectorAll(".mol-verdict")).toHaveLength(0);
  });

  it("leaves the seam badge on VS", () => {
    const { container } = midCount(true);
    expect(container.textContent).toContain("VS");
  });

  it("holds the header score at what it was going in", () => {
    // The reducer banks the point on the guess, so `score` is already 2 here.
    // Printing it would say "right" a full two seconds before the numbers do.
    const { container } = midCount(true);
    expect(container.textContent).toContain("Score 1");
    expect(container.textContent).not.toContain("Score 2");
  });

  it("does not dock the header score for a wrong answer either", () => {
    // Nothing was added, so nothing may be taken away: the subtraction that
    // hides the point must not fire when there was no point.
    const { container } = midCount(false);
    expect(container.textContent).toContain("Score 1");
  });

  it("says nothing out loud yet", () => {
    midCount(true);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("still marks WHICH card was clicked", () => {
    // Withholding the verdict must not swallow the click: the card the player
    // chose is ringed straight away, it just is not coloured by the result.
    const { container } = midCount(true);
    // Whole class tokens, not a substring: the idle card carries
    // `enabled:hover:border-[color:var(--accent)]`, which contains the picked
    // card's class and matches a naive `includes`.
    const picked = [...container.querySelectorAll("button")].find((b) =>
      b.className.split(/\s+/).includes("border-[color:var(--accent)]"),
    );
    expect(picked?.textContent).toContain("flameZ");
  });
});
