// Serialises a JSON-LD graph into the document. `<` is escaped because a stray
// "</script>" inside any translated string would close the tag early and spill
// the remaining JSON into the page as markup.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
