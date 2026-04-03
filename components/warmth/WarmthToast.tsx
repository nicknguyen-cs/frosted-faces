"use client";

import { useEffect, useRef, useState } from "react";
import { useWarmth } from "./useWarmth";

const MILESTONES: Record<number, string> = {
  50: "The frost is starting to thaw...",
  100: "No more frost. Just faces waiting to love you back.",
};

const MILESTONE_KEY = "ff-warmth-milestones";

function getShownMilestones(): Set<number> {
  try {
    const raw = localStorage.getItem(MILESTONE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markMilestoneShown(milestone: number) {
  try {
    const shown = getShownMilestones();
    shown.add(milestone);
    localStorage.setItem(MILESTONE_KEY, JSON.stringify([...shown]));
  } catch {
    // noop
  }
}

export default function WarmthToast() {
  const { warmth } = useWarmth();
  const [message, setMessage] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const shownRef = useRef<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentMilestone = useRef<number>(0);

  // Load shown milestones on mount
  useEffect(() => {
    shownRef.current = getShownMilestones();
  }, []);

  useEffect(() => {
    for (const [threshold, msg] of Object.entries(MILESTONES)) {
      const t = Number(threshold);
      if (warmth >= t && !shownRef.current.has(t)) {
        shownRef.current.add(t);
        markMilestoneShown(t);

        // Clear any existing toast
        if (timerRef.current) clearTimeout(timerRef.current);
        setExiting(false);
        currentMilestone.current = t;
        setMessage(msg);

        // Full warmth banner stays longer
        const duration = t === 100 ? 6000 : 3500;
        timerRef.current = setTimeout(() => {
          setExiting(true);
          setTimeout(() => setMessage(null), 600);
        }, duration);

        break; // only show one at a time
      }
    }
  }, [warmth]);

  if (!message) return null;

  const isFull = currentMilestone.current === 100;

  // Full warmth = prominent banner across the top
  if (isFull) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10001,
          padding: "20px 24px",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #C4704B 0%, #D4A84B 50%, #C4704B 100%)",
          backgroundSize: "200% 200%",
          color: "#FAF8F5",
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "var(--font-heading)",
          letterSpacing: "0.01em",
          lineHeight: 1.5,
          boxShadow: "0 4px 24px rgba(196, 112, 75, 0.3)",
          animation: exiting
            ? "banner-out 0.6s ease forwards"
            : "banner-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, banner-shimmer 3s ease infinite",
        }}
      >
        {message}
      </div>
    );
  }

  // Sub-milestones = small toast bottom-right
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 10001,
        maxWidth: 320,
        padding: "12px 20px",
        borderRadius: 12,
        background: "rgba(44, 44, 44, 0.85)",
        backdropFilter: "blur(8px)",
        color: "#FAF8F5",
        fontSize: 14,
        fontFamily: "var(--font-body)",
        lineHeight: 1.5,
        animation: exiting
          ? "toast-out 0.5s ease forwards"
          : "toast-in 0.4s ease forwards",
      }}
    >
      {message}
    </div>
  );
}
