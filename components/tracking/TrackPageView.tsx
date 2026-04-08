"use client";

import { useEffect } from "react";
import { lyticsSend } from "@/lib/lytics";

interface TrackPageViewProps {
  event: string;
  data: Record<string, unknown>;
}

export default function TrackPageView({ event, data }: TrackPageViewProps) {
  useEffect(() => {
    lyticsSend({ event, ...data });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
