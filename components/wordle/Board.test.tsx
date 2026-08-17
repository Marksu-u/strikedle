import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Board from "./Board";
import type { BoardState } from "@/lib/wordle/types";

const base: BoardState = {
  target: "JAMBO",
  length: 5,
  guesses: ["CACHE", "JAMBO"],
  evaluations: [
    ["absent", "correct", "absent", "absent", "absent"],
    ["correct", "correct", "correct", "correct", "correct"],
  ],
  current: "",
  status: "won",
  invalid: false,
  justSubmitted: null,
  hintedChars: [],
  mode: "daily",
  day: 20688,
};

// A tile is flipping when it carries the cascade's per-column delay.
function flipping(container: HTMLElement): number {
  return container.querySelectorAll("[style*='animation-delay']").length;
}

describe("which rows reveal", () => {
  it("flips nothing on a board read back from storage", () => {
    // The reload case: every submitted row used to cascade again, so opening a
    // half-finished puzzle replayed the whole game at you.
    const { container } = render(<Board board={base} maxLength={8} />);
    expect(flipping(container)).toBe(0);
  });

  it("flips only the row just played, not the ones already seen", () => {
    const { container } = render(
      <Board board={{ ...base, justSubmitted: 1 }} maxLength={8} />,
    );
    // One row of five, not both submitted rows.
    expect(flipping(container)).toBe(5);
  });
});

// The end-of-cascade callback is not covered here: React 19's synthetic
// animationend is not reachable from RTL's fireEvent under jsdom (a minimal
// probe component does not receive it either), so a test would be asserting the
// harness rather than the board. It is checked in the browser instead.
