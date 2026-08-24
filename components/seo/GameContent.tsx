import { useTranslations } from "next-intl";

// The hub's crawlable content: what Strikedle is, and the questions a first-time
// visitor asks. Only the hub carries it — the game pages answer their own rules
// through the Help button, and repeating those answers below the board would be
// the same text twice.
export default function GameContent({ section }: { section: string }) {
  const t = useTranslations("content");
  const faq = t.raw(`${section}.faq`) as { q: string; a: string }[];

  return (
    <section className="mx-auto mt-16 w-full max-w-2xl text-sm leading-relaxed text-[color:var(--muted)]">
      <p>{t(`${section}.intro`)}</p>

      <h2 className="cs2-display text-foreground mt-10 text-2xl font-extrabold uppercase italic">
        {t("faqHeading")}
      </h2>
      <dl className="mt-3 space-y-5">
        {faq.map(({ q, a }) => (
          <div key={q}>
            <dt>
              <h3 className="text-foreground font-semibold">{q}</h3>
            </dt>
            <dd className="mt-1">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
