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

describe("what the reveal actually withholds", () => {
  // The bug this guards: the row used to arrive wearing its colours and merely
  // spin afterwards, so the answer was legible from the first frame and the
  // cascade revealed nothing it had not already given away.
  //
  // What defers the paint is the pair below — the flip class, whose keyframes
  // hold the tile transparent until it is edge-on, and the arrival colour
  // handed over as a variable for those keyframes to pick up at that moment.
  // A tile that carries the class without the variable turns over and stays
  // blank; one that carries neither is simply painted at once. Neither is
  // visible to a snapshot of the finished row, which is why they are asserted
  // here rather than through the rendered colour.
  it("hands the row just played its colour as a variable for the flip to pick up", () => {
    const { container } = render(
      <Board board={{ ...base, justSubmitted: 1 }} maxLength={8} />,
    );
    const flipped = container.querySelectorAll(".wordle-tile-flip");
    expect(flipped).toHaveLength(5);
    for (const tile of flipped) {
      expect(tile.getAttribute("style")).toContain("--tile-bg");
    }
  });

  it("paints a restored row outright — there is nothing left to reveal", () => {
    const { container } = render(<Board board={base} maxLength={8} />);
    expect(container.querySelectorAll(".wordle-tile-flip")).toHaveLength(0);
  });
});

describe("the victory wave", () => {
  it("replaces the flip rather than joining it", () => {
    // One element, one `animation` property: a row asked to do both would wear
    // whichever React rendered last, and the flip losing that race takes the
    // colours down with it — they are held by its final keyframe.
    const { container } = render(
      <Board
        board={{ ...base, justSubmitted: 1 }}
        maxLength={8}
        bounceRow={1}
      />,
    );
    expect(container.querySelectorAll(".wordle-tile-bounce")).toHaveLength(5);
    expect(container.querySelectorAll(".wordle-tile-flip")).toHaveLength(0);
  });

  it("stays off until the game asks for it", () => {
    // Whether a win is worth celebrating is the game's call, not the board's:
    // read back out of storage it is already won, and a reward replayed on
    // every reload is wallpaper.
    const { container } = render(
      <Board board={{ ...base, justSubmitted: 1 }} maxLength={8} />,
    );
    expect(container.querySelectorAll(".wordle-tile-bounce")).toHaveLength(0);
  });
});

// The end-of-cascade callback is not covered here: React 19's synthetic
// animationend is not reachable from RTL's fireEvent under jsdom (a minimal
// probe component does not receive it either), so a test would be asserting the
// harness rather than the board. It is checked in the browser instead.
