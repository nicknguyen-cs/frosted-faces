---
name: contentstack-personalize-variants
description: >-
  Create, update, publish, and deliver Contentstack Personalize entry variants
  via the CMA and CDA APIs. Covers the correct variant payload format
  (_change_set, _order, _metadata), bulk publishing variants, fetching variant
  content with the Delivery SDK, and Next.js middleware integration with the
  Personalize Edge SDK.
  Use when creating A/B test or segmented experience variants for entries,
  publishing variant content, or wiring up Personalize delivery in Next.js.
license: MIT
metadata:
  author: contentstack
  version: "1.0"
  source: https://www.contentstack.com/docs/personalize
  last_updated: "2026-04-07"
---

# Contentstack Personalize — Entry Variants

This skill covers programmatic creation, publishing, and delivery of entry variants for Contentstack Personalize experiences (A/B Tests and Segmented).

## Prerequisites

- Contentstack stack with a Management Token (CMA access)
- Personalize project created and connected to the stack
- An active experience with variants (e.g., A/B test with Group A / Group B)
- The variant group must be linked to the target content type

## Key Concepts

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
| Experience UID | `69d40e6eadcf0c62a89551ff` | Personalize → Experiences |
| Experience Short UID | `0` | Experience response `.shortUid` |
| Variant UID | `csa7a79ab539277ef0` | CMA variant group or experience `._cms.variants` |
| Variant Short UID | `0`, `1` | Experience `._cms.variants` keys |
| Variant Alias | `cs_personalize_0_0` | `Personalize.variantParamToVariantAliases("0_0")` |
| Variant Param | `0_0` | `{experienceShortUid}_{variantShortUid}` |
| Variant Group UID | `csb37ce9b306ca60e0` | Experience `._cms.variantGroup` |
| Block Metadata UID | `cs9428c2d3c9d11f6f` | Base entry section `._metadata.uid` |

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
    "variantGroup": "csb37ce9b306ca60e0",
    "variants": {
      "0": "csa7a79ab539277ef0",
      "1": "cs544e0acb0ea7f16d"
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
        "_metadata": { "uid": "cs9428c2d3c9d11f6f" }
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

### Example: Modify Hero and Mission CTA

```json
{
  "entry": {
    "_variant": {
      "_uid": "csa7a79ab539277ef0",
      "_change_set": [
        "sections.hero.cs9428c2d3c9d11f6f.heading",
        "sections.hero.cs9428c2d3c9d11f6f.description",
        "sections.hero.cs9428c2d3c9d11f6f.cta_text",
        "sections.mission_cta.cs40e7321a9294fc04.heading",
        "sections.mission_cta.cs40e7321a9294fc04.description",
        "sections.mission_cta.cs40e7321a9294fc04.cta_text"
      ],
      "_order": [
        {
          "sections": [
            "base.hero.cs9428c2d3c9d11f6f",
            "base.featured_dogs.csb20334895229f43c",
            "base.browse_by_type.csd923ff0f27df8f48",
            "base.how_it_works.cs74cc2e6ff650351b",
            "base.mission_cta.cs40e7321a9294fc04"
          ]
        }
      ]
    },
    "sections": [
      {
        "hero": {
          "heading": "Give a senior dog the retirement they deserve",
          "description": "These gentle souls have spent their lives giving love.",
          "cta_text": "Find Your Perfect Match",
          "cta_link": "/dogs",
          "_metadata": { "uid": "cs9428c2d3c9d11f6f" }
        }
      },
      {
        "mission_cta": {
          "heading": "They gave their best years — give them their best chapter",
          "description": "Senior dogs are loyal, trained, and ready to love.",
          "cta_text": "Meet Your Match",
          "cta_link": "/dogs",
          "_metadata": { "uid": "cs40e7321a9294fc04" }
        }
      }
    ]
  }
}
```

### Critical Rules

1. **`_change_set` format**: `sections.{block_type}.{block_uid}.{field_name}` — The API auto-normalizes field order but the block UID **must** be included
2. **`_order` is required** — Without it, the variant won't render correctly in the UI or CDA
3. **`_metadata.uid` on each section** — Must match the base entry's block UID so Contentstack knows which block is being overridden
4. **Only include changed sections** — Don't send unchanged sections (featured_dogs, browse_by_type, etc.) in the variant payload
5. **The `_variant._uid`** must match the variant UID in the URL path

### Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| `_change_set` without block UID | Variant appears empty in UI | Use `sections.hero.{uid}.heading` not `sections.hero.heading` |
| Missing `_order` | Variant content not rendered | Include full `_order` array with all base sections |
| Missing `_metadata.uid` on sections | New block created instead of override | Add `_metadata.uid` matching the base block |
| Sending all sections | Unchanged sections marked as variant diffs | Only send sections with actual changes |

---

## Publishing Variants

Variants must be published separately from the base entry.

### Bulk Publish (Recommended)

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

### Via MCP Tool

```
mcp__contentstack__publish_variants_of_an_entry
  content_type_uid: "home_page"
  entry: "{ENTRY_UID}"
  environment_uids: "{ENV_UID}"
  locales: "en-us"
  variant_ids: "{VARIANT_UID_A},{VARIANT_UID_B}"
```

**Note:** MCP publish may not always work for variants. Use the bulk publish API as a reliable fallback.

### Verify Publish Status

```bash
# Check variant publish details
curl -s "https://api.contentstack.io/v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}" \
  -H "api_key: {API_KEY}" \
  -H "authorization: {MANAGEMENT_TOKEN}"
```

Check `publish_details` in the response — if `null`, the variant is not published.

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
  .contentType("home_page")
  .entry()
  .variants(variantAlias)
  .query()
  .find();
```

**Important:** Call `.variants()` on `entry()` **before** `.query()`. The SDK sets the `x-cs-variant-uid` header internally.

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

Complete sequence for creating an A/B test with variant content:

```
1.  Create experience (Personalize MCP or UI)
     → experience_uid, variant UIDs from ._cms.variants

2.  Read base entry to capture block _metadata.uid values
     GET /content_types/{ct}/entries/{entry}

3.  Create Variant A entry
     PUT /content_types/{ct}/entries/{entry}/variants/{variant_a_uid}
     Body: { entry: { _variant: { _change_set, _order }, sections: [...] } }

4.  Create Variant B entry
     PUT /content_types/{ct}/entries/{entry}/variants/{variant_b_uid}

5.  Publish both variants
     POST /bulk/publish with variant_uid for each

6.  Verify on CDA
     GET entries with x-cs-variant-uid header
```

---

## Manual Steps (Cannot Be Automated)

The following steps **require human intervention** in the Contentstack UI, hosting platform, or Personalize dashboard. Inform the user of these before starting:

1. **Create a Personalize project** — In Contentstack Personalize, create a project and connect it to the stack. Note the project UID.

2. **Create an experience with variants** — In Personalize, create an A/B Test or Segmented experience. Define variant groups (e.g., Group A, Group B) and link them to the target content type. The variant UIDs are available in the experience's `._cms.variants` response.

3. **Create conversion events** — In Personalize → Events, define the events you want to track (e.g., "Conversion"). Note the event key.

4. **Add env vars to hosting platform** — Add `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` to Contentstack Launch (or your hosting platform). This is a `NEXT_PUBLIC_` var — it requires a **full rebuild**, not just a redeploy.

5. **Verify variant content in Contentstack UI** — After creating variants via API, check the entry in Contentstack UI to confirm variant data appears correctly under the Personalize tab. If `_change_set` or `_order` was malformed, the variant will appear empty.

6. **Publish variants** — Variants must be published separately from the base entry. While the bulk publish API can automate this, verify publish status in the UI if content isn't being delivered. Check `publish_details` in the variant CMA response — if `null`, it's not published.

7. **Activate the experience** — The experience must be set to **Active** in Personalize for variant delivery to work. Draft experiences won't trigger the Edge SDK.

---

## Troubleshooting

### Variant Content Not Delivered

- **Check publish status**: Read the variant via CMA and verify `publish_details` is not null
- **Verify CDA header**: Use `x-cs-variant-uid: cs_personalize_{exp}_{var}` (alias format, not raw UID)
- **Rebuild required**: `NEXT_PUBLIC_` env vars are inlined at build time — redeploy won't work, must rebuild

### Variant Shows Empty / No Diff in UI

- **Missing `_change_set`**: Must include block UID — `sections.hero.{uid}.heading` not `sections.hero.heading`
- **Missing `_order`**: Required even if order matches base
- **Missing `_metadata.uid`**: Each variant section block must reference the base block UID

### Blank Page on Launch

- **Client SDK crash**: `Personalize.init()` throws if project UID is undefined — always wrap in try/catch
- **Missing env var**: Add `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` to Launch and rebuild
- **Middleware asset leak**: Ensure middleware skips static assets (favicon, images, CSS, JS)

## Reference

- [Personalize Setup with Next.js + Launch](https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch)
- [Personalize Edge SDK Reference](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/reference/)
- [Entry Variants API](https://www.contentstack.com/docs/developers/apis/content-management-api/)
