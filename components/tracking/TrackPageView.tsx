"use client";

import { useEffect } from "react";

interface TrackPageViewProps {
  event: string;
  data: Record<string, unknown>;
}

export default function TrackPageView({ event, data }: TrackPageViewProps) {
  useEffect(() => {
    window.dataLayer?.push({ event, ...data });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
