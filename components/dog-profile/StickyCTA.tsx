"use client";

import { useEffect, useState } from "react";

type StickyCTAProps = {
  dogName: string;
};

export default function StickyCTA({ dogName }: StickyCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("profile-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 bg-sand-50/90 backdrop-blur shadow-sm transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
        <span className="font-heading font-semibold text-charcoal truncate">
          {dogName}
        </span>
        <a
          href="#inquiry"
          className="shrink-0 rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark"
        >
          Apply to Adopt
        </a>
      </div>
    </div>
  );
}
