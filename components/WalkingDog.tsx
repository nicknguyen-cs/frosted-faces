"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface WalkingDogProps {
  /** Height classes for the container */
  height?: string;
  /** Opacity of the dog (0-1) */
  opacity?: number;
}

export default function WalkingDog({
  height = "h-[280px] md:h-[400px] lg:h-[500px]",
  opacity = 0.8,
}: WalkingDogProps) {
  const [dogAnim, setDogAnim] = useState(null);
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    fetch("/lottie-dog-walking.json")
      .then((r) => r.json())
      .then(setDogAnim);
  }, []);

  return (
    <div
      className={`absolute bottom-0 left-0 w-full ${height} pointer-events-none overflow-hidden`}
    >
      {dogAnim && (
        <div
          ref={(el) => {
            if (el && !walking) {
              requestAnimationFrame(() => setWalking(true));
            }
          }}
          className="absolute bottom-0 w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
          style={{
            opacity,
            transform: walking ? "translateX(calc(100vw - 100%))" : "translateX(-100%)",
            transition: walking ? "transform 10s cubic-bezier(0.15, 0.0, 0.35, 1)" : "none",
          }}
        >
          <Lottie animationData={dogAnim} loop />
        </div>
      )}
    </div>
  );
}
