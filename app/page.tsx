import { getHomePage, getFeaturedDogs } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import Container from "@/components/layout/Container";
import Hero from "@/components/home/Hero";
import FeaturedDogs from "@/components/home/FeaturedDogs";
import CategoryBrowser from "@/components/home/CategoryBrowser";
import HowItWorks from "@/components/home/HowItWorks";
import MissionCTA from "@/components/home/MissionCTA";

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const homePage = await getHomePage(params);

  if (!homePage) return null;

  // Pre-fetch featured dogs if a featured_dogs block exists
  const featuredBlock = homePage.sections?.find((s) => "featured_dogs" in s);
  const dogLimit = featuredBlock && "featured_dogs" in featuredBlock
    ? (featuredBlock.featured_dogs.limit ?? 3)
    : 3;
  const dogs = featuredBlock
    ? await getFeaturedDogs(dogLimit, params)
    : [];

  return (
    <div {...(homePage.$ && homePage.$.sections)}>
      {homePage.sections?.map((section, index) => {
        if ("hero" in section) {
          const data = section.hero;
          return (
            <div key={index} {...(homePage.$?.[`sections__${index}`])}>
              <Hero
                heading={data.heading}
                description={data.description}
                imageUrl={data.image?.url}
                ctaText={data.cta_text}
                ctaLink={data.cta_link}
                editTags={data.$}
              />
            </div>
          );
        }

        if ("featured_dogs" in section) {
          const data = section.featured_dogs;
          return (
            <div key={index} {...(homePage.$?.[`sections__${index}`])}>
              <Container className="py-14">
                <FeaturedDogs dogs={dogs} heading={data.heading} editTags={data.$} />
              </Container>
            </div>
          );
        }

        if ("browse_by_type" in section) {
          const data = section.browse_by_type;
          return (
            <div key={index} {...(homePage.$?.[`sections__${index}`])}>
              <CategoryBrowser
                categories={data.categories}
                editTags={data.$}
              />
            </div>
          );
        }

        if ("how_it_works" in section) {
          const data = section.how_it_works;
          return (
            <div key={index} {...(homePage.$?.[`sections__${index}`])}>
              <HowItWorks
                steps={data.steps}
                editTags={data.$}
              />
            </div>
          );
        }

        if ("mission_cta" in section) {
          const data = section.mission_cta;
          return (
            <div key={index} {...(homePage.$?.[`sections__${index}`])}>
              <MissionCTA
                heading={data.heading}
                description={data.description}
                ctaText={data.cta_text}
                ctaLink={data.cta_link}
                editTags={data.$}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
