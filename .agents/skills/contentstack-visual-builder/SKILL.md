---
name: contentstack-visual-builder
description: >-
  Implementation guide for Contentstack Visual Builder, Live Preview, and Timeline
  with data-cslp tags in Next.js. Covers SDK init (the `enable` master-switch
  pattern, production gating with one env var, the misleading
  cleanCslpOnProduction flag, disabling the floating "Start editing" button),
  modular blocks (schema, rendering, three-level CSLP tagging), group field
  CSLP patterns, live-preview vs visual-builder postMessage channels, content
  type schema best practices, Timeline (preview_timestamp) setup, and a
  diagnostic recipe for when nothing seems to work. Use when building Visual
  Builder-enabled pages, adding data-cslp tags, creating modular block content
  types, implementing Timeline, gating preview features for production, or
  debugging live preview / visual builder issues.
license: MIT
metadata:
  author: contentstack
  version: "1.1"
  last_updated: "2026-05-06"
---

# Contentstack Visual Builder Implementation Guide

Practical patterns for implementing Visual Builder with data-cslp tags in Next.js, learned from building a production site.

## data-cslp Tag Format

The `data-cslp` attribute tells Visual Builder which field to edit:

```
{content_type_uid}.{entry_uid}.{locale}.{field_path}
```

You never write these manually. Contentstack's `addEditableTags` utility generates them and attaches them to a `$` property on the entry/block object. Spread them onto elements:

```tsx
<h1 {...(entry.$ && entry.$.title)}>{entry.title}</h1>
```

## Visual Builder Client Setup (Next.js)

Create a client component that initializes the SDK and include it in the root layout. There are several config keys here whose names are misleading — read the **"How `enable` actually works"** and **"Letting Visual Builder work on prod safely"** sections below before changing anything.

```tsx
"use client";
import { useEffect } from "react";
import contentstack from "@contentstack/delivery-sdk";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import type { IStackSdk } from "@contentstack/live-preview-utils";

export default function ContentstackVisualBuilder() {
  useEffect(() => {
    const stack = contentstack.stack({
      apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
      deliveryToken: "unused-on-client",
      environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
      region: process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || "us",
      live_preview: {
        enable: true,
        preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN,
        host: "rest-preview.contentstack.com",
      },
    });

    ContentstackLivePreview.init({
      ssr: true,
      enable: true,
      mode: "builder",
      stackSdk: stack.config as unknown as IStackSdk,
      stackDetails: {
        apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
        environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
      },
      // Inline edit pencils on each field, but only rendered when the URL has
      // `?live_preview` (i.e. when the page is opened from the CMS).
      editButton: { enable: true, includeByQueryParameter: true },
      // The floating "Start editing in Visual Builder" button. Defaults to
      // true; explicitly disable so it doesn't appear on every page.
      editInVisualBuilderButton: { enable: false },
      cleanCslpOnProduction: true,
    });
  }, []);

  return null;
}
```

### How `enable` actually works

`ContentstackLivePreview.init({ enable })` is a true on/off master switch — **not a hint**. The SDK source gates its entire boot on it:

- `live-preview.js`: `if (config.enable) { /* attach postMessage listeners */ } else if (config.cleanCslpOnProduction) { removeDataCslp() }`
- `visualBuilder/index.js`: `if (!config.enable) return;` — Visual Builder bridge bails before doing anything

When `enable: false`, no postMessage listeners attach, no edit pencils render, and `data-cslp` attrs get stripped from the DOM.

**Never gate `enable` on URL params** like `URLSearchParams(location.search).has("live_preview")`. The Visual Builder iframe sometimes loads at the bare URL and receives the hash via postMessage afterwards — by then the SDK has already booted dead.

### `cleanCslpOnProduction` is misleading

The SDK contains **no `NODE_ENV` detection**. The flag only takes effect when `enable: false`. Read it as: "If you decide not to enable the SDK, also strip leftover edit tags from the DOM." It does not auto-disable in production.

### Letting Visual Builder work on prod safely

Most teams want marketers to be able to preview against production data — i.e., open the prod site through the CMS and edit. That requires `enable: true` on prod. Without care, that would also leak `data-cslp` attrs and edit UI to every public visitor. There are two layers that prevent leakage on plain page views:

1. **Server-side gating of edit tags** — only call `addEditableTags()` when the request URL has `live_preview` (or `preview_timestamp`):

   ```ts
   if (entry && previewParams?.live_preview) addEditTags(entry, "page");
   ```

   On a regular visitor, the server doesn't add `data-cslp` to the HTML at all. Nothing for the SDK to attach to.

2. **`editButton.includeByQueryParameter: true`** — the SDK only renders the inline edit pencils when `?live_preview` is in the URL. Plus `editInVisualBuilderButton: { enable: false }` to suppress the floating Start-editing button entirely.

With both layers in place, you can safely keep `enable: true` on production. Plain visitors get clean HTML and no UI. The CMS iframe (which adds `?live_preview=…` to the URL it loads) gets the full experience.

The trade-off is bundle size: `@contentstack/live-preview-utils` ships to all visitors (~250KB minified). If that's unacceptable, gate `enable` (and ideally the import itself) on a `NEXT_PUBLIC_CONTENTSTACK_PREVIEW_ENABLED` env var per-environment in Launch — but that means marketers can only preview against a dedicated staging URL, not production.

## Server-Side: addEditableTags

Call `addEditableTags` after fetching an entry to populate the `$` property:

```typescript
import contentstack from "@contentstack/delivery-sdk";

function addEditTags(entry: unknown, contentTypeUid: string, locale = "en-us") {
  if (entry) {
    contentstack.Utils.addEditableTags(entry as any, contentTypeUid, true, locale);
  }
}
```

The third argument (`true`) enables nested tag generation for groups, modular blocks, and references.

## Live Preview Query Params

For SSR mode, Contentstack sends query params to your page: `?live_preview=hash&entry_uid=...&content_type_uid=...`. Your page must read these and pass them to the stack:

```typescript
export interface LivePreviewParams {
  live_preview?: string;
  entry_uid?: string;
  content_type_uid?: string;
  preview_timestamp?: string;
}

function applyLivePreview(stack, params: LivePreviewParams, defaultContentType: string) {
  if (params.live_preview || params.preview_timestamp) {
    stack.livePreviewQuery({
      live_preview: params.live_preview || "",
      contentTypeUid: params.content_type_uid || defaultContentType,
      entryUid: params.entry_uid || "",
      preview_timestamp: params.preview_timestamp,
    });
  }
}
```

**Important:** Create a fresh stack instance per preview request to avoid cross-session data leakage. This applies to both live preview and Timeline requests.

## Timeline Support

The [Timeline](https://www.contentstack.com/docs/content-managers/timeline/about-timeline) feature lets editors preview how their site will look at a future point in time when scheduled updates go live.

### How It Works

Contentstack sends a `preview_timestamp` query parameter to your page (via the iframe). The SDK uses this timestamp to return the entry state as it will appear at that moment.

### Implementation

1. **Include `preview_timestamp` in `LivePreviewParams`** — it arrives as a search param alongside `live_preview`, `entry_uid`, etc.

2. **Pass it to `livePreviewQuery`** — the Delivery SDK accepts `preview_timestamp` in its `LivePreviewQuery` type.

3. **Create a fresh stack when `preview_timestamp` is present** — just like `live_preview`, Timeline requests need an isolated stack instance to avoid cross-session leakage:

```typescript
const s = previewParams?.live_preview || previewParams?.preview_timestamp
  ? createStack()
  : stack;
```

4. **Trigger `applyLivePreview` on either param** — Timeline can be used without a `live_preview` hash, so gate on both:

```typescript
if (params.live_preview || params.preview_timestamp) {
  stackInstance.livePreviewQuery({ ... });
}
```

### Requirements

- `@contentstack/live-preview-utils` version **2.0** or above
- Live Preview edit tags (`data-cslp`) must be present — Timeline compare/highlight-differences depends on them
- No additional page-level changes needed if your pages already pass the full `searchParams` as `LivePreviewParams`

---

## Modular Blocks

### Content Type Schema

Modular blocks use `data_type: "blocks"` with `multiple: true` (required by Contentstack):

```json
{
  "display_name": "Sections",
  "uid": "sections",
  "data_type": "blocks",
  "multiple": true,
  "blocks": [
    {
      "title": "Hero",
      "uid": "hero",
      "autoEdit": true,
      "schema": [
        { "uid": "heading", "data_type": "text", ... },
        { "uid": "image", "data_type": "file", ... }
      ]
    },
    {
      "title": "Featured Content",
      "uid": "featured",
      "autoEdit": true,
      "schema": [
        { "uid": "heading", "data_type": "text", ... },
        { "uid": "limit", "data_type": "number", ... }
      ]
    }
  ]
}
```

**Key:** `multiple` MUST be `true` for blocks — Contentstack rejects the update otherwise.

### API Response Format

Modular blocks return as an array of single-key objects:

```json
{
  "sections": [
    { "hero": { "heading": "Welcome", "image": { "url": "..." } } },
    { "featured": { "heading": "Featured", "limit": 3 } }
  ]
}
```

### TypeScript Types

Use a discriminated union:

```typescript
export type PageSection =
  | { hero: HeroBlock }
  | { featured: FeaturedBlock }
  | { cta: CTABlock };

export interface PageEntry {
  uid: string;
  title: string;
  sections: PageSection[];
  $?: EditableTags;
}
```

### Three-Level CSLP Tagging (Critical)

For Visual Builder to support **add, delete, and reorder** of modular blocks, you need three levels of tags:

```tsx
{/* Level 1: Container — marks the modular blocks field */}
<div {...(entry.$ && entry.$.sections)}>

  {entry.sections?.map((section, index) => {

    if ("hero" in section) {
      const data = section.hero;
      return (
        {/* Level 2: Block item — uses PARENT entry's $ with field__index */}
        <div key={index} {...(entry.$?.[`sections__${index}`])}>

          {/* Level 3: Inner fields — uses block's own $ */}
          <Hero editTags={data.$} ... />

        </div>
      );
    }
  })}
</div>
```

**Common mistake:** Using `data.$` for the block-level wrapper. The block item tag MUST come from the **parent entry's** `$` using the `field__${index}` pattern. The block's own `$` is for inner field tags only.

### Block Renderer Pattern

```tsx
export default async function Page() {
  const entry = await getPage();

  return (
    <div {...(entry.$ && entry.$.sections)}>
      {entry.sections?.map((section, index) => {
        if ("hero" in section) {
          return (
            <div key={index} {...(entry.$?.[`sections__${index}`])}>
              <HeroComponent {...section.hero} editTags={section.hero.$} />
            </div>
          );
        }
        if ("cta" in section) {
          return (
            <div key={index} {...(entry.$?.[`sections__${index}`])}>
              <CTAComponent {...section.cta} editTags={section.cta.$} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
```

---

## Group Fields (Multiple)

### Three-Level CSLP Tagging (Same as Modular Blocks)

Group fields with `multiple: true` require the **same three-level tagging** as modular blocks. Without all three levels, Visual Builder cannot add, delete, or reorder group instances — it can only edit existing field values inline.

```tsx
{/* Level 1: Container — enables the "+" add button */}
<div {...(editTags && editTags.categories)}>

  {categories.map((cat, index) => (
    {/* Level 2: Item wrapper — enables reorder/delete per instance */}
    <div key={index} {...(editTags && editTags[`categories__${index}`])}>

      {/* Level 3: Inner fields — enables inline editing */}
      <h3 {...(cat.$ && cat.$.title)}>{cat.title}</h3>
      <p {...(cat.$ && cat.$.description)}>{cat.description}</p>

    </div>
  ))}
</div>
```

**Common mistake:** Tagging only the inner fields (Level 3) and skipping Levels 1 and 2. This lets editors change existing text but prevents adding new instances or reordering — the "+" button never appears.

### Item Wrapper Must Have Clickable Area

The Level 2 item wrapper element **must have enough padding or visual space** for Visual Builder to detect hover/click on it. If the wrapper has zero padding and child elements fill it entirely, Visual Builder cannot distinguish the item wrapper from its children — making it impossible to select the item for delete or reorder.

```tsx
{/* BAD: No padding — child elements fill the wrapper, Visual Builder can't target it */}
<div key={i} {...(editTags && editTags[`stats__${i}`])}>
  <p>{stat.value}</p>
  <p>{stat.label}</p>
</div>

{/* GOOD: Padding gives Visual Builder a clickable boundary around the children */}
<div key={i} className="p-4 rounded-xl" {...(editTags && editTags[`stats__${i}`])}>
  <p>{stat.value}</p>
  <p>{stat.label}</p>
</div>
```

This is especially important for compact items like stats, tags, or icon grids where the content is small and tightly packed.

### Empty State Placeholder

When a group array is empty, the container div has zero height and Visual Builder has nothing to click. Add a visible placeholder:

```tsx
<div {...(editTags && editTags.items)}>
  {items.length === 0 && (
    <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
      Add items to get started
    </div>
  )}
  {items.map((item, index) => (
    <div key={index} className="p-4" {...(editTags && editTags[`items__${index}`])}>
      ...
    </div>
  ))}
</div>
```

---

## Content Type Schema Best Practices

### Field Metadata and Defaults

Set `default_value` in `field_metadata` so new instances come pre-populated in the CMS. **This is critical for Visual Builder** — without defaults, newly added group/block instances have empty fields that Visual Builder cannot target for inline editing (there's nothing to click). Always set defaults in the CMS content type schema, not in frontend code:

```json
{
  "uid": "heading",
  "data_type": "text",
  "field_metadata": {
    "default_value": "Your heading here",
    "description": "Main heading for this section",
    "version": 3
  }
}
```

For multiline text:
```json
{
  "uid": "description",
  "data_type": "text",
  "field_metadata": {
    "multiline": true,
    "default_value": "Add a description.",
    "version": 3
  }
}
```

**Important:** Do NOT put matching default values in your frontend component props. The CMS is the single source of truth. The only exception is file/image fields — use a placeholder image URL as a frontend default since `data_type: "file"` doesn't support `default_value`.

### Enum / Dropdown Fields

```json
{
  "uid": "status",
  "data_type": "text",
  "enum": {
    "advanced": false,
    "choices": [
      { "value": "active" },
      { "value": "pending" },
      { "value": "archived" }
    ]
  },
  "display_type": "dropdown",
  "field_metadata": { "default_value": "active", "version": 3 }
}
```

### File / Asset Fields

```json
{
  "uid": "hero_image",
  "data_type": "file",
  "multiple": false
}
```

Returns an object from the API:
```json
{
  "hero_image": {
    "uid": "blt...",
    "url": "https://images.contentstack.io/v3/assets/...",
    "filename": "photo.jpg",
    "content_type": "image/jpeg"
  }
}
```

**Gotcha:** The asset must be published separately before the entry can serve it via the Delivery API. Publishing the entry alone is not enough if the asset isn't published.

### Group Field with isTitle

For multiple groups (like a Photos group), set `isTitle: true` on one field so collapsed instances show a meaningful label:

```json
{
  "uid": "alt",
  "data_type": "text",
  "field_metadata": { "isTitle": true, "version": 3 }
}
```

### Content Type Options for Visual Builder

The content type must have `is_page: true` and a `url` field for Visual Builder to work:

```json
{
  "options": {
    "is_page": true,
    "singleton": true,
    "title": "title",
    "url_pattern": "/:slug",
    "url_prefix": "/"
  }
}
```

## Two postMessage Channels

The SDK uses **two separate postMessage channels** with different lifecycles. Knowing which is which is essential for debugging.

| Channel | Used by | Lifecycle |
|---|---|---|
| `live-preview` | Live Preview pane (eye-icon side panel) | Reload-based: CMS sends a hash, the page reloads with `?live_preview=<hash>`, SSR refetches with that hash. |
| `visual-builder` | Visual Builder canvas (full-page editor) | Bidirectional handshake: SDK sends `init` to parent, parent responds with `windowType`. Then per-field events: `mouse-click`, `focus-field`, `move-instance`, `update-field`, etc. |

Implications:
- A page can have working Live Preview (rearrange happens via reload) but broken Visual Builder (rearrange happens via in-iframe DOM mutation).
- Form-side editing in Visual Builder uses **the live-preview channel**, not the visual-builder channel — `ON_CHANGE` events update the hash, then the iframe reloads.
- A handshake timeout on the `visual-builder` channel (1 second hardcoded in `advanced-post-message`) silently disables drag/edit overlays. Cold-compile dev servers can exceed this on first load — a plain reload usually fixes it.

## Diagnostic Recipe

When live preview / visual builder doesn't work and you're not sure why, drop this temporarily into the SDK init component to see the entire postMessage stream:

```ts
const onMessage = (e: MessageEvent) => {
  const data = e.data as {
    eventManager?: string; channel?: string; type?: string;
    metadata?: { hash?: string; nature?: string };
    payload?: unknown; error?: unknown;
  };
  if (data?.eventManager === "contentstack-adv-post-message") {
    // Filter out focus-state polling so move/update events are visible:
    const noisy =
      data.type === "get-resolved-variant-permissions" ||
      data.type === "get-workflow-stage-details" ||
      data.type === "get-field-variant-status";
    if (noisy) return;
    console.log(
      `[${data.channel}/${data.metadata?.nature}]`,
      data.type, data.metadata?.hash?.slice(0, 12),
      data.payload ?? "", data.error ? { error: data.error } : ""
    );
  }
};
window.addEventListener("message", onMessage);

console.log("[diag] init", {
  enable: previewEnabled,
  live_preview: new URLSearchParams(location.search).get("live_preview"),
  builder: new URLSearchParams(location.search).get("builder"),
  cslpNodes: document.querySelectorAll("[data-cslp]").length,
  inIframe: window.self !== window.top,
});

// Snapshot the SDK's resolved windowType after init. The handshake takes ~1s;
// if windowType isn't "builder" by 5s, the BUILDER-only handlers (form sync,
// MOVE_INSTANCE rearrange) never registered.
setTimeout(() => {
  const cfg = (ContentstackLivePreview as any).config;
  console.log("[diag] @5s", { windowType: cfg?.windowType, mode: cfg?.mode });
}, 5000);
```

Pair this with `debug: true` in the `init()` config to get the SDK's own internal `Live_Preview_SDK:` logs.

What to read off the output:
- **No `[diag] init` line at all** → component isn't mounted in the iframe; check root layout.
- **`cslpNodes: 0`** → server skipped `addEditableTags` (`live_preview` query param wasn't set when the server fetched).
- **`inIframe: false`** → page loaded outside the CMS; postMessages can't reach it.
- **No `[live-preview/...]` or `[visual-builder/...]` lines after init** → handshake never completed; CMS isn't talking to this iframe (URL config in CS, origin issue, or 1-second cold-start timeout).
- **`No ack listener found for hash "init-…"`** → handshake timed out in 1s; parent CMS replied too late. Reload usually fixes (warms the dev server's compile cache).
- **`windowType !== "builder"` at 5s** → the parent identified this as a Live Preview pane, not a Visual Builder canvas. Form sync and `MOVE_INSTANCE` won't work. Likely a Visual Builder URL config issue on the stack side.

## Debugging Live Preview

### "Start editing" button shows on every page in dev

`editInVisualBuilderButton` is a **separate config key** from `editButton`. It defaults to `true` and renders a floating button in the corner of every page where the SDK is enabled. Set `editInVisualBuilderButton: { enable: false }` explicitly.

### Visual Builder loads but no postMessages arrive when you type

Check the URL of the iframe — it should be your dev/preview origin with `?live_preview=<hash>&builder=true`. If those query params are missing, the CMS hasn't iframed the page through Visual Builder; you opened it in a regular tab.

If query params are present and `cslpNodes > 0` but no postMessages arrive, the parent CMS isn't recognizing this iframe. Check: stack's Live Preview / Visual Builder URL settings (should match your dev origin), iframe origin / CSP headers.

### SDK's `init` rejects with timeout

```
contentstack-adv-post-message: No ack listener found for hash "init-…"
Uncaught (in promise) #<Object>
```

The 1-second handshake timeout exceeded. On first load against a cold Next.js dev server, compile time can push the round-trip past 1s. Workaround: hard-reload the iframe once the dev server has warmed up. There is no way to extend the timeout from the SDK config.

### Entry data shows in CMS but not on localhost

1. **Asset not published** — File fields return `null` on the Delivery API if the asset itself isn't published. Publish the asset first, then re-publish the entry.
2. **Stale cache** — The Delivery SDK may cache responses. Create a fresh stack instance per preview request.
3. **Wrong environment** — Verify `CONTENTSTACK_ENVIRONMENT` matches your published environment name.

### data-cslp tags not generating

1. Verify `addEditableTags` is called with `true` as the third argument (enables nested tags).
2. Check that the `$` property exists on the entry after calling `addEditableTags`.
3. Ensure the content type UID passed to `addEditableTags` matches the actual content type.

### Visual Builder can't add/reorder blocks or group instances

1. Missing container tag — the wrapper div needs `{...entry.$.sections}`.
2. Missing item tags — each block/group item needs `{...entry.$[`sections__${index}`]}` from the **parent's** `$`.
3. Content type must have `is_page: true` and a `url` field.
4. Item wrapper has no clickable area — add padding so Visual Builder can distinguish the wrapper from its children.

### Can't select/delete individual group items

The item wrapper element has no padding, so child elements fill it completely. Visual Builder can't hover/click the wrapper to show delete/reorder controls. Fix: add `p-4` or similar padding to the item wrapper element.

### New group/block instances are empty and uneditable

Fields have no `default_value` in `field_metadata`. Without defaults, newly added instances render as empty — Visual Builder has nothing to click for inline editing. Fix: add `default_value` to every text field in the content type schema via the CMA.

### URL field shows literal pattern instead of resolved value

If the content type has `url_pattern: "/:slug"`, Contentstack auto-generates `url` as the literal `/:slug` instead of `/actual-slug`. Always set the `url` field explicitly when creating entries via the CMA.

### Filters send wrong case

Contentstack queries are case-sensitive. Filter values from UI pills ("Featured") must be lowercased to match stored values ("featured"):

```typescript
query.where("category", QueryOperation.EQUALS, filters.category.toLowerCase());
```

---

## Publishing Checklist

When creating/updating content via the CMA:

1. **Create/update the entry** — `POST/PUT /content_types/{uid}/entries/{entry_uid}`
2. **Publish any new assets** — `POST /assets/{asset_uid}/publish` with environments and locales
3. **Publish the entry** — `POST /content_types/{uid}/entries/{entry_uid}/publish` with environments and locales
4. **Verify on Delivery API** — `GET` from `cdn.contentstack.io` to confirm data is live

Assets and entries have independent publish states. An entry can be published but reference an unpublished asset, which returns `null` on the CDN.
