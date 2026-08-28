import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { LegalPath } from "@/lib/seo";

export const PROSE_LINK =
  "text-[color:var(--foreground)] underline underline-offset-2 transition-colors hover:text-[color:var(--accent)]";

export const CHROME_LINK = "transition-colors hover:text-[color:var(--accent)]";

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target"
> & { href: string };

export function ExternalLink({
  href,
  rel,
  children,
  ...rest
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel={["noopener", "noreferrer", rel].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </a>
  );
}

export function mailTo(address: string, className = PROSE_LINK) {
  return function mailLink(chunks: ReactNode) {
    return (
      <a href={`mailto:${address}`} className={className}>
        {chunks}
      </a>
    );
  };
}

export function telTo(number: string, className = PROSE_LINK) {
  return function telLink(chunks: ReactNode) {
    return (
      <a href={`tel:${number.replace(/[^+\d]/g, "")}`} className={className}>
        {chunks}
      </a>
    );
  };
}

export function linkTo(href: string, className = PROSE_LINK) {
  return function externalLink(chunks: ReactNode) {
    return (
      <ExternalLink href={href} className={className}>
        {chunks}
      </ExternalLink>
    );
  };
}

export function pageTo(href: LegalPath, className = PROSE_LINK) {
  return function pageLink(chunks: ReactNode) {
    return (
      <Link href={href} className={className}>
        {chunks}
      </Link>
    );
  };
}
