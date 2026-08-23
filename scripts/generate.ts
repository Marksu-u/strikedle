// The center → the files the app ships. Run it after every edit to
// app/data/cs2/players.json; `scripts/generate.test.ts` fails the build if you
// forget.

import { writeFileSync } from "node:fs";
import { center } from "@/lib/center/load";
import { guessrFrom } from "@/lib/center/guessr";
import { morelessFrom } from "@/lib/center/moreless";
import { wordleFrom } from "@/lib/center/wordle";

// One place naming what is generated, so the drift test cannot check a subset.
export const OUTPUTS = [
  { path: "app/data/cs2/guessr_players.json", build: guessrFrom },
  { path: "app/data/cs2/more-or-lessr.json", build: morelessFrom },
  { path: "app/data/cs2/wordle.json", build: wordleFrom },
  { path: "app/data/cs2/meta.json", build: metaFrom },
] as const;

// The footer tells players how current the pool is, and the center's `updated`
// is the only place that knows. It ships as its own file so the footer can read
// the date without pulling the whole center — 100 kB of players — into a bundle.
export function metaFrom(c: typeof center) {
  return { updated: c.updated };
}

export function render(build: (c: typeof center) => unknown): string {
  return JSON.stringify(build(center), null, 2) + "\n";
}

function main() {
  for (const { path, build } of OUTPUTS) {
    writeFileSync(path, render(build));
    console.log(`generate: wrote ${path}`);
  }
}

if (process.argv[1]?.endsWith("generate.ts")) main();
