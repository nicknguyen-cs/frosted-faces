"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

export function PersonalizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sdk, setSdk] = useState<Sdk | null>(null);

  useEffect(() => {
    getPersonalizeInstance().then(setSdk);
  }, []);

  return (
    <PersonalizeContext.Provider value={sdk}>
      {children}
    </PersonalizeContext.Provider>
  );
}

export function usePersonalize() {
  return useContext(PersonalizeContext);
}
