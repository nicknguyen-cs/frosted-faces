"use client";

import { useContext } from "react";
import { WarmthContext } from "./WarmthProvider";

export function useWarmth() {
  const ctx = useContext(WarmthContext);
  if (!ctx) {
    throw new Error("useWarmth must be used within a WarmthProvider");
  }
  return ctx;
}
