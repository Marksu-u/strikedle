import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JsonLd from "./JsonLd";

describe("JsonLd", () => {
  it("emits a parseable ld+json script", () => {
    const { container } = render(<JsonLd data={{ "@type": "WebSite" }} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({ "@type": "WebSite" });
  });

  // An answer containing "</script>" would otherwise close the tag early and
  // spill the rest of the JSON into the document as markup.
  it("escapes a closing script tag hidden in the data", () => {
    const { container } = render(
      <JsonLd data={{ name: "</script><img src=x>" }} />,
    );
    const html = container.querySelector("script")!.innerHTML;
    expect(html).not.toContain("</script>");
    expect(JSON.parse(html)).toEqual({ name: "</script><img src=x>" });
  });
});
