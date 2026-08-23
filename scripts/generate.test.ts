import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { OUTPUTS, render } from "./generate";

describe("generated game files", () => {
  // A hand-edit to a generated file is silent otherwise: it survives until the
  // next `npm run generate` overwrites it, which may be weeks later and by
  // someone else.
  for (const { path, build } of OUTPUTS) {
    it(`${path} matches what the centre generates`, () => {
      expect(readFileSync(path, "utf8")).toBe(render(build));
    });
  }
});
