import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import TrackClick from "@/components/tracking/TrackClick";
import type { EditableTags } from "@/lib/contentstack";

interface MissionCTAProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  editTags?: EditableTags;
}

export default function MissionCTA({
  heading,
  description,
  ctaText,
  ctaLink,
  editTags,
}: MissionCTAProps) {
  return (
    <section className="bg-terracotta py-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-heading text-3xl font-bold text-white md:text-4xl"
            {...(editTags && editTags.heading)}
          >
            {heading}
          </h2>
          <p
            className="mt-4 text-lg text-white/85 font-body"
            {...(editTags && editTags.description)}
          >
            {description}
          </p>
          {ctaText && ctaLink && (
            <div className="mt-8">
              <TrackClick event="cta_clicked" data={{ cta_text: ctaText, cta_link: ctaLink, location: "mission" }}>
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  href={ctaLink}
                  className="border-white text-white hover:bg-white/10"
                >
                  {ctaText} &rarr;
                </Button>
              </TrackClick>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
