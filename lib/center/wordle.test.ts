import { describe, expect, it } from "vitest";
import { wordleFrom, WORDLE_LENGTHS } from "./wordle";
import { center } from "./load";

const data = wordleFrom(center);

describe("wordleFrom", () => {
  it("emits exactly the six playable lengths", () => {
    expect(
      Object.keys(data.words)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual([...WORDLE_LENGTHS]);
  });

  it("never emits a two-letter bucket", () => {
    // `IM`, `JL`, `JT` and `JW` are real nicknames and there are exactly four of
    // them — one more than MIN_WORDLE_PER_LENGTH rejects. The floor would let a
    // seventh length into a deck contract written for six, repeating daily.
    expect(data.words["2"]).toBeUndefined();
  });

  it("drops nicknames that are not playable as words", () => {
    const all = Object.values(data.words).flat();
    for (const injouable of ["GET_RIGHT", "NBK-", "HUNTER-"]) {
      expect(all).not.toContain(injouable);
    }
  });

  it("files every word under its own length", () => {
    for (const [len, mots] of Object.entries(data.words)) {
      for (const mot of mots) expect(mot).toHaveLength(Number(len));
    }
  });

  it("is upper-case throughout", () => {
    const all = Object.values(data.words).flat();
    expect(all.filter((m) => m !== m.toUpperCase())).toEqual([]);
  });

  it("has no duplicates", () => {
    const all = Object.values(data.words).flat();
    expect(new Set(all).size).toBe(all.length);
  });

  it("keeps the dictionary at its current depth", () => {
    const tailles = Object.fromEntries(
      Object.entries(data.words).map(([len, mots]) => [len, mots.length]),
    );
    expect(tailles).toEqual({
      "3": 42,
      "4": 55,
      "5": 92,
      "6": 78,
      "7": 44,
      "8": 36,
    });
  });
});
