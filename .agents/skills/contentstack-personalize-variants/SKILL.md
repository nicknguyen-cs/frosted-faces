---
name: contentstack-personalize-variants
description: >-
  Create, update, publish, and deliver Contentstack Personalize entry variants
  via the CMA and CDA APIs. Covers the correct variant payload format
  (_change_set, _order, _metadata), publishing with publish_latest_base,
  variant merge model, fetching variant content with the Delivery SDK,
  migrating variants after content type changes, and Next.js middleware
  integration with the Personalize Edge SDK.
  Use when creating A/B test or segmented experience variants for entries,
  publishing variant content, migrating variants after schema changes,
  or wiring up Personalize delivery in Next.js.
license: MIT
metadata:
  author: contentstack
  version: "1.1"
  source: https://www.contentstack.com/docs/personalize
  last_updated: "2026-04-09"
---

# Contentstack Personalize — Entry Variants

This skill covers programmatic creation, publishing, and delivery of entry variants for Contentstack Personalize experiences (A/B Tests and Segmented).

## Prerequisites

- Contentstack stack with a Management Token (CMA access)
- Personalize project created and connected to the stack
- An active experience with variants (e.g., A/B test with Group A / Group B)
- The variant group must be linked to the target content type

## Key Concepts

### How Variants Work (Merge Model)

A variant is a **delta** — it only stores the fields that differ from the base entry. When Contentstack serves a variant via the CDA, it **merges** the variant's overridden fields onto a specific version of the base entry to produce the full response.

This means:
- Fields listed in `_change_set` come from the variant
- All other fields (unchanged blocks, groups, etc.) come from the **base entry version** the variant was published against
- If the base entry changes (e.g., new featured content, updated steps), the variant must be republished to pick up those base changes
- `publish_latest_base: true` ensures the variant always publishes against the latest base entry version

### Variant Hierarchy

```
Personalize Experience (e.g., "Homepage A/B Test")
  └─ Variant Group (auto-created, linked to content types)
       ├─ Variant A (uid: cs...)  ← "Group A"
       └─ Variant B (uid: cs...)  ← "Group B"
            └─ Entry Variants (per entry, per variant)
```

### Identifiers

| ID | Example | Where to find |
|---|---|---|
| Experience UID | `69d40e6e...` | Personalize → Experiences |
| Experience Short UID | `0` | Experience response `.shortUid` |
| Variant UID | `csa7a79ab5...` | Experience `._cms.variants` |
| Variant Short UID | `0`, `1` | Experience `._cms.variants` keys |
| Variant Alias | `cs_personalize_0_0` | `Personalize.variantParamToVariantAliases("0_0")` |
| Variant Param | `0_0` | `{experienceShortUid}_{variantShortUid}` |
| Variant Group UID | `csb37ce9b3...` | Experience `._cms.variantGroup` |
| Block Metadata UID | `cs4d4f4b25...` | Base entry section `._metadata.uid` |

---

## Discovery: Get Variant UIDs from an Experience

```bash
# Get experience details (includes CMS variant mapping)
curl -s "https://api.contentstack.io/v3/content_types/{ct}/entries/{entry}" \
  -H "api_key: {API_KEY}" \
  -H "authorization: {MANAGEMENT_TOKEN}"
```

The experience response contains:
```json
{
  "_cms": {
    "variantGroup": "{variant_group_uid}",
    "variants": {
      "0": "{variant_uid_a}",
      "1": "{variant_uid_b}"
    }
  }
}
```

### Get Base Entry Block UIDs

Before creating variants, read the base entry to capture each modular block's `_metadata.uid`:

```bash
curl -s "https://api.contentstack.io/v3/content_types/{ct}/entries/{entry_uid}" \
  -H "api_key: {API_KEY}" \
  -H "authorization: {MANAGEMENT_TOKEN}"
```

Each section block has a `_metadata.uid`:
```json
{
  "sections": [
    {
      "hero": {
        "heading": "...",
        "_metadata": { "uid": "{block_uid}" }
      }
    }
  ]
}
```

These UIDs are **required** for the variant `_change_set` and `_order`.

---

## Creating Entry Variants

### Endpoint

```
PUT https://api.contentstack.io/v3/content_types/{content_type_uid}/entries/{entry_uid}/variants/{variant_uid}
```

### Payload Format

The payload has three critical parts:

1. **`_variant._change_set`** — Lists which fields differ from base. Format: `sections.{block_type}.{block_metadata_uid}.{field_name}`
2. **`_variant._order`** — Defines section ordering. Format: `base.{block_type}.{block_metadata_uid}` or `variant.{block_type}.{block_metadata_uid}`
3. **`sections[].{block}._metadata.uid`** — Each section must reference the base block's metadata UID

### Example: Modify Hero and CTA

```json
{
  "entry": {
    "_variant": {
      "_uid": "{variant_uid}",
      "_change_set": [
        "sections.hero.{hero_block_uid}.heading",
        "sections.hero.{hero_block_uid}.description",
        "sections.hero.{hero_block_uid}.cta_text",
        "sections.cta.{cta_block_uid}.heading",
        "sections.cta.{cta_block_uid}.description",
        "sections.cta.{cta_block_uid}.cta_text"
      ],
      "_order": [
        {
          "sections": [
            "base.hero.{hero_block_uid}",
            "base.featured.{block_2_uid}",
            "base.categories.{block_3_uid}",
            "base.steps.{block_4_uid}",
            "base.cta.{cta_block_uid}"
          ]
        }
      ]
    },
    "sections": [
      {
        "hero": {
          "heading": "Your personalized heading here",
          "description": "Your personalized description here.",
          "cta_text": "Your CTA Label",
          "cta_link": "/action",
          "_metadata": { "uid": "{hero_block_uid}" }
        }
      },
      {
        "cta": {
          "heading": "Your personalized CTA heading",
          "description": "Your personalized CTA description.",
          "cta_text": "Take Action",
          "cta_link": "/action",
          "_metadata": { "uid": "{cta_block_uid}" }
        }
      }
    ]
  }
}
```

### Critical Rules

1. **`_change_set` format**: `sections.{block_type}.{block_uid}.{field_name}` — The block UID **must** be included
2. **`_order` is required** — Must list ALL base sections (not just changed ones), with format `base.{block_type}.{block_uid}`
3. **`_metadata.uid` on each section** — Must match the base entry's block UID so Contentstack knows which block is being overridden
4. **Only include changed sections in `sections`** — Don't send unchanged sections in the variant payload
5. **The `_variant._uid`** must match the variant UID in the URL path

### Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| `_change_set` without block UID | Variant appears empty in UI | Use `sections.hero.{uid}.heading` not `sections.hero.heading` |
| Missing `_order` | Variant content not rendered | Include full `_order` array with all base sections |
| Missing `_metadata.uid` on sections | New block created instead of override | Add `_metadata.uid` matching the base block |
| Sending all sections | Unchanged sections marked as variant diffs | Only send sections with actual changes |
| Publishing without `publish_latest_base: true` | `publish_details` not updated, UI shows stale version | Always use `publish_latest_base: true` via MCP tool |
| Block UIDs changed after content type migration | Variants silently broken — CDA drops overridden blocks | Re-PUT each variant with updated UIDs, then republish (see Migration section) |
| Renamed block (e.g., `mission_cta` → `cta_banner`) without updating variants | Variant `_change_set` and `_order` reference old block name, merge fails | Update `_change_set` and `_order` to use new block name and UID |

---

## Publishing Variants

Variants must be published separately from the base entry. Because a variant is a delta merged onto a base entry version, the publish process needs to know which base version to use.

### Recommended: MCP Tool with `publish_latest_base: true`

The `publish_latest_base` parameter tells Contentstack to publish the variant against the **latest version of the base entry**, eliminating the need to manually specify a base entry version. Always use this.

```
mcp__contentstack__publish_variants_of_an_entry
  content_type_uid: "{CONTENT_TYPE}"
  entry: "{ENTRY_UID}"
  environment_uids: "{ENV_UID}"
  locales: "en-us"
  variant_ids: "{VARIANT_UID_A},{VARIANT_UID_B}"
  variant_group_uid: "{VARIANT_GROUP_UID}"
  publish_latest_base: true
```

This properly updates:
- The CDN content (CDA serves the variant)
- The `publish_details` metadata (UI shows the correct published version)

### Fallback: Bulk Publish REST API

```bash
curl -s -X POST "https://api.contentstack.io/v3/bulk/publish" \
  -H "api_key: {API_KEY}" \
  -H "authorization: {MANAGEMENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "uid": "{ENTRY_UID}",
        "content_type": "{CONTENT_TYPE}",
        "locale": "en-us",
        "version": {VARIANT_VERSION},
        "variant_uid": "{VARIANT_UID}"
      }
    ],
    "environments": ["production"],
    "locales": ["en-us"]
  }'
```

**Caveats of the bulk publish REST API:**
- The `version` field must be the **variant's `_version`** (from `GET /variants/{uid}`), NOT the base entry version
- Does not support `publish_latest_base` — you must manually ensure the base entry is already published
- May deliver content to the CDN but **not update `publish_details`** — the UI can show a stale published version
- Prefer the MCP tool with `publish_latest_base: true` whenever possible

### Verify Published Content

```bash
# CDA — source of truth for what's being delivered
curl -s "https://cdn.contentstack.io/v3/content_types/{ct}/entries?environment=production" \
  -H "api_key: {API_KEY}" \
  -H "access_token: {DELIVERY_TOKEN}" \
  -H "x-cs-variant-uid: cs_personalize_{exp_short_uid}_{variant_short_uid}"
```

Check the `publish_details.variants` object in the CDA response to confirm the correct variant version is published.

---

## Fetching Variant Content (CDA)

### Direct API Call

```bash
curl -s "https://cdn.contentstack.io/v3/content_types/{ct}/entries?environment=production" \
  -H "api_key: {API_KEY}" \
  -H "access_token: {DELIVERY_TOKEN}" \
  -H "x-cs-variant-uid: cs_personalize_0_0"
```

The `x-cs-variant-uid` header takes a **variant alias** (e.g., `cs_personalize_0_0`), not the variant UID.

### Via Delivery SDK

```typescript
import Personalize from "@contentstack/personalize-edge-sdk";

const variantParam = "0_0"; // from middleware
const variantAlias = Personalize.variantParamToVariantAliases(variantParam).join(",");

const result = await stack
  .contentType("{content_type}")
  .entry()
  .variants(variantAlias)
  .query()
  .find();
```

**Important:** Call `.variants()` on `entry()` **before** `.query()`. The SDK sets the `x-cs-variant-uid` header internally.

### CMA vs CDA for Variant Content

| | CMA (`api.contentstack.io`) | CDA (`cdn.contentstack.io`) |
|---|---|---|
| Returns variant sections content | No — `sections: []` (delta stored internally) | Yes — full merged entry with variant overrides |
| Returns `_change_set` / `_order` | Yes | No |
| Returns `publish_details` | Sometimes (may be null even when published) | Yes (in response `publish_details.variants`) |
| Use for | Creating/updating variants, reading metadata | Verifying published content, delivery |

---

## Next.js Middleware Integration

### Middleware (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import Personalize from "@contentstack/personalize-edge-sdk";

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|css|js|woff2?|ttf|eot)$).*)"],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.includes("favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  if (!projectUid) return NextResponse.next();

  const edgeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  if (edgeApiUrl) Personalize.setEdgeApiUrl(edgeApiUrl);

  try {
    const personalizeSdk = await Personalize.init(projectUid, { request });
    const variantParam = personalizeSdk.getVariantParam();
    const url = request.nextUrl.clone();
    url.searchParams.set(Personalize.VARIANT_QUERY_PARAM, variantParam);

    const response = NextResponse.rewrite(url);
    await personalizeSdk.addStateToResponse(response);
    response.headers.set("cache-control", "no-store");
    return response;
  } catch (e) {
    console.error("[Personalize] middleware error:", e);
    return NextResponse.next();
  }
}
```

### Key Behaviors

- The middleware calls the Personalize Edge API to get the user's variant assignment
- It rewrites the URL with `?personalize_variants=0_0` (invisible to the user)
- It sets cookies (`cs-personalize-user-uid`, `cs-personalize-manifest`) for visitor identity
- The `try/catch` ensures the page renders with base content if the Edge API is down

### Client-Side SDK (PersonalizeContext)

For triggering impressions and events on the client:

```typescript
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Personalize from "@contentstack/personalize-edge-sdk";
import type { Sdk } from "@contentstack/personalize-edge-sdk/dist/sdk";

const PersonalizeContext = createContext<Sdk | null>(null);
let sdkInstance: Sdk | null = null;

async function getPersonalizeInstance(): Promise<Sdk | null> {
  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  if (!projectUid) return null;
  try {
    if (!Personalize.getInitializationStatus()) {
      sdkInstance = await Personalize.init(projectUid);
    }
    return sdkInstance;
  } catch (e) {
    console.warn("[Personalize] Client SDK init failed:", e);
    return null;
  }
}

export function PersonalizeProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  useEffect(() => { getPersonalizeInstance().then(setSdk); }, []);
  return (
    <PersonalizeContext.Provider value={sdk}>
      {children}
    </PersonalizeContext.Provider>
  );
}

export function usePersonalize() { return useContext(PersonalizeContext); }
```

**Critical:** The client-side `Personalize.init()` **must** be wrapped in try/catch. Without it, a missing env var or network error will throw `Project not found: undefined`, crash the React tree, and blank the entire page.

---

## Environment Variables

| Variable | Required | Where |
|---|---|---|
| `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` | Yes | Server + Client (must rebuild after adding) |
| `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL` | No | Override Edge API region |

### Edge API URLs by Region

| Region | URL |
|---|---|
| AWS NA (default) | `https://personalize-edge.contentstack.com` |
| AWS EU | `https://eu-personalize-edge.contentstack.com` |
| Azure NA | `https://azure-na-personalize-edge.contentstack.com` |
| Azure EU | `https://azure-eu-personalize-edge.contentstack.com` |
| GCP NA | `https://gcp-na-personalize-edge.contentstack.com` |
| AWS AU | `https://au-personalize-edge.contentstack.com` |

---

## Automation Workflow

Complete sequence for creating variants with content:

```
1.  Create experience (Personalize MCP or UI)
     → experience_uid, variant UIDs from ._cms.variants
     → variant_group_uid from ._cms.variantGroup

2.  Read base entry to capture block _metadata.uid values
     GET /content_types/{ct}/entries/{entry}

3.  Create Variant A entry
     PUT /content_types/{ct}/entries/{entry}/variants/{variant_a_uid}
     Body: { entry: { _variant: { _uid, _change_set, _order }, sections: [...] } }

4.  Create Variant B entry (repeat for all variants)
     PUT /content_types/{ct}/entries/{entry}/variants/{variant_b_uid}

5.  Publish all variants
     MCP: publish_variants_of_an_entry with publish_latest_base: true

6.  Verify on CDA
     GET entries with x-cs-variant-uid: cs_personalize_{exp}_{var} header
     Check publish_details.variants in response for correct version
```

---

## Migrating Variants After Content Type Changes

When modular block UIDs change (e.g., extracting blocks into Global Fields, renaming blocks, or restructuring the content type), **all existing variants break silently**. The variant `_change_set` and `_order` reference the old block UIDs, so the Personalize merge fails and the CDA drops those blocks entirely — returning base content instead of variant content.

### Why Variants Break

Variants reference blocks by `{block_name}.{block_metadata_uid}` in `_change_set` and `_order`. When the content type is restructured:
- Block `_metadata.uid` values change (new UIDs are generated)
- Block names may change (e.g., `mission_cta` → `cta_banner`)
- Contentstack does **not** auto-migrate variant references to match

### Migration Workflow

```
1.  Read the CURRENT base entry to get new block _metadata.uid values
     GET /content_types/{ct}/entries/{entry}

2.  Get all variant UIDs from the experience
     GET experience → ._cms.variants

3.  Recover original variant content
     - CMA GET /variants/{uid} returns sections: [] (delta stored internally)
     - Check CMS UI, conversation history, or prior CDA snapshots for the original text
     - If content is lost, recreate it manually

4.  PUT each variant with updated structure:
     - _change_set: update block names and UIDs
     - _order: update block names and UIDs for ALL sections
     - sections: map content to new block names with new _metadata.uid
     - Do NOT include _base_entry_version — let the API set it

5.  Publish each variant
     MCP: publish_variants_of_an_entry with publish_latest_base: true

6.  Verify on CDA with x-cs-variant-uid header
     Confirm block names/UIDs match the new structure
     Check publish_details.variants for correct version
```

### Key Gotchas

- **CMA returns `sections: []` for variants** — the delta content is stored internally and only surfaced through the CDA merge. You cannot read the original variant content back from the API after creation.
- **Block UID changes are invisible to variants** — Contentstack does not auto-migrate variant `_change_set` or `_order` when the base entry's block UIDs change. This is a manual migration.
- **The CDA silently drops blocks** — when a variant references a block UID that no longer exists in the base entry, the CDA omits that block entirely from the response (no error, just missing data).
- **Always verify on CDA after migration** — check that the block names and UIDs in the response match the new structure, not the old one.

---

## Manual Steps (Cannot Be Automated)

The following steps **require human intervention** in the Contentstack UI, hosting platform, or Personalize dashboard. Inform the user of these before starting:

1. **Create a Personalize project** — In Contentstack Personalize, create a project and connect it to the stack. Note the project UID.

2. **Create an experience with variants** — In Personalize, create an A/B Test or Segmented experience. Define variant groups (e.g., Group A, Group B) and link them to the target content type. The variant UIDs are available in the experience's `._cms.variants` response.

3. **Create conversion events** — In Personalize → Events, define the events you want to track (e.g., "Conversion"). Note the event key.

4. **Add env vars to hosting platform** — Add `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` to Contentstack Launch (or your hosting platform). This is a `NEXT_PUBLIC_` var — it requires a **full rebuild**, not just a redeploy.

5. **Verify variant content in Contentstack UI** — After creating variants via API, check the entry in Contentstack UI to confirm variant data appears correctly under the Personalize tab. If `_change_set` or `_order` was malformed, the variant will appear empty.

6. **Activate the experience** — The experience must be set to **Active** in Personalize for variant delivery to work. Draft experiences won't trigger the Edge SDK.

---

## Troubleshooting

### Variant Content Not Delivered

- **Not published with `publish_latest_base: true`**: Republish via MCP tool with this flag set
- **Verify CDA header**: Use `x-cs-variant-uid: cs_personalize_{exp}_{var}` (alias format, not raw UID)
- **Rebuild required**: `NEXT_PUBLIC_` env vars are inlined at build time — redeploy won't work, must rebuild
- **Check `publish_details.variants` in CDA response**: Confirms which variant version is published

### Variant Shows Empty / No Diff in UI

- **Missing `_change_set`**: Must include block UID — `sections.hero.{uid}.heading` not `sections.hero.heading`
- **Missing `_order`**: Required even if order matches base
- **Missing `_metadata.uid`**: Each variant section block must reference the base block UID

### Variants Broken After Content Type Migration

- Block UIDs changed but variants still reference old UIDs
- CDA drops blocks with stale UIDs — returns base content instead
- Fix: follow the Migration Workflow above to re-PUT and republish all variants with `publish_latest_base: true`

### UI Shows Wrong Published Version

- Published via bulk REST API without `publish_latest_base` — content may be on CDN but `publish_details` not updated
- Fix: republish via MCP tool with `publish_latest_base: true`, or publish from the Contentstack UI

### Blank Page on Launch

- **Client SDK crash**: `Personalize.init()` throws if project UID is undefined — always wrap in try/catch
- **Missing env var**: Add `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` to Launch and rebuild
- **Middleware asset leak**: Ensure middleware skips static assets (favicon, images, CSS, JS)

## Reference

- [Personalize Setup with Next.js + Launch](https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch)
- [Personalize Edge SDK Reference](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/reference/)
- [Entry Variants API](https://www.contentstack.com/docs/developers/apis/content-management-api/)
