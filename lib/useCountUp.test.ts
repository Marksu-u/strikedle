import { describe, expect, it } from "vitest";
import { COUNT_UP_MS, progressAt } from "./useCountUp";

// The reveal is driven by requestAnimationFrame, which hands its callback the
// timestamp of the frame it belongs to — and that frame may have begun before
// the hook captured its own `performance.now()`. Measured in a real browser:
// the first callback of an animation arrived 0.9ms early.
//
// Left unclamped, that fraction below zero eases to a small negative value,
// `Math.round` turns -0.04 trophies into -0 (a distinct value in JS), and Intl
// formats -0 as "-0". Every count-up in More or Lessr opened on a minus sign
// for one frame — caught in a screenshot, on both cards at once.
describe("progressAt", () => {
  it("floors a frame that predates the start", () => {
    expect(progressAt(-0.9, COUNT_UP_MS)).toBe(0);
    expect(progressAt(-500, COUNT_UP_MS)).toBe(0);
  });

  it("never lets a value round to negative zero", () => {
    // The assertion the plain `>= 0` misses: -0 >= 0 is true, so the sign has
    // to be checked for on its own.
    const shown = Math.round(30 * progressAt(-0.9, COUNT_UP_MS));
    expect(Object.is(shown, -0)).toBe(false);
    expect(Object.is(shown, 0)).toBe(true);
  });

  it("climbs, and eases rather than crawling at one speed", () => {
    const quarter = progressAt(COUNT_UP_MS / 4, COUNT_UP_MS);
    const half = progressAt(COUNT_UP_MS / 2, COUNT_UP_MS);
    expect(quarter).toBeGreaterThan(0);
    expect(half).toBeGreaterThan(quarter);
    // Eased out: half the time is well past half the distance.
    expect(half).toBeGreaterThan(0.5);
  });

  it("lands exactly on the target, and stays there", () => {
    // Exactness matters: the hook fires its completion callback on reaching 1,
    // and the chain will not advance until it does.
    expect(progressAt(COUNT_UP_MS, COUNT_UP_MS)).toBe(1);
    expect(progressAt(COUNT_UP_MS * 3, COUNT_UP_MS)).toBe(1);
  });

  it("arrives at once when the duration is zero", () => {
    // Reduced motion: the number, not the journey. Guarded separately because
    // the ratio would be a division by zero.
    expect(progressAt(0, 0)).toBe(1);
    expect(progressAt(-5, 0)).toBe(1);
  });
});
