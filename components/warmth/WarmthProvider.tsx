"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface WarmthContextValue {
  warmth: number;
  addWarmth: (amount: number) => void;
  skipFrost: () => void;
  registerDogSeen: (uid: string) => void;
  registerDogHovered: (uid: string) => void;
  hasHoveredOnce: boolean;
  reducedMotion: boolean;
}

export const WarmthContext = createContext<WarmthContextValue | null>(null);

const STORAGE_KEY = "ff-warmth";
const MAX_WARMTH = 100;

interface StoredWarmth {
  warmth: number;
  seenDogs: string[];
  hoveredDogs: string[];
  lastVisit: number;
  hasHoveredOnce: boolean;
  milestones: number[];
}

function loadWarmth(): StoredWarmth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveWarmth(state: StoredWarmth) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

function applyDecay(warmth: number, lastVisit: number): number {
  const daysSince = (Date.now() - lastVisit) / 86_400_000;
  if (daysSince < 0.04) return warmth; // less than ~1 hour, no decay
  const decayed = warmth * Math.pow(0.7, daysSince);
  return Math.max(0, Math.round(decayed)); // fully resets over time
}

function setCssWarmth(value: number) {
  document.documentElement.style.setProperty("--warmth", String(value));
}

export default function WarmthProvider({ children }: { children: ReactNode }) {
  const [warmth, setWarmth] = useState(0);
  const [hasHoveredOnce, setHasHoveredOnce] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const seenDogs = useRef(new Set<string>());
  const hoveredDogs = useRef(new Set<string>());
  const milestones = useRef(new Set<number>());
  const initialized = useRef(false);

  // Initialize from localStorage
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    // High contrast = force full warmth
    const hcMq = window.matchMedia("(prefers-contrast: more)");
    if (hcMq.matches) {
      setWarmth(MAX_WARMTH);
      setCssWarmth(MAX_WARMTH);
      initialized.current = true;
      return () => mq.removeEventListener("change", handler);
    }

    const stored = loadWarmth();
    if (stored) {
      const restoredWarmth = applyDecay(stored.warmth, stored.lastVisit);
      setWarmth(restoredWarmth);
      setCssWarmth(restoredWarmth);
      seenDogs.current = new Set(stored.seenDogs);
      hoveredDogs.current = new Set(stored.hoveredDogs);
      milestones.current = new Set(stored.milestones);
      setHasHoveredOnce(stored.hasHoveredOnce);
    }
    initialized.current = true;

    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync warmth to CSS and localStorage
  useEffect(() => {
    if (!initialized.current) return;
    setCssWarmth(warmth);
    saveWarmth({
      warmth,
      seenDogs: [...seenDogs.current],
      hoveredDogs: [...hoveredDogs.current],
      lastVisit: Date.now(),
      hasHoveredOnce,
      milestones: [...milestones.current],
    });
  }, [warmth, hasHoveredOnce]);

  const addWarmth = useCallback((amount: number) => {
    setWarmth((prev) => Math.min(MAX_WARMTH, prev + amount));
  }, []);

  const skipFrost = useCallback(() => {
    setWarmth(MAX_WARMTH);
  }, []);

  const registerDogSeen = useCallback(
    (uid: string) => {
      if (seenDogs.current.has(uid)) return;
      seenDogs.current.add(uid);
      addWarmth(3);
    },
    [addWarmth]
  );

  const registerDogHovered = useCallback(
    (uid: string) => {
      if (hoveredDogs.current.has(uid)) return;
      hoveredDogs.current.add(uid);

      if (!hasHoveredOnce) {
        setHasHoveredOnce(true);
        addWarmth(5); // first-ever hover is dramatic
      } else {
        addWarmth(2);
      }
    },
    [addWarmth, hasHoveredOnce]
  );

  return (
    <WarmthContext.Provider
      value={{
        warmth,
        addWarmth,
        skipFrost,
        registerDogSeen,
        registerDogHovered,
        hasHoveredOnce,
        reducedMotion,
      }}
    >
      {children}
    </WarmthContext.Provider>
  );
}
