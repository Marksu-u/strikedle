"use client";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// A number on mechanical reels: every digit sits in its own window and slides to
// the one it should be showing. Driven by a value that is still climbing, the
// low digits blur past while the high ones step over — the same read as an
// odometer, and far more alive than a figure that simply increments in place.
//
// Takes the whole formatted string, so "$1,286,847" and "1240 pts" both work:
// anything that is not a digit stays put while the digits roll past it.
//
// Only transforms move, so the whole roll stays on the compositor however many
// digits are on screen.
export default function RollingNumber({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    // The full value for anyone not watching it move: screen readers get one
    // number, not a column of loose digits.
    <span className={`inline-flex ${className}`} role="text" aria-label={value}>
      {value.split("").map((char, i) => {
        const digit = DIGITS.indexOf(char);

        if (digit === -1) {
          // Same box as a reel window: left on its own line-height the
          // separator sits a few pixels below the digits it divides.
          return (
            <span
              key={i}
              aria-hidden="true"
              className="inline-block h-[1em] leading-none"
            >
              {char}
            </span>
          );
        }

        return (
          <span
            key={i}
            aria-hidden="true"
            className="inline-block h-[1em] overflow-hidden leading-none"
          >
            <span
              className="flex flex-col transition-transform duration-200 ease-out"
              style={{ transform: `translateY(-${digit}em)` }}
            >
              {DIGITS.map((d) => (
                <span key={d} className="h-[1em] leading-none">
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
