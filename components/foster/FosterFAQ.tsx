"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

interface FosterFAQProps {
  heading?: string;
  items?: { question: string; answer: string; $?: EditableTags }[];
  editTags?: EditableTags;
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  editTags,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  editTags?: EditableTags;
}) {
  return (
    <div className="border-b border-sand-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group cursor-pointer"
      >
        <span
          className="font-heading text-lg font-medium text-charcoal group-hover:text-sage transition-colors pr-4"
          {...(editTags?.question)}
        >
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-pebble shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p
          className="text-stone leading-relaxed"
          {...(editTags?.answer)}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FosterFAQ({ heading, items, editTags }: FosterFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items?.length) return null;

  return (
    <section className="py-24 bg-sand-50">
      <Container>
        <ScrollReveal>
          <h2
            className="font-heading text-3xl md:text-4xl font-bold text-charcoal text-center mb-12"
            {...(editTags?.heading)}
          >
            {heading}
          </h2>
        </ScrollReveal>

        <div className="max-w-2xl mx-auto" {...(editTags?.items)}>
          {items.map((item, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <FAQItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                editTags={item.$}
              />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
