// The club name as the games compare it.
//
// The scrape already splits `teamRaw` from `team`, stripping "(benched)" — but
// only that. Two artefacts survive into `team` and both reach the screen, since
// the Guessr column compares and displays the same string.

// "Retired (?)Retired on2025-06-22" — HLTV renders a retirement as the club cell
// with its own tooltip glued on. 14 of the 116 arrive this way.
const RETIRED = /^Retired\b/;

// A trailing role annotation: "(coach)", "(benched)". Not part of the club name,
// and the team column compares by exact text — "ENCE (coach)" would be a club
// nobody can name.
const ANNOTATION = /\s*\([^)]*\)\s*$/;

export function cleanTeam(
  raw: string,
  aliases: Record<string, string> = {},
): string {
  const t = RETIRED.test(raw) ? "Retired" : raw.replace(ANNOTATION, "").trim();
  return aliases[t] ?? t;
}
