import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import { SITE_NAME } from "@/lib/seo";

// Share preview image for social networks and messaging apps. Generated at
// build time rather than stored as a PNG: no binary asset to regenerate when
// the wording changes, and it stays consistent with the theme.
//
// One image PER LOCALE, addressed as /opengraph-image/en and
// /opengraph-image/fr. It lives at the app root rather than under [locale] on
// purpose: inside the locale segment the unprefixed English URL would go
// through the i18n middleware, which redirects on Accept-Language — so a French
// crawler fetching the English page's share image would be handed the French
// one. At the root the path is excluded from the middleware entirely and each
// URL serves exactly the language it names.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Palette copied from app/cs2-theme.css. Hardcoded here because
// `ImageResponse` renders outside the browser, with no CSS and no variables.
const ACCENT_HOT = "#ff5e1e";
const TEXT = "#f2f3f5";
const MUTED = "#8b8f98";

const MARK = `data:image/svg+xml;base64,${readFileSync(
  join(process.cwd(), "app", "icon.svg"),
).toString("base64")}`;

export async function generateImageMetadata() {
  return Promise.all(
    locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "seo" });
      return {
        id: locale,
        size,
        contentType,
        alt: `${SITE_NAME} — ${t("home.description")}`,
      };
    }),
  );
}

export default async function Image({ id }: { id: string }) {
  const locale = id as Locale;
  const t = await getTranslations({ locale, namespace: "seo" });
  const modes = await getTranslations({ locale, namespace: "modes" });
  const home = await getTranslations({ locale, namespace: "home" });

  // Literal keys, never a template: a key built from a variable renders as its
  // own raw path when it misses, and an image cannot be checked by the render
  // tests that guard the rest of the catalogue.
  const badges = [
    t("ogBadges.rotation"),
    t("ogBadges.streak"),
    t("ogBadges.score"),
  ];
  const eyebrow = [
    modes("wordle.label"),
    modes("guessr.label"),
    modes("more-or-lessr.label"),
  ].join(" · ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        // OPAQUE gradient stops. Satori composites alpha stops against white
        // rather than the background, which washed the image out.
        background:
          "linear-gradient(115deg, #0e0f12 0%, #0e0f12 54%, #2a1410 78%, #4a2013 100%)",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Width pinned rather than grown: 1200 canvas less 160 of padding, the
          240 mark and the 64 gap. The French tagline is wider than the English
          one, and a column free to grow takes that width from the mark, which
          then falls off the right edge. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 736,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 10,
            color: MUTED,
            textTransform: "uppercase",
          }}
        >
          {home("eyebrow")}
        </div>

        <div style={{ display: "flex", marginTop: 10, lineHeight: 0.92 }}>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 800,
              color: TEXT,
            }}
          >
            STRIKE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 800,
              color: ACCENT_HOT,
            }}
          >
            DLE
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            color: MUTED,
            textTransform: "uppercase",
            marginTop: 26,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{ display: "flex", fontSize: 38, color: TEXT, marginTop: 26 }}
        >
          {t("ogTagline")}
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 38,
            fontSize: 26,
            color: MUTED,
          }}
        >
          {badges.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                border: "2px solid rgba(255,94,30,0.42)",
                borderRadius: 12,
                padding: "12px 22px",
                color: ACCENT_HOT,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <img
        src={MARK}
        width={240}
        height={240}
        alt=""
        style={{ flexShrink: 0 }}
      />
    </div>,
    size,
  );
}
