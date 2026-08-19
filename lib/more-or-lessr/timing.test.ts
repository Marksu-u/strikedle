import { describe, expect, it } from "vitest";
import { SETTLE_MS } from "./timing";

// The old invariant here — "the delay must outlast the count-up" — is gone,
// because there is no longer a delay racing the count-up at all. The chain waits
// for the animation to report completion. What is left to pin is the settle.
describe("SETTLE_MS", () => {
  it("outlasts the reels' own ease into place", () => {
    // RollingNumber eases each digit over 200ms, so the number is still visibly
    // moving after its numeric value has stopped. A settle shorter than that
    // would swap the board mid-glide.
    expect(SETTLE_MS).toBeGreaterThan(200);
  });

  it("is a settle, not a pause", () => {
    expect(SETTLE_MS).toBeLessThanOrEqual(1000);
  });
});
