import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage, { Section } from "@/components/legal/LegalPage";
import { linkTo, mailTo, pageTo, telTo } from "@/components/links";
import {
  CONTACT_EMAIL,
  DATA_SOURCE,
  HOST,
  httpsUrl,
  LICENCE_URL,
  PUBLISHER_ALIAS,
  SOURCE_REPO,
} from "@/lib/legal";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata("/legal", locale);
}

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages");
  const { phone, email: hostEmail } = HOST;

  return (
    <LegalPage title={t("notice.title")}>
      <Section heading={t("notice.publisher.heading")}>
        <p>{t("notice.publisher.body")}</p>
        <p>{t("notice.publisher.director", { alias: PUBLISHER_ALIAS })}</p>
        <p>
          {t.rich("notice.publisher.contact", {
            email: CONTACT_EMAIL,
            mail: mailTo(CONTACT_EMAIL),
          })}
        </p>
      </Section>

      <Section heading={t("notice.host.heading")}>
        {/* The statute names the host's telephone number, so it is used when
            there is one. Literal keys either side of the branch. */}
        <p>
          {phone
            ? t.rich("notice.host.body", {
                host: HOST.name,
                address: HOST.address,
                phone,
                url: HOST.url,
                tel: telTo(phone),
                link: linkTo(httpsUrl(HOST.url)),
              })
            : t.rich("notice.host.bodyNoPhone", {
                host: HOST.name,
                address: HOST.address,
                url: HOST.url,
                link: linkTo(httpsUrl(HOST.url)),
              })}
        </p>
        {/* Useful whether or not there is a phone number, so it is not tied to
            the branch above. */}
        {hostEmail && (
          <p>
            {t.rich("notice.host.contact", {
              email: hostEmail,
              mail: mailTo(hostEmail),
            })}
          </p>
        )}
        <p>{t("notice.host.noServer")}</p>
      </Section>

      <Section heading={t("notice.ip.heading")}>
        <p>
          {t.rich("notice.ip.body", {
            repo: SOURCE_REPO,
            licence: linkTo(LICENCE_URL),
            link: linkTo(httpsUrl(SOURCE_REPO)),
          })}
        </p>
        <p>{t("notice.ip.data")}</p>
        <p>{t("notice.ip.valve")}</p>
      </Section>

      <Section heading={t("notice.data.heading")}>
        <p>
          {t.rich("notice.data.body", {
            source: DATA_SOURCE.name,
            email: CONTACT_EMAIL,
            link: linkTo(DATA_SOURCE.url),
            mail: mailTo(CONTACT_EMAIL),
            privacy: pageTo("/privacy"),
          })}
        </p>
      </Section>

      <Section heading={t("notice.links.heading")}>
        <p>{t("notice.links.body")}</p>
      </Section>
    </LegalPage>
  );
}
