"use client";

import { useWarmth } from "./useWarmth";

export default function FrostOverlay() {
  const { warmth } = useWarmth();

  // Fully warm — no overlay needed
  if (warmth >= 100) return null;

  const opacity = 0.12 * ((100 - warmth) / 100);

  return (
    <div
      className="frost-overlay"
      aria-hidden="true"
      style={{ opacity }}
    />
  );
}
