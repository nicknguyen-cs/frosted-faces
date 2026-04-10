import { getAboutPage } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import Container from "@/components/layout/Container";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Frosted Faces Foundation",
  description:
    "Learn about Frosted Faces Foundation and our mission to find loving homes for senior dogs.",
};

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

export default async function AboutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = await getAboutPage(params);

  if (!page) return null;

  return (
    <div {...(page.$ && page.$.sections)}>
      {page.sections?.map((section, index) => {
        if ("hero" in section) {
          const data = section.hero;
          return (
            <section
              key={index}
              className="bg-sand-100 py-20"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-3xl mx-auto text-center">
                  <h1
                    className="font-heading text-4xl md:text-5xl font-bold text-charcoal mb-6"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h1>
                  <p
                    className="text-lg text-stone leading-relaxed"
                    {...(data.$?.description)}
                  >
                    {data.description}
                  </p>
                </div>
              </Container>
            </section>
          );
        }

        if ("two_column_text" in section) {
          const data = section.two_column_text;
          return (
            <section
              key={index}
              className="py-16"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
                  <div>
                    <h2
                      className="font-heading text-2xl font-semibold text-charcoal mb-4"
                      {...(data.$?.left_heading)}
                    >
                      {data.left_heading}
                    </h2>
                    <div {...(data.$?.left_body)}>
                      {data.left_body?.split("\n\n").map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-stone leading-relaxed mb-4 last:mb-0"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2
                      className="font-heading text-2xl font-semibold text-charcoal mb-4"
                      {...(data.$?.right_heading)}
                    >
                      {data.right_heading}
                    </h2>
                    <ul className="space-y-3 text-stone" {...(data.$?.right_items)}>
                      {data.right_items?.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3"
                          {...(data.$?.[`right_items__${i}`])}
                        >
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-sage shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Container>
            </section>
          );
        }

        if ("stats_bar" in section) {
          const data = section.stats_bar;
          return (
            <section
              key={index}
              className="bg-sand-50 py-16"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div
                  className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                  {...(data.$?.stats)}
                >
                  {data.stats?.map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl" {...(data.$?.[`stats__${i}`])}>
                      <p
                        className="font-heading text-3xl font-bold text-sage"
                        {...(stat.$?.value)}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-sm text-stone mt-1"
                        {...(stat.$?.label)}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Container>
            </section>
          );
        }

        if ("values_grid" in section) {
          const data = section.values_grid;
          return (
            <section
              key={index}
              className="py-16"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-4xl mx-auto">
                  <h2
                    className="font-heading text-2xl font-semibold text-charcoal mb-8 text-center"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  <div className="grid md:grid-cols-3 gap-8" {...(data.$?.values)}>
                    {data.values?.map((value, i) => (
                      <div
                        key={i}
                        className="bg-sand-50 rounded-2xl p-6 border border-sand-200"
                        {...(data.$?.[`values__${i}`])}
                      >
                        <h3
                          className="font-heading text-lg font-semibold text-charcoal mb-2"
                          {...(value.$?.title)}
                        >
                          {value.title}
                        </h3>
                        <p
                          className="text-sm text-stone leading-relaxed"
                          {...(value.$?.description)}
                        >
                          {value.description}
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
              className="bg-charcoal py-16"
              {...(page.$?.[`sections__${index}`])}
            >
              <Container>
                <div className="max-w-2xl mx-auto text-center">
                  <h2
                    className="font-heading text-2xl font-semibold text-white mb-4"
                    {...(data.$?.heading)}
                  >
                    {data.heading}
                  </h2>
                  <p
                    className="text-sand-200 mb-8"
                    {...(data.$?.description)}
                  >
                    {data.description}
                  </p>
                  <a
                    href={data.cta_link || "/dogs"}
                    className="inline-block bg-sage text-white px-8 py-3 rounded-full font-medium hover:bg-sage-light transition-colors"
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
