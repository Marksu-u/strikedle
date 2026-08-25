import dataMeta from "@/app/data/cs2/meta.json";

// The site is published under the NON-PROFESSIONAL regime of article 6-III-2 of
// the LCEN: an individual publishing a free, non-commercial site may keep their
// name and address off the page, provided the host holds them. That is why no
// real name, postal address, phone number or SIREN appears anywhere below.
//
// This stops being true the day the site earns anything — advertising, a
// donation button, sponsorship, a paid tier. Any of those makes the publisher
// professional under 6-III-1, and the page then has to carry full identity.

// Shown as the publication director. A pseudonym is enough under 6-III-2.
export const PUBLISHER_ALIAS = "mKzz";

export const LAST_UPDATED = new Date("2026-08-17T00:00:00Z");

export const CONTACT_EMAIL = "support@strikedle.com";

// The host's identity
export const HOST: {
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  url: string;
} = {
  name: "Vercel Inc.",
  address: "440 N Barranca Avenue #4133 Covina, CA 91723 United States",
  phone: null,
  email: "privacy@vercel.com",
  url: "vercel.com",
};

// Where the player data came from. Waiting on a better/automated way to update data.
export const DATA_SOURCE = "https://www.hltv.org/";

// The pool is refreshed by hand, so how current it is is a fact about the site
// and belongs here with the rest. `meta.json` is generated from the center's
// `updated` field — see scripts/generate.ts — and holds nothing else, so the
// footer gets the date without the 100 kB of players behind it.
// Read as UTC, and rendered as UTC, so the day never slips by a timezone.
export const DATA_UPDATED = new Date(`${dataMeta.updated}T00:00:00Z`);

// Public source repository
export const SOURCE_REPO = "github.com/Marksu-u/strikedle";

export const X_HANDLE = "marksu_u";
export const X_URL = `https://x.com/${X_HANDLE}`;

// Counts quoted in the privacy policy
import guessrData from "@/app/data/cs2/guessr_players.json";
import molData from "@/app/data/cs2/more-or-lessr.json";

export const PLAYER_COUNT = new Set([
  ...guessrData.players.map((p) => p.name.toLowerCase()),
  ...molData.players.map((p) => p.name.toLowerCase()),
]).size;
