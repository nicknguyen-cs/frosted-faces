"use client";

import { useEffect, useRef } from "react";
import { useWarmth } from "./useWarmth";

interface ProfileWarmthTrackerProps {
  dogUid: string;
}

export default function ProfileWarmthTracker({
  dogUid,
}: ProfileWarmthTrackerProps) {
  const { addWarmth } = useWarmth();
  const hasFiredMount = useRef(false);
  const hasFiredScroll = useRef(false);

  // +8 warmth on profile visit
  useEffect(() => {
    if (hasFiredMount.current) return;
    hasFiredMount.current = true;
    addWarmth(8);
  }, [addWarmth]);

  // +5 warmth when user scrolls past 50% of page
  useEffect(() => {
    const handleScroll = () => {
      if (hasFiredScroll.current) return;
      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) {
        hasFiredScroll.current = true;
        addWarmth(5);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [addWarmth]);

  return null;
}
