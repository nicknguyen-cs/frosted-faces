"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Container from "@/components/layout/Container";
import type { EditableTags } from "@/lib/contentstack";

interface ImpactStatsProps {
  stats?: { value: number; suffix: string; label: string; $?: EditableTags }[];
  editTags?: EditableTags;
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  const animate = useCallback(() => {
    if (started.current) return;
    started.current = true;

    const duration = 2000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function ImpactStats({ stats, editTags }: ImpactStatsProps) {
  if (!stats?.length) return null;

  return (
    <section className="py-24 bg-charcoal relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-sage/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-terracotta/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <Container className="relative">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          {...(editTags?.stats)}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center group"
              {...(editTags?.[`stats__${i}`])}
            >
              <p className="font-heading text-5xl md:text-6xl font-bold text-white mb-2">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </p>
              <p
                className="text-sand-200 text-sm uppercase tracking-wider"
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
