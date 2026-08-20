"use client";

import { useEffect, useRef, useState } from "react";

export const COUNT_UP_MS = 2000;

// Eases out: the number sprints away from zero and settles onto the final digit
// rather than crawling the whole way at one speed.
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
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
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setProgress(easeOut(t));
      if (t < 1) {
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
