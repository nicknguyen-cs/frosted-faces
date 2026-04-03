"use client";

import { useEffect, useState } from "react";
import { useWarmth } from "./useWarmth";

const DISMISSED_KEY = "ff-frost-banner-dismissed";

export default function FrostBanner() {
  const { warmth, skipFrost } = useWarmth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISSED_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Auto-hide once warmth passes 30 (they figured it out)
  useEffect(() => {
    if (warmth > 30 && visible) {
      dismiss();
    }
  }, [warmth, visible]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // noop
    }
  }

  function handleSkip() {
    skipFrost();
    dismiss();
  }

  if (!visible) return null;

  return (
    <div className="relative bg-charcoal/90 backdrop-blur-sm text-sand-50 px-6 py-4 text-sm leading-relaxed">
      <div className="mx-auto max-w-4xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body">
          <span className="mr-1.5">&#10052;</span>
          Our site starts frosted — like the grey muzzles of the senior dogs we
          rescue. Browse our dogs to bring the warmth back.
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleSkip}
            className="underline underline-offset-2 text-sand-200 hover:text-white transition-colors whitespace-nowrap"
          >
            Skip to full color
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="text-sand-200 hover:text-white transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
