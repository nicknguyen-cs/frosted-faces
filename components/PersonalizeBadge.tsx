"use client";

import { useState, useEffect } from "react";

const variantMeta: Record<string, { label: string; color: string }> = {
  "0_0": { label: "Variant A", color: "bg-sage" },
  "0_1": { label: "Variant B", color: "bg-terracotta" },
};

const descriptions: Record<string, string> = {
  "0_0": "Emotional / warm messaging",
  "0_1": "Urgency / impact messaging",
};

function getVariantFromManifestCookie(): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("cs-personalize-manifest="));
  if (!match) return null;

  try {
    const manifest = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
    const experiences: { shortUid: string; activeVariantShortUid: string }[] =
      manifest.experiences ?? [];
    if (experiences.length === 0) return null;

    return experiences
      .map((e) => `${e.shortUid}_${e.activeVariantShortUid}`)
      .join(",");
  } catch {
    return null;
  }
}

export default function PersonalizeBadge() {
  const [open, setOpen] = useState(false);
  const [variantParam, setVariantParam] = useState<string | null>(null);

  useEffect(() => {
    setVariantParam(getVariantFromManifestCookie());
  }, []);

  const pairs = variantParam?.split(",").filter(Boolean) ?? [];
  const active = pairs.length > 0 ? pairs[0] : null;
  const meta = active ? variantMeta[active] : null;

  const label = meta?.label ?? "Base";
  const color = meta?.color ?? "bg-stone";
  const description = active
    ? descriptions[active]
    : "Default content (no variant)";

  return (
    <div className="fixed bottom-4 right-4 z-50 font-body">
      <button
        onClick={() => setOpen(!open)}
        className={`${color} text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all hover:scale-105`}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-white/50 animate-pulse" />
        {label}
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-64 bg-white rounded-xl shadow-xl border border-sand-200 p-4 text-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-bold text-charcoal text-sm">
              Personalize
            </span>
            <span
              className={`${color} text-white text-[10px] font-medium px-2 py-0.5 rounded-full`}
            >
              {label}
            </span>
          </div>

          <div className="space-y-2 text-xs text-stone">
            <div>
              <span className="text-pebble">Experience</span>
              <p className="text-charcoal font-medium">
                Frosted Faces A/B Test
              </p>
            </div>
            <div>
              <span className="text-pebble">Strategy</span>
              <p className="text-charcoal font-medium">{description}</p>
            </div>
            {variantParam && (
              <div>
                <span className="text-pebble">Variant param</span>
                <p className="text-charcoal font-mono text-[11px]">
                  {variantParam}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-sand-200 flex items-center gap-1.5">
            {Object.entries(variantMeta).map(([key, v]) => (
              <span
                key={key}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  active === key
                    ? `${v.color} text-white`
                    : "bg-sand-100 text-pebble"
                }`}
              >
                {v.label}
              </span>
            ))}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                !active ? "bg-stone text-white" : "bg-sand-100 text-pebble"
              }`}
            >
              Base
            </span>
            <button
              onClick={() => {
                document.cookie = "cs-personalize-user-uid=; max-age=0; path=/";
                document.cookie = "cs-personalize-manifest=; max-age=0; path=/";
                window.location.reload();
              }}
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium bg-charcoal text-white hover:bg-stone transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
