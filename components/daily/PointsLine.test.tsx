import { act, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import PointsLine from "./PointsLine";

function shown(container: HTMLElement): string {
  return (
    container.querySelector("[role='text']")?.getAttribute("aria-label") ?? ""
  );
}

function line(fresh: boolean) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <PointsLine points={340} detail="solved in 3" fresh={fresh} />
    </NextIntlClientProvider>,
  );
}

describe("PointsLine", () => {
  afterEach(() => vi.useRealTimers());

  function useReelClock() {
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
  }

  it("counts the score up when the puzzle was just finished", async () => {
    useReelClock();
    const { container } = line(true);
    expect(shown(container)).toContain("0 pts");

    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(shown(container)).toContain("340 pts");
  });

  it("prints it outright when the result came back from storage", async () => {
    // The reload case. Replaying a celebration for a puzzle finished hours ago
    // is over-animation, not feedback.
    useReelClock();
    const { container } = line(false);
    expect(shown(container)).toContain("340 pts");

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(shown(container)).toContain("340 pts");
  });
});
