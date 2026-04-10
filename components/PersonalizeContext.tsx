"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Personalize from "@contentstack/personalize-edge-sdk";
import type { Sdk } from "@contentstack/personalize-edge-sdk/dist/sdk";

const PersonalizeContext = createContext<Sdk | null>(null);

let sdkInstance: Sdk | null = null;

async function getPersonalizeInstance(): Promise<Sdk | null> {
  const projectUid =
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  if (!projectUid) return null;

  try {
    if (!Personalize.getInitializationStatus()) {
      sdkInstance = await Personalize.init(projectUid);
    }
    return sdkInstance;
  } catch (e) {
    console.warn("[Personalize] Client SDK init failed:", e);
    return null;
  }
}

function getCurrentVariantParam(): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("cs-personalize-manifest="));
  if (!match) return null;
  try {
    const manifest = JSON.parse(
      decodeURIComponent(match.split("=").slice(1).join("="))
    );
    const experiences: { shortUid: string; activeVariantShortUid: string }[] =
      manifest.experiences ?? [];
    return experiences
      .map((e) => `${e.shortUid}_${e.activeVariantShortUid}`)
      .join(",");
  } catch {
    return null;
  }
}

const DEBOUNCE_MS = 3000;

export function PersonalizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const router = useRouter();

  const recheckVariants = useCallback(async () => {
    const projectUid =
      process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
    if (!projectUid) return;

    const before = getCurrentVariantParam();

    try {
      // Re-init the SDK to fetch fresh variant assignments from Edge API
      const freshSdk = await Personalize.init(projectUid);
      sdkInstance = freshSdk;
      setSdk(freshSdk);

      const after = getCurrentVariantParam();

      if (before !== after) {
        router.refresh();
      }
    } catch (e) {
      console.warn("[Personalize] Recheck failed:", e);
    }
  }, [router]);

  useEffect(() => {
    getPersonalizeInstance().then(setSdk);
  }, []);

  // Intercept dataLayer.push to trigger variant recheck after activity
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    window.dataLayer.push = function (...args: Record<string, unknown>[]) {
      const result = originalPush(...args);

      // Only recheck for app events, not GTM internal events
      const hasAppEvent = args.some(
        (arg) => typeof arg.event === "string" && !arg.event.startsWith("gtm.")
      );

      if (hasAppEvent) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(recheckVariants, DEBOUNCE_MS);
      }

      return result;
    };

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      // Restore original push
      window.dataLayer!.push = originalPush;
    };
  }, [recheckVariants]);

  return (
    <PersonalizeContext.Provider value={sdk}>
      {children}
    </PersonalizeContext.Provider>
  );
}

export function usePersonalize() {
  return useContext(PersonalizeContext);
}
