// How long the finished face-off stays up before the chain moves on.
//
// This is NOT a countdown against the animation. It starts only once the
// count-up has reported that it reached the target, so it cannot cut a number
// short — which is exactly what a fixed delay measured from the click did.
//
// It has to outlast the reels' own settle: RollingNumber eases each digit into
// place over 200ms, so the number is still visibly moving after its numeric
// value has stopped.
export const SETTLE_MS = 700;
