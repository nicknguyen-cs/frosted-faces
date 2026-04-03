"use client";

import { useWarmth } from "./useWarmth";

export default function WarmthIndicator() {
  const { warmth } = useWarmth();

  // Interpolate color: cold grey (warmth 0) → amber (50) → terracotta (100)
  const getColor = () => {
    if (warmth < 50) {
      // Grey to amber
      const t = warmth / 50;
      const r = Math.round(156 + (212 - 156) * t);
      const g = Math.round(149 + (168 - 149) * t);
      const b = Math.round(144 + (75 - 144) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
    // Amber to terracotta
    const t = (warmth - 50) / 50;
    const r = Math.round(212 + (196 - 212) * t);
    const g = Math.round(168 + (112 - 168) * t);
    const b = Math.round(75 + (75 - 75) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const color = getColor();
  const glowSize = 4 + (warmth / 100) * 8;
  const shouldPulse = warmth > 30;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 50,
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 ${glowSize}px ${color}`,
        animation: shouldPulse ? "ember-pulse 3s ease-in-out infinite" : "none",
        transition: "background-color 1.5s ease, box-shadow 1.5s ease",
      }}
    />
  );
}
