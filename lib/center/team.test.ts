import { describe, expect, it } from "vitest";
import { cleanTeam } from "./team";

describe("cleanTeam", () => {
  it("collapses HLTV's retirement cell to one word", () => {
    expect(cleanTeam("Retired (?)Retired on2025-06-22")).toBe("Retired");
    expect(cleanTeam("Retired (?)Retired on2019-12-31")).toBe("Retired");
  });

  it("drops a trailing role annotation", () => {
    expect(cleanTeam("100 Thieves (coach)")).toBe("100 Thieves");
    expect(cleanTeam("FaZe (benched)")).toBe("FaZe");
  });

  it("leaves an ordinary club alone", () => {
    expect(cleanTeam("Vitality")).toBe("Vitality");
    expect(cleanTeam("BC.Game")).toBe("BC.Game");
    expect(cleanTeam("Natus Vincere")).toBe("Natus Vincere");
  });

  it("applies the aliases after cleaning, not before", () => {
    expect(cleanTeam("HEROIC (coach)", { HEROIC: "Heroic" })).toBe("Heroic");
  });

  it("is idempotent", () => {
    const once = cleanTeam("Retired (?)Retired on2025-06-22");
    expect(cleanTeam(once)).toBe(once);
  });
});
