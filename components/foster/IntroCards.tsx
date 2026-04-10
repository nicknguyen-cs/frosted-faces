"use client";

import { Home, Heart, Shield, Star, Users, Clock } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  heart: Heart,
  shield: Shield,
  star: Star,
  users: Users,
  clock: Clock,
};

interface IntroCardsProps {
  cards?: { icon: string; title: string; description: string; $?: EditableTags }[];
  editTags?: EditableTags;
}

export default function IntroCards({ cards, editTags }: IntroCardsProps) {
  if (!cards?.length) return null;

  return (
    <section className="py-24 bg-sand-50">
      <Container>
        <div
          className="grid md:grid-cols-3 gap-8"
          {...(editTags?.cards)}
        >
          {cards.map((card, i) => {
            const Icon = ICON_MAP[card.icon] || Heart;
            return (
              <ScrollReveal key={i} delay={i * 150}>
                <div
                  className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-sand-100"
                  {...(editTags?.[`cards__${i}`])}
                >
                  {/* Gradient accent on hover */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sage/5 to-terracotta/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sage/10 text-sage mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
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
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
