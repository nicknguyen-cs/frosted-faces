export const dynamic = "force-dynamic";

import { getFosterPage } from "@/lib/contentstack";
import type { LivePreviewParams } from "@/lib/contentstack";
import FosterHero from "@/components/foster/FosterHero";
import IntroCards from "@/components/foster/IntroCards";
import FosterJourney from "@/components/foster/FosterJourney";
import ImpactStats from "@/components/foster/ImpactStats";
import FosterFAQ from "@/components/foster/FosterFAQ";
import FosterCTA from "@/components/foster/FosterCTA";

export const metadata = {
  title: "Foster a Dog | Frosted Faces Foundation",
  description:
    "Open your home to a senior dog in need. Learn about fostering, the journey, and how to apply.",
};

interface PageProps {
  searchParams: Promise<LivePreviewParams>;
}

export default async function FosterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = await getFosterPage(params);

  if (!page) return null;

  return (
    <div {...(page.$ && page.$.sections)}>
      {page.sections?.map((section, index) => {
        if ("hero" in section) {
          const data = section.hero;
          return (
            <div key={index} {...(page.$?.[`sections__${index}`])}>
              <FosterHero
                heading={data.heading}
                description={data.description}
                ctaText={data.cta_text}
                ctaLink={data.cta_link}
                editTags={data.$}
              />
            </div>
          );
        }

        if ("intro_cards" in section) {
          const data = section.intro_cards;
          return (
            <div key={index} {...(page.$?.[`sections__${index}`])}>
              <IntroCards cards={data.cards} editTags={data.$} />
            </div>
          );
        }

        if ("foster_journey" in section) {
          const data = section.foster_journey;
          return (
            <div key={index} {...(page.$?.[`sections__${index}`])}>
              <FosterJourney
                heading={data.heading}
                steps={data.steps}
                editTags={data.$}
              />
            </div>
          );
        }

        if ("impact_stats" in section) {
          const data = section.impact_stats;
          return (
            <div key={index} {...(page.$?.[`sections__${index}`])}>
              <ImpactStats stats={data.stats} editTags={data.$} />
            </div>
          );
        }

        if ("faq" in section) {
          const data = section.faq;
          return (
            <div key={index} {...(page.$?.[`sections__${index}`])}>
              <FosterFAQ
                heading={data.heading}
                items={data.items}
                editTags={data.$}
              />
            </div>
          );
        }

        if ("cta_banner" in section) {
          const data = section.cta_banner;
          return (
            <div key={index} {...(page.$?.[`sections__${index}`])}>
              <FosterCTA
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
