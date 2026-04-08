import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import TrackClick from "@/components/tracking/TrackClick";
import type { EditableTags } from "@/lib/contentstack";

interface HeroProps {
  heading?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  editTags?: EditableTags;
}

export default function Hero({
  heading,
  description,
  imageUrl = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=700&fit=crop",
  ctaText,
  ctaLink,
  editTags,
}: HeroProps) {
  return (
    <section className="min-h-[60vh] flex items-center bg-sand-100 py-16 lg:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <h1
              className="font-heading text-5xl font-bold leading-tight text-charcoal md:text-6xl lg:text-7xl max-w-2xl"
              {...(editTags && editTags.heading)}
            >
              {heading}
            </h1>
            <p
              className="text-lg text-stone font-body max-w-lg"
              {...(editTags && editTags.description)}
            >
              {description}
            </p>
            {ctaText && ctaLink && (
              <div>
                <TrackClick event="cta_clicked" data={{ cta_text: ctaText, cta_link: ctaLink, location: "hero" }}>
                  <Button variant="primary" size="lg" asChild href={ctaLink}>
                    {ctaText} &rarr;
                  </Button>
                </TrackClick>
              </div>
            )}
            <div className="flex gap-6 pt-2 text-sm text-pebble font-body">
              <span className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-charcoal text-lg">500+</span>
                dogs adopted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-charcoal text-lg">15</span>
                years rescuing
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute -right-4 -bottom-4 h-full w-full rounded-3xl bg-terracotta/15" />
            <img
              src={imageUrl}
              alt="A happy dog looking at the camera"
              className="relative w-full rounded-3xl object-cover aspect-[4/3]"
              {...(editTags && editTags.image)}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
