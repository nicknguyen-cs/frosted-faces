import { getHistoryPage } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import Container from "@/components/layout/Container";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our History | Frosted Faces Foundation",
  description:
    "The story of Frosted Faces Foundation — twelve years of senior dog rescue, foster families, and the dogs who made it all possible.",
};

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = await getHistoryPage(params);

  if (!page) return null;

  return (
    <div {...(page.$ && page.$.sections)}>
      {page.sections?.map((section, index) => {
        if ("hero" in section) {
          const data = section.hero;
          return (
            <section
              key={index}
              className="relative bg-gradient-to-br from-sand-100 via-sand-50 to-sage/20 py-24 md:py-32 overflow-hidden"
              {...(page.$?.[`sections__${index}`])}
            >
              <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-terracotta/15 blur-3xl" />
              <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-sage/15 blur-3xl" />
              <Container className="relative">
                <div className="max-w-3xl">
                  <h1
                    className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-tight"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h1>
                  <p
                    className="mt-6 text-xl text-stone leading-relaxed max-w-2xl"
                    {...(data.$?.description)}
                  >
                    {data.description}
                  </p>
                  {data.cta_text && data.cta_link && (
                    <div className="mt-10">
                      <a
                        href={data.cta_link}
                        className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-terracotta-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        {...(data.$?.cta_text)}
                      >
                        {data.cta_text}
                      </a>
                    </div>
                  )}
                </div>
              </Container>
            </section>
          );
        }

        if ("origin_story" in section) {
          const data = section.origin_story;
          const paragraphs = data.body?.split("\n\n") ?? [];
          return (
            <section
              key={index}
              className="py-20 md:py-24"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 items-start">
                  <div className="md:col-span-2">
                    <h2
                      className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-8"
                      {...(data.$?.heading)}
                    >
                      {data.heading}
                    </h2>
                    <div {...(data.$?.body)}>
                      {paragraphs.map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-lg text-stone leading-relaxed mb-5 last:mb-0"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  {data.pull_quote && (
                    <aside className="md:pt-4 border-l-4 border-terracotta pl-6 md:sticky md:top-24">
                      <blockquote
                        className="font-heading text-xl italic text-charcoal leading-snug"
                        {...(data.$?.pull_quote)}
                      >
                        &ldquo;{data.pull_quote}&rdquo;
                      </blockquote>
                      {data.pull_quote_attribution && (
                        <p
                          className="mt-4 text-sm text-stone"
                          {...(data.$?.pull_quote_attribution)}
                        >
                          {data.pull_quote_attribution}
                        </p>
                      )}
                    </aside>
                  )}
                </div>
              </Container>
            </section>
          );
        }

        if ("timeline" in section) {
          const data = section.timeline;
          return (
            <section
              key={index}
              className="bg-sand-100 py-20 md:py-24"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-16">
                    <h2
                      className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-4"
                      {...(data.$?.heading)}
                    >
                      {data.heading}
                    </h2>
                    {data.description && (
                      <p
                        className="text-lg text-stone max-w-2xl mx-auto"
                        {...(data.$?.description)}
                      >
                        {data.description}
                      </p>
                    )}
                  </div>
                  <ol
                    className="relative border-l-2 border-sage/40 ml-4 space-y-12"
                    {...(data.$?.milestones)}
                  >
                    {data.milestones?.map((milestone, i) => (
                      <li
                        key={i}
                        className="relative pl-8 pb-2"
                        {...(data.$?.[`milestones__${i}`])}
                      >
                        <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-terracotta border-4 border-sand-100" />
                        <p
                          className="font-heading text-sm font-bold text-terracotta uppercase tracking-wider mb-1"
                          {...(milestone.$?.year)}
                        >
                          {milestone.year}
                        </p>
                        <h3
                          className="font-heading text-xl md:text-2xl font-semibold text-charcoal mb-2"
                          {...(milestone.$?.title)}
                        >
                          {milestone.title}
                        </h3>
                        <p
                          className="text-stone leading-relaxed"
                          {...(milestone.$?.description)}
                        >
                          {milestone.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </Container>
            </section>
          );
        }

        if ("founder_spotlight" in section) {
          const data = section.founder_spotlight;
          return (
            <section
              key={index}
              className="py-20 md:py-24"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-5xl mx-auto grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-center">
                  {data.photo?.url ? (
                    <div
                      className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-xl mx-auto md:mx-0"
                      {...(data.$?.photo)}
                    >
                      <img
                        src={data.photo.url}
                        alt={data.name || "Founder portrait"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-sand-100 flex items-center justify-center text-stone mx-auto md:mx-0"
                      {...(data.$?.photo)}
                    >
                      <span className="text-sm">Add a photo</span>
                    </div>
                  )}
                  <div>
                    {data.eyebrow && (
                      <p
                        className="font-heading text-sm font-bold text-terracotta uppercase tracking-wider mb-3"
                        {...(data.$?.eyebrow)}
                      >
                        {data.eyebrow}
                      </p>
                    )}
                    <blockquote
                      className="font-heading text-2xl md:text-3xl italic text-charcoal leading-snug mb-6"
                      {...(data.$?.quote)}
                    >
                      &ldquo;{data.quote}&rdquo;
                    </blockquote>
                    <p
                      className="font-heading text-lg font-semibold text-charcoal"
                      {...(data.$?.name)}
                    >
                      {data.name}
                    </p>
                    <p
                      className="text-stone mb-5"
                      {...(data.$?.role)}
                    >
                      {data.role}
                    </p>
                    {data.bio && (
                      <p
                        className="text-stone leading-relaxed max-w-2xl"
                        {...(data.$?.bio)}
                      >
                        {data.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("gratitude_grid" in section) {
          const data = section.gratitude_grid;
          return (
            <section
              key={index}
              className="bg-sand-50 py-20 md:py-24"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <h2
                      className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-4"
                      {...(data.$?.heading)}
                    >
                      {data.heading}
                    </h2>
                    {data.description && (
                      <p
                        className="text-lg text-stone max-w-2xl mx-auto"
                        {...(data.$?.description)}
                      >
                        {data.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    {...(data.$?.items)}
                  >
                    {data.items?.map((item, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-6 border border-sand-200 hover:shadow-md transition-shadow"
                        {...(data.$?.[`items__${i}`])}
                      >
                        <h3
                          className="font-heading text-lg font-semibold text-charcoal mb-2"
                          {...(item.$?.title)}
                        >
                          {item.title}
                        </h3>
                        <p
                          className="text-sm text-stone leading-relaxed"
                          {...(item.$?.description)}
                        >
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("cta_banner" in section) {
          const data = section.cta_banner;
          return (
            <section
              key={index}
              className="bg-charcoal py-20"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-2xl mx-auto text-center">
                  <h2
                    className="font-heading text-3xl md:text-4xl font-semibold text-white mb-4"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  <p
                    className="text-lg text-sand-200 mb-8"
                    {...(data.$?.description)}
                  >
                    {data.description}
                  </p>
                  <a
                    href={data.cta_link || "/dogs"}
                    className="inline-block bg-terracotta text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-terracotta-dark transition-colors"
                    {...(data.$?.cta_text)}
                  >
                    {data.cta_text}
                  </a>
                </div>
              </Container>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
