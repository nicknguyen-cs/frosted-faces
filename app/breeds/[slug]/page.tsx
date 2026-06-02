import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBreedBySlug } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import Container from "@/components/layout/Container";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<LivePreviewParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const breed = await getBreedBySlug(slug);

  if (!breed) return { title: "Breed not found" };

  const heroSection = breed.sections?.find((s) => "hero" in s);
  const description =
    heroSection && "hero" in heroSection
      ? heroSection.hero.description
      : `Learn about the ${breed.title}.`;

  return {
    title: `${breed.title} — Frosted Faces`,
    description,
  };
}

export default async function BreedPage({ params, searchParams }: PageProps) {
  const [{ slug }, previewParams] = await Promise.all([params, searchParams]);
  const breed = await getBreedBySlug(slug, previewParams);

  if (!breed) notFound();

  return (
    <div {...(breed.$ && breed.$.sections)}>
      {breed.sections?.map((section, index) => {
        if ("hero" in section) {
          const data = section.hero;
          return (
            <section
              key={index}
              className="relative bg-gradient-to-br from-sand-100 via-sand-50 to-sage/20 py-24 md:py-32 overflow-hidden"
              {...(breed.$?.[`sections__${index}`])}
            >
              <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-terracotta/15 blur-3xl" />
              <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-sage/15 blur-3xl" />
              <Container className="relative">
                <div className="max-w-3xl">
                  <p
                    className="font-heading text-sm font-bold text-terracotta uppercase tracking-wider mb-4"
                    {...(breed.$?.title)}
                  >
                    {breed.title}
                  </p>
                  <h1
                    className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-tight"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h1>
                  {data.description && (
                    <p
                      className="mt-6 text-xl text-stone leading-relaxed max-w-2xl"
                      {...(data.$?.description)}
                    >
                      {data.description}
                    </p>
                  )}
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

        if ("quick_facts" in section) {
          const data = section.quick_facts;
          return (
            <section
              key={index}
              className="bg-white py-20 md:py-24 border-b border-sand-200"
              {...(breed.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-5xl mx-auto">
                  <h2
                    className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-12 text-center"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  <dl
                    className="grid grid-cols-2 md:grid-cols-4 gap-px bg-sand-200 rounded-2xl overflow-hidden border border-sand-200"
                    {...(data.$?.facts)}
                  >
                    {data.facts?.map((fact, i) => (
                      <div
                        key={i}
                        className="bg-white p-6 hover:bg-sand-50 transition-colors"
                        {...(data.$?.[`facts__${i}`])}
                      >
                        {fact.icon && (
                          <div
                            className="text-3xl mb-3"
                            {...(fact.$?.icon)}
                          >
                            {fact.icon}
                          </div>
                        )}
                        <dt
                          className="font-heading text-xs font-bold text-pebble uppercase tracking-wider mb-1"
                          {...(fact.$?.label)}
                        >
                          {fact.label}
                        </dt>
                        <dd
                          className="font-heading text-lg text-charcoal"
                          {...(fact.$?.value)}
                        >
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Container>
            </section>
          );
        }

        if ("about_section" in section) {
          const data = section.about_section;
          const paragraphs = data.body?.split("\n\n") ?? [];
          return (
            <section
              key={index}
              className="py-20 md:py-24"
              {...(breed.$?.[`sections__${index}`])}
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

        if ("temperament" in section) {
          const data = section.temperament;
          return (
            <section
              key={index}
              className="bg-sand-100 py-20 md:py-24"
              {...(breed.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-14 max-w-2xl mx-auto">
                    <h2
                      className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-4"
                      {...(data.$?.heading)}
                    >
                      {data.heading}
                    </h2>
                    {data.description && (
                      <p
                        className="text-lg text-stone"
                        {...(data.$?.description)}
                      >
                        {data.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    {...(data.$?.traits)}
                  >
                    {data.traits?.map((trait, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-6 border border-sand-200 hover:shadow-md transition-shadow"
                        {...(data.$?.[`traits__${i}`])}
                      >
                        <h3
                          className="font-heading text-lg font-semibold text-charcoal mb-2"
                          {...(trait.$?.title)}
                        >
                          {trait.title}
                        </h3>
                        <p
                          className="text-sm text-stone leading-relaxed"
                          {...(trait.$?.description)}
                        >
                          {trait.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("care_requirements" in section) {
          const data = section.care_requirements;
          return (
            <section
              key={index}
              className="py-20 md:py-24"
              {...(breed.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-14 max-w-2xl mx-auto">
                    <h2
                      className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-4"
                      {...(data.$?.heading)}
                    >
                      {data.heading}
                    </h2>
                    {data.description && (
                      <p
                        className="text-lg text-stone"
                        {...(data.$?.description)}
                      >
                        {data.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    {...(data.$?.cards)}
                  >
                    {data.cards?.map((card, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-7 border border-sand-200 hover:border-terracotta/40 hover:shadow-lg transition-all"
                        {...(data.$?.[`cards__${i}`])}
                      >
                        {card.icon && (
                          <div
                            className="text-4xl mb-4"
                            {...(card.$?.icon)}
                          >
                            {card.icon}
                          </div>
                        )}
                        <h3
                          className="font-heading text-xl font-semibold text-charcoal mb-3"
                          {...(card.$?.title)}
                        >
                          {card.title}
                        </h3>
                        <p
                          className="text-stone leading-relaxed"
                          {...(card.$?.description)}
                        >
                          {card.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("gallery" in section) {
          const data = section.gallery;
          return (
            <section
              key={index}
              className="bg-sand-50 py-20 md:py-24"
              {...(breed.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-6xl mx-auto">
                  <h2
                    className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-12 text-center"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                    {...(data.$?.photos)}
                  >
                    {data.photos?.map((photo, i) => {
                      const src = photo.image?.url || photo.image_url;
                      if (!src) return null;
                      return (
                        <div
                          key={i}
                          className="relative aspect-square overflow-hidden rounded-2xl bg-sand-100 group"
                          {...(data.$?.[`photos__${i}`])}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={photo.alt}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      );
                    })}
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
              {...(breed.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-2xl mx-auto text-center">
                  <h2
                    className="font-heading text-3xl md:text-4xl font-semibold text-white mb-4"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  {data.description && (
                    <p
                      className="text-lg text-sand-200 mb-8"
                      {...(data.$?.description)}
                    >
                      {data.description}
                    </p>
                  )}
                  {data.cta_text && (
                    <a
                      href={data.cta_link || "/dogs"}
                      className="inline-block bg-terracotta text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-terracotta-dark transition-colors"
                      {...(data.$?.cta_text)}
                    >
                      {data.cta_text}
                    </a>
                  )}
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
