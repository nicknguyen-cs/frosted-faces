"use client";

import { useEffect, useState } from "react";
import { useWarmth } from "./useWarmth";

const INTRO_FLAG = "ff-seen-intro";

interface Particle {
  id: number;
  left: string;
  size: number;
  delay: string;
  duration: string;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    delay: `${Math.random() * 2}s`,
    duration: `${3 + Math.random() * 3}s`,
  }));
}

export default function FrostParticles() {
  const { reducedMotion } = useWarmth();
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    // Only show once ever
    try {
      if (localStorage.getItem(INTRO_FLAG)) return;
      localStorage.setItem(INTRO_FLAG, "1");
    } catch {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const count = isMobile ? 8 : 18;
    setParticles(generateParticles(count));

    // Auto-remove after 5 seconds
    const timer = setTimeout(() => setParticles(null), 5000);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  if (!particles) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10000,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-10px",
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(220,225,240,0.9), rgba(200,210,230,0.4))",
            animation: `frost-drift ${p.duration} ${p.delay} ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}
