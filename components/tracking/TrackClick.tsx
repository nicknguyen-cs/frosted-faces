"use client";

import { useCallback, type ReactNode } from "react";

interface TrackClickProps {
  event: string;
  data?: Record<string, unknown>;
  children: ReactNode;
}

export default function TrackClick({ event, data, children }: TrackClickProps) {
  const handleClick = useCallback(() => {
    window.dataLayer?.push({ event, ...data });
  }, [event, data]);

  return (
    <span onClick={handleClick} className="contents">
      {children}
    </span>
  );
}
