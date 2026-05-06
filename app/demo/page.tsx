import { getDemoPage } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import Container from "@/components/layout/Container";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "How Adoption Works | Frosted Faces Foundation",
  description:
    "A step-by-step walkthrough of the adoption process at Frosted Faces — application to homecoming, requirements, fees, and FAQs.",
};

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

const asArray = <T,>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

export default async function DemoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = await getDemoPage(params);

  if (!page) return null;

  return (
    <div {...(page.$ && page.$.sections)}>
      {asArray(page.sections).map((section, index) => {
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

        if ("process_steps" in section) {
          const data = section.process_steps;
          return (
            <section
              key={index}
              className="py-20 md:py-24"
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
                    className="relative border-l-2 border-sage/40 ml-4 space-y-10"
                    {...(data.$?.steps)}
                  >
                    {asArray(data.steps).map((step, i) => (
                      <li
                        key={i}
                        className="relative pl-8 pb-2"
                        {...(data.$?.[`steps__${i}`])}
                      >
                        <span className="absolute -left-[22px] top-0 h-11 w-11 rounded-full bg-white border-4 border-terracotta flex items-center justify-center text-xl shadow-sm">
                          <span {...(step.$?.icon)}>{step.icon}</span>
                        </span>
                        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                          <span
                            className="font-heading text-sm font-bold text-terracotta uppercase tracking-wider"
                            {...(step.$?.number)}
                          >
                            Step {step.number}
                          </span>
                          {step.duration && (
                            <span
                              className="text-xs text-stone bg-sand-100 px-2 py-0.5 rounded-full"
                              {...(step.$?.duration)}
                            >
                              {step.duration}
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-heading text-xl md:text-2xl font-semibold text-charcoal mb-2"
                          {...(step.$?.title)}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-stone leading-relaxed"
                          {...(step.$?.description)}
                        >
                          {step.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </Container>
            </section>
          );
        }

        if ("requirements" in section) {
          const data = section.requirements;
          return (
            <section
              key={index}
              className="bg-sand-100 py-20 md:py-24"
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
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    {...(data.$?.items)}
                  >
                    {asArray(data.items).map((item, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-6 border border-sand-200 hover:shadow-md transition-shadow flex gap-4"
                        {...(data.$?.[`items__${i}`])}
                      >
                        <span className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full bg-sage/30 flex items-center justify-center text-sage-dark">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        <div>
                          <h3
                            className="font-heading text-lg font-semibold text-charcoal mb-1"
                            {...(item.$?.label)}
                          >
                            {item.label}
                          </h3>
                          {item.description && (
                            <p
                              className="text-sm text-stone leading-relaxed"
                              {...(item.$?.description)}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("adoption_fees" in section) {
          const data = section.adoption_fees;
          return (
            <section
              key={index}
              className="py-20 md:py-24"
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
                    className="grid md:grid-cols-3 gap-6"
                    {...(data.$?.tiers)}
                  >
                    {asArray(data.tiers).map((tier, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-8 border border-sand-200 flex flex-col"
                        {...(data.$?.[`tiers__${i}`])}
                      >
                        <h3
                          className="font-heading text-xl font-semibold text-charcoal mb-1"
                          {...(tier.$?.title)}
                        >
                          {tier.title}
                        </h3>
                        <p
                          className="font-heading text-3xl md:text-4xl font-bold text-terracotta mb-6"
                          {...(tier.$?.fee)}
                        >
                          {tier.fee}
                        </p>
                        <ul
                          className="space-y-2 text-stone text-sm leading-relaxed"
                          {...(tier.$?.includes)}
                        >
                          {asArray(tier.includes).map((line, j) => (
                            <li
                              key={j}
                              className="flex gap-2"
                              {...(tier.$?.[`includes__${j}`])}
                            >
                              <span className="text-sage-dark mt-0.5">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("faq" in section) {
          const data = section.faq;
          return (
            <section
              key={index}
              className="bg-sand-50 py-20 md:py-24"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-3xl mx-auto">
                  <h2
                    className="font-heading text-3xl md:text-4xl font-semibold text-charcoal mb-10 text-center"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  <div
                    className="divide-y divide-sand-200 border-y border-sand-200"
                    {...(data.$?.items)}
                  >
                    {asArray(data.items).map((item, i) => (
                      <div
                        key={i}
                        className="py-6"
                        {...(data.$?.[`items__${i}`])}
                      >
                        <h3
                          className="font-heading text-lg font-semibold text-charcoal mb-2"
                          {...(item.$?.question)}
                        >
                          {item.question}
                        </h3>
                        <p
                          className="text-stone leading-relaxed"
                          {...(item.$?.answer)}
                        >
                          {item.answer}
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
