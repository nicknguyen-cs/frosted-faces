"use client";

import { useState, useEffect } from "react";

interface ExperienceInfo {
  shortUid: string;
  activeVariantShortUid: string;
}

interface ExperienceMeta {
  name: string;
  variants: Record<string, { label: string; description: string }>;
}

const experienceMap: Record<string, ExperienceMeta> = {
  "0": {
    name: "A/B Test",
    variants: {
      "0": { label: "Group A", description: "Emotional / warm messaging" },
      "1": { label: "Group B", description: "Urgency / impact messaging" },
    },
  },
  "2": {
    name: "Audience Personalization",
    variants: {
      "0": { label: "Small Dog Seekers", description: "Small dog focused content" },
      "1": { label: "High-Intent Adopters", description: "Conversion-focused messaging" },
      "2": { label: "Active Browsers", description: "Social proof messaging" },
      "3": { label: "First-Time Visitors", description: "Welcome / educational content" },
    },
  },
};

const variantColors = [
  "bg-sage",
  "bg-terracotta",
  "bg-charcoal",
  "bg-terracotta-dark",
  "bg-sage-light",
];

function getExperiencesFromManifestCookie(): ExperienceInfo[] {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("cs-personalize-manifest="));
  if (!match) return [];

  try {
    const manifest = JSON.parse(
      decodeURIComponent(match.split("=").slice(1).join("="))
    );
    return manifest.experiences ?? [];
  } catch {
    return [];
  }
}

export default function PersonalizeBadge() {
  const [open, setOpen] = useState(false);
  const [experiences, setExperiences] = useState<ExperienceInfo[]>([]);

  useEffect(() => {
    setExperiences(getExperiencesFromManifestCookie());
  }, []);

  const activeExperiences = experiences.filter(
    (e) => e.activeVariantShortUid !== undefined
  );

  const activeCount = activeExperiences.length;
  const badgeLabel =
    activeCount === 0
      ? "Base"
      : activeCount === 1
        ? experienceMap[activeExperiences[0].shortUid]?.variants[
            activeExperiences[0].activeVariantShortUid
          ]?.label ?? `Variant ${activeExperiences[0].activeVariantShortUid}`
        : `${activeCount} experiences`;

  const badgeColor = activeCount > 0 ? "bg-sage" : "bg-stone";

  return (
    <div className="fixed bottom-4 right-4 z-50 font-body">
      <button
        onClick={() => setOpen(!open)}
        className={`${badgeColor} text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all hover:scale-105`}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-white/50 animate-pulse" />
        {badgeLabel}
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-72 bg-white rounded-xl shadow-xl border border-sand-200 p-4 text-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-bold text-charcoal text-sm">
              Personalize
            </span>
            <span className="text-[10px] text-pebble">
              {activeCount} active experience{activeCount !== 1 && "s"}
            </span>
          </div>

          {activeExperiences.length === 0 ? (
            <div className="text-xs text-stone py-2">
              No active experiences — showing base content
            </div>
          ) : (
            <div className="space-y-3">
              {activeExperiences.map((exp, i) => {
                const meta = experienceMap[exp.shortUid];
                const variantMeta =
                  meta?.variants[exp.activeVariantShortUid];
                const color = variantColors[i % variantColors.length];
                const variantParam = `${exp.shortUid}_${exp.activeVariantShortUid}`;

                return (
                  <div
                    key={exp.shortUid}
                    className="border border-sand-200 rounded-lg p-2.5"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-pebble">
                        {meta?.name ?? `Experience ${exp.shortUid}`}
                      </span>
                      <span
                        className={`${color} text-white text-[10px] font-medium px-2 py-0.5 rounded-full`}
                      >
                        {variantMeta?.label ??
                          `Variant ${exp.activeVariantShortUid}`}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal">
                      {variantMeta?.description ?? "Custom variant"}
                    </p>
                    <p className="text-[10px] text-pebble font-mono mt-1">
                      {variantParam}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* All variants legend */}
          <div className="mt-3 pt-3 border-t border-sand-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeExperiences.map((exp) => {
                const meta = experienceMap[exp.shortUid];
                if (!meta) return null;
                return Object.entries(meta.variants).map(([vKey, v]) => {
                  const isActive =
                    exp.activeVariantShortUid === vKey;
                  return (
                    <span
                      key={`${exp.shortUid}_${vKey}`}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? "bg-sage text-white"
                          : "bg-sand-100 text-pebble"
                      }`}
                    >
                      {v.label}
                    </span>
                  );
                });
              })}
              <button
                onClick={() => {
                  document.cookie =
                    "cs-personalize-user-uid=; max-age=0; path=/";
                  document.cookie =
                    "cs-personalize-manifest=; max-age=0; path=/";
                  window.location.reload();
                }}
                className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium bg-charcoal text-white hover:bg-stone transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
