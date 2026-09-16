"use client";

import { useState } from "react";

type Props = {
  before: string;
  after: string;
  dogName: string;
  optimized: boolean;
};

// Demo-only sidebar: shows the page as an AI engine would consume it, BEFORE
// vs AFTER the generated SEO/AEO/GEO layer. Each tab is a self-contained prompt
// you can copy into a fresh Claude instance to show the answer-quality jump.
export default function SeoDemoWidget({ before, after, dogName, optimized }: Props) {
  const [tab, setTab] = useState<"before" | "after">("before");
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const text = tab === "before" ? before : after;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can still select the text */
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 top-28 z-50 rounded-full bg-charcoal px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-charcoal/90"
      >
        ✨ SEO/AEO/GEO demo
      </button>
    );
  }

  return (
    <aside className="fixed right-4 top-24 z-50 flex max-h-[80vh] w-[min(92vw,420px)] flex-col rounded-2xl border border-sand-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-sand-200 px-4 py-3">
        <div>
          <p className="font-heading text-sm font-bold text-charcoal">
            What an AI engine sees
          </p>
          <p className="text-xs text-pebble">{dogName} · prompt for an LLM</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Hide demo widget"
          className="rounded-full px-2 py-1 text-pebble hover:bg-sand-100"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 pt-3">
        {(["before", "after"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? t === "after"
                  ? "bg-emerald-600 text-white"
                  : "bg-charcoal text-white"
                : "bg-sand-100 text-pebble hover:bg-sand-200"
            }`}
          >
            {t === "before" ? "Before" : "After"}
          </button>
        ))}
      </div>

      {/* Caption */}
      <p className="px-4 pt-2 text-xs text-pebble">
        {tab === "before"
          ? "Raw page text only — no structured data. The model has to guess."
          : optimized
            ? "Generated SEO/AEO/GEO: Product facts + AI summary + FAQ. The model answers and cites."
            : "This dog's SEO fields are empty — run the Contentstack agent to populate them, then re-open this tab."}
      </p>

      {/* Prompt */}
      <pre className="m-3 flex-1 overflow-auto whitespace-pre-wrap rounded-lg bg-sand-50 p-3 text-[11px] leading-relaxed text-charcoal">
        {text}
      </pre>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-sand-200 px-4 py-3">
        <span className="text-xs text-pebble">
          Paste into a fresh Claude to compare answers
        </span>
        <button
          onClick={copy}
          className="rounded-lg bg-charcoal px-3 py-1.5 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          {copied ? "Copied ✓" : "Copy prompt"}
        </button>
      </div>
    </aside>
  );
}
