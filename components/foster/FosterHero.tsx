"use client";

import { useEffect, useRef, useState } from "react";
import WalkingDog from "@/components/WalkingDog";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

interface FosterHeroProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  editTags?: EditableTags;
}

export default function FosterHero({
  heading,
  description,
  ctaText,
  ctaLink,
  editTags,
}: FosterHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const progress = Math.min(Math.max(-rect.top / sectionHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[85vh] flex items-center overflow-hidden"
    >
      {/* Parallax gradient background */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${scrollProgress * 80}px)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sand-100 via-sand-50 to-sage/20" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-terracotta/15 blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-sage/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-sand-200/30 blur-3xl" />
      </div>

      <WalkingDog />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <h1
            className={`font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-tight transition-all duration-1000 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            {...(editTags?.heading)}
          >
            {heading}
          </h1>
          <p
            className={`mt-6 text-xl text-stone leading-relaxed max-w-xl transition-all duration-1000 delay-200 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            {...(editTags?.description)}
          >
            {description}
          </p>
          {ctaText && ctaLink && (
            <div
              className={`mt-10 transition-all duration-1000 delay-500 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <a
                href={ctaLink}
                className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-terracotta-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                {...(editTags?.cta_text)}
              >
                {ctaText}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </Container>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-6 h-10 rounded-full border-2 border-charcoal/30 flex justify-center pt-2">
          <div className="w-1 h-3 bg-charcoal/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
