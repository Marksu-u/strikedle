"use client";

import { useEffect, useRef, useState } from "react";

export const COUNT_UP_MS = 2000;

// Eases out: the number sprints away from zero and settles onto the final digit
// rather than crawling the whole way at one speed.
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// How far along the reveal is, from a duration and however long has elapsed.
//
// Exported, and separate from the hook, because the clamp below is the whole
// content of a bug and the hook is a poor place to prove it: reproducing the
// offending frame through React's effects and jsdom's animation frames tests
// the harness rather than the arithmetic.
//
// Clamped at BOTH ends. The upper bound is obvious. The lower one is not, and
// it is the one that showed: requestAnimationFrame hands its callback the time
// the FRAME began, which can predate the `performance.now()` captured a moment
// earlier — measured at -0.9ms on the first frame of a real reveal. A negative
// t eases to a small negative value, -0.04 trophies rounds to -0 (a distinct
// value in JS), and Intl prints -0 as "-0". Every count-up in More or Lessr
// opened on a minus sign for one frame.
export function progressAt(elapsed: number, duration: number): number {
  if (duration === 0) return 1;
  return easeOut(Math.min(1, Math.max(0, elapsed / duration)));
}

// Counts from zero up to `target` when `active` turns on.
//
// Only the TRANSITION animates. A card that is already revealed when it mounts
// — a resumed round, a re-render — shows its value outright, because replaying
// the reveal for a number the player has already read is noise.
//
// Progress is what lives in state, NOT the value. The More or Lessr anchor card
// has no key, so React reuses one instance as the player changes underneath it;
// a stored value would freeze on the first player's number for the whole run.
type Options = {
  onDone?: () => void;
  // Animate even though the value is already showing at mount. Off by default:
  // a card that mounts revealed is a resumed round, and replaying the reveal for
  // a number already read is noise. A result banner is the opposite — it only
  // ever appears at the moment there is something to reveal.
  animateOnMount?: boolean;
};

export function useCountUp(
  target: number,
  active: boolean,
  { onDone, animateOnMount = false }: Options = {},
): number {
  // Captured once, at mount: was this value already final when it appeared?
  // `useState` rather than a ref because the answer is read while rendering.
  const [settledOnMount] = useState(active && !animateOnMount);
  const [progress, setProgress] = useState(settledOnMount ? 1 : 0);

  // Held in a ref so a caller passing an inline arrow does not restart the
  // animation on every render.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  // A value that arrived already final still has to say so. Without this a
  // reload mid-reveal leaves whoever is waiting on the animation waiting for
  // ever — there is no animation left to finish.
  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || !active || !settledOnMount) return;
    announced.current = true;
    done.current?.();
  }, [active, settledOnMount]);

  useEffect(() => {
    if (!active || settledOnMount) return;

    // Someone who asked for less movement gets the number, not the journey.
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const duration = still ? 0 : COUNT_UP_MS;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = progressAt(now - start, duration);
      setProgress(progress);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      // Reached the target. Nothing downstream may move until this fires: the
      // reveal is the round, and cutting it short is what a fixed timer did.
      done.current?.();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, settledOnMount]);

  return target * progress;
}
