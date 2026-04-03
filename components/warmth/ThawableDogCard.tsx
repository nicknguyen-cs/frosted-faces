"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWarmth } from "./useWarmth";

interface ThawableDogCardProps {
  dogUid: string;
  children: ReactNode;
}

export default function ThawableDogCard({
  dogUid,
  children,
}: ThawableDogCardProps) {
  const { registerDogSeen, registerDogHovered, hasHoveredOnce, warmth } =
    useWarmth();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstHover = useRef(!hasHoveredOnce);

  // Track first-hover state
  useEffect(() => {
    isFirstHover.current = !hasHoveredOnce;
  }, [hasHoveredOnce]);

  // IntersectionObserver to detect when card scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          registerDogSeen(dogUid);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [dogUid, registerDogSeen]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimer.current = setTimeout(() => {
      registerDogHovered(dogUid);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // On touch devices, trigger on touchstart
  const handleTouchStart = () => {
    setIsHovered(true);
    registerDogSeen(dogUid);
    hoverTimer.current = setTimeout(() => {
      registerDogHovered(dogUid);
    }, 300);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // At full warmth, no need for the thaw card effect
  const isFullyWarm = warmth >= 100;

  const className = isFullyWarm
    ? ""
    : `thaw-card${isHovered ? " thawed" : ""}${
        isHovered && isFirstHover.current ? " thaw-first" : ""
      }`;

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
