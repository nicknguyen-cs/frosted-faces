// Renders one <script type="application/ld+json"> per structured-data document.
// Server component — the JSON is in the initial HTML so crawlers and AI engines
// see it without executing JavaScript.
export default function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  return (
    <>
      {data.map((doc, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(doc) }}
        />
      ))}
    </>
  );
}
