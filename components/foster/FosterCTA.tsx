"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ScrollReveal from "./ScrollReveal";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface FosterCTAProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  editTags?: EditableTags;
}

export default function FosterCTA({
  heading,
  description,
  ctaText,
  ctaLink,
  editTags,
}: FosterCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [dogAnim, setDogAnim] = useState(null);
  const [dogWalking, setDogWalking] = useState(false);

  useEffect(() => {
    fetch("/lottie-dog-walking.json")
      .then((r) => r.json())
      .then(setDogAnim);
  }, []);

  // Trigger walk when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !dogAnim) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDogWalking(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [dogAnim]);

  return (
    <section
      ref={sectionRef}
      id="apply"
      className="py-24 bg-gradient-to-br from-sage to-sage-light relative overflow-hidden"
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Dog walks back from right to left, flipped */}
      {dogAnim && (
        <div className="absolute bottom-0 left-0 w-full h-[200px] md:h-[280px] pointer-events-none overflow-hidden">
          <div
            className="absolute bottom-0 w-[200px] h-[200px] md:w-[280px] md:h-[280px] opacity-30"
            style={{
              transform: dogWalking
                ? "translateX(-10%) scaleX(-1)"
                : "translateX(calc(100vw)) scaleX(-1)",
              transition: dogWalking
                ? "transform 10s cubic-bezier(0.15, 0.0, 0.35, 1)"
                : "none",
            }}
          >
            <Lottie animationData={dogAnim} loop />
          </div>
        </div>
      )}

      <Container className="relative z-10">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="font-heading text-3xl md:text-4xl font-bold text-white mb-4"
              {...(editTags?.heading)}
            >
              {heading}
            </h2>
            <p
              className="text-white/80 text-lg mb-10"
              {...(editTags?.description)}
            >
              {description}
            </p>
            {ctaText && ctaLink && (
              <a
                href={ctaLink}
                className="inline-flex items-center gap-2 bg-white text-sage px-10 py-4 rounded-full text-lg font-semibold hover:bg-sand-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                {...(editTags?.cta_text)}
              >
                {ctaText}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            )}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
