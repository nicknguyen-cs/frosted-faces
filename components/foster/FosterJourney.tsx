"use client";

import ScrollReveal from "./ScrollReveal";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

interface FosterJourneyProps {
  heading?: string;
  steps?: { day_label: string; title: string; description: string; $?: EditableTags }[];
  editTags?: EditableTags;
}

export default function FosterJourney({ heading, steps, editTags }: FosterJourneyProps) {
  if (!steps?.length) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <Container>
        <ScrollReveal>
          <h2
            className="font-heading text-3xl md:text-4xl font-bold text-charcoal text-center mb-16"
            {...(editTags?.heading)}
          >
            {heading}
          </h2>
        </ScrollReveal>

        <div className="relative max-w-4xl mx-auto" {...(editTags?.steps)}>
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-sage/0 via-sage/40 to-sage/0 md:-translate-x-px" />

          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <ScrollReveal
                key={i}
                delay={i * 100}
                direction={isEven ? "left" : "right"}
              >
                <div
                  className={`relative flex items-start gap-6 mb-12 last:mb-0 md:gap-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  {...(editTags?.[`steps__${i}`])}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-sage border-4 border-white shadow-sm -translate-x-1.5 mt-2 z-10" />

                  {/* Spacer for mobile (left side of dot) */}
                  <div className="w-12 shrink-0 md:hidden" />

                  {/* Content card */}
                  <div className={`flex-1 md:w-[calc(50%-2rem)] ${isEven ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <span
                      className="inline-block text-xs font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3 py-1 rounded-full mb-3"
                      {...(step.$?.day_label)}
                    >
                      {step.day_label}
                    </span>
                    <h3
                      className="font-heading text-xl font-semibold text-charcoal mb-2"
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
                  </div>

                  {/* Spacer for the other side on desktop */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
