---
name: contentstack-personalize-experiences
description: >-
  End-to-end guide for creating Contentstack Personalize experiences (Segmented
  and A/B Test) via the Management API. Covers audience creation, experience
  version configuration, variant-to-audience mapping, variant group linkage,
  entry variant content creation, publishing, and activation.
  Use when setting up Personalize experiences, connecting CDP audiences to
  Contentstack content variants, or automating experience configuration that
  the MCP tools cannot handle alone.
license: MIT
metadata:
  author: contentstack
  version: "1.1"
  source: https://www.contentstack.com/docs/developers/apis/personalize-management-api
  last_updated: "2026-04-13"
---

# Contentstack Personalize — Experience Setup

## Auth

Two separate APIs are involved, each with its own auth:

| API | Base URL | Auth Header |
|---|---|---|
| **Personalize Management** | `https://personalize-api.contentstack.com` | `authtoken: <user_authtoken>` + `x-project-uid: <project_uid>` |
| **CMA (Content Management)** | `https://api.contentstack.io/v3` | `authorization: <management_token>` + `api_key: <stack_api_key>` |

The Personalize API does **not** accept management tokens. You need a user authtoken (from `POST /v3/user-session` with email/password) or an OAuth token with `personalize:manage` scope.

Regional base URLs exist for both APIs (EU, Azure, GCP, AU). See [docs](https://www.contentstack.com/docs/developers/apis/personalize-management-api#base-url).

---

## Before You Start: Ask Before Creating a New Experience

If the user is adding a new audience or variant to an already-personalized surface, **do not immediately create a new experience**. First list the existing ones:

```
GET /experiences
```

Summarize them for the user (name, type, status, content type, current variants via `GET /experiences/{uid}/versions`) and ask whether they want to:

1. **Add a variant to an existing experience** (the usual answer when the surface is already personalized) — use the "Adding a Variant to an Existing Experience" flow below.
2. **Create a new experience** — use the standard flow below.

Multiple active experiences compete on the same content type by priority and make the personalization surface harder to reason about. Default to extending, not proliferating, unless the user explicitly asks for a separate experience.

## Flow Overview — New Experience

```
1. Create audiences           Personalize API   POST /audiences   (or Lytics-synced, see lytics-cdp-api skill)
2. Create experience          Personalize API   POST /experiences
3. Configure version          Personalize API   PUT  /experiences/{uid}/versions/{versionUid}
   (add variants + map audiences, pass audiences via lyticsAudiences for Lytics-synced UIDs)
4. Activate experience        Personalize API   PUT  /experiences/{uid}/versions/{versionUid}  (status: ACTIVE)
5. Link variant group to CT   CMA API           PUT  /v3/variant_groups/{group_uid}
6. Create entry variants      CMA API           PUT  /v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}
7. Publish variants           CMA API           publish_variants_of_an_entry MCP (NOT /v3/bulk/publish — see variants skill)
8. Set priority (optional)    Personalize API   PUT  /experiences-priority
```

Steps 1-4 use the **Personalize Management API**. Steps 5-7 use the **CMA**. Step 8 returns to the **Personalize API**.

⚠️ **Order change from earlier versions of this skill:** activation (step 4) now comes **before** variant content creation (step 6). This is because activation can reassign `_cms.variants[shortUid] → variantUid` on a brand-new experience, orphaning content you wrote against the draft UIDs. Activate first, then read `_cms.variants` fresh, then write variant content against the post-activation UIDs.

---

## API Capabilities vs. UI-Only

### What CAN be automated via API

| Action | API | Endpoint |
|---|---|---|
| Create/list/delete audiences | Personalize | `POST/GET/DELETE /audiences` |
| Create/list/delete experiences | Personalize | `POST/GET/DELETE /experiences` |
| Configure version (variants + audiences) | Personalize | `PUT /experiences/{uid}/versions/{versionUid}` |
| Link variant group to content type | CMA | `PUT /v3/variant_groups/{uid}` |
| Create entry variant content | CMA | `PUT /v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}` |
| Bulk publish variants | CMA | `POST /v3/bulk/publish` |
| Activate/pause experience | Personalize | `PUT /experiences/{uid}/versions/{versionUid}` with `status` |
| Set experience priority | Personalize | `PUT /experiences-priority` |
| Create events/attributes | Personalize | `POST /events`, `POST /attributes` |

### What the MCP tools CANNOT do (as of 2026-04)

The Contentstack MCP (`@contentstack/mcp`) exposes `create_experience`, `get_all_experiences`, and `update_experience`, but these are **metadata-only** (name, description, type). The MCP **does not** expose:

- Adding variants to an experience version
- Mapping audiences to variants
- Linking variant groups to content types
- Setting experience status (draft/active/paused)

Use the REST APIs directly (via curl) for these operations.

### Lytics audiences use a different field

Lytics-synced audiences have 32-char hex UIDs that the `audiences` field rejects (`"not a valid ObjectId"`). Use `lyticsAudiences` instead:

```json
{
  "__type": "SegmentedVariant",
  "name": "My Variant",
  "audiences": [],
  "lyticsAudiences": ["<32-char-lytics-uid>"],
  "audienceCombinationType": "OR"
}
```

The experience response also separates them: `referredLyticsAudiences` vs `referredAudiences`.

---

## Order of Operations

```
Audiences must exist          → before experience version can reference them
Experience must exist         → before version can be configured
Version must have variants    → before CMS syncs variant group + variant UIDs
Experience must be activated  → read _cms.variants AFTER activation; the post-activation
                                UIDs are the ones your variant content will attach to
Variant group must be linked  → before entry variants can be created for that CT
Entry variants must exist     → before they can be published
```

After configuring the version, Personalize auto-syncs a variant group and variant UIDs to the CMS. Read the experience via `GET /experiences/{uid}` to find:
- `_cms.variantGroup` — the variant group UID
- `_cms.variants` — map of `shortUid → variantUid` (e.g., `{"0": "csXXX", "1": "csYYY"}`)

⚠️ **Always re-fetch `_cms.variants` after activation**, not from the draft response. For a brand-new experience, activation can regenerate the variant UIDs, so any content you wrote against draft UIDs becomes orphaned. Write variant content only after you've read the post-activation mapping.

## Adding a Variant to an Existing Experience

This is the path to take when the user asks you to add a new audience/variant to a surface that already has an active Personalize experience. The naive approach — POST a new version with the full variant list — **regenerates every variant's shortUid and orphans all existing variant content**. Use this flow instead:

```
1. PUT  /experiences/{uid}/versions/{activeVersionUid}   { status: "PAUSED", variants: [...existing with explicit shortUids] }
2. POST /experiences/{uid}/versions                      { status: "DRAFT",  variants: [...existing WITH explicit shortUids, new variants WITHOUT shortUid] }
3. PUT  /experiences/{uid}/versions/{newDraftVersionUid} { status: "ACTIVE", variants: [same body as step 2] }
4. Read /experiences/{uid} → _cms.variants for the new variant's CMS variant UID
5. Write entry variant content for the new variant only (existing variant content is preserved)
6. Publish new variant via publish_variants_of_an_entry MCP
```

**The critical trick: pass explicit `shortUid` values for existing variants in the POST body.** Without them, the server auto-generates brand-new shortUids (incrementing from the previous high-water mark, never restarting at 0). With them, the existing variants keep their original shortUids and their `_cms.variants → CMS variant UID` mappings are preserved exactly — no content migration needed.

```json
// POST /experiences/{uid}/versions body — correct form
{
  "status": "DRAFT",
  "variants": [
    { "shortUid": "0", "__type": "SegmentedVariant", "name": "Small Dog Seekers",     "audiences": [], "lyticsAudiences": ["..."], "audienceCombinationType": "OR" },
    { "shortUid": "1", "__type": "SegmentedVariant", "name": "High-Intent Adopters",  "audiences": [], "lyticsAudiences": ["..."], "audienceCombinationType": "OR" },
    { "shortUid": "2", "__type": "SegmentedVariant", "name": "Active Browsers",       "audiences": [], "lyticsAudiences": ["..."], "audienceCombinationType": "OR" },
    { "shortUid": "3", "__type": "SegmentedVariant", "name": "First-Time Visitors",   "audiences": [], "lyticsAudiences": ["..."], "audienceCombinationType": "OR" },
    {                  "__type": "SegmentedVariant", "name": "Likely Foster",         "audiences": [], "lyticsAudiences": ["..."], "audienceCombinationType": "OR" }
  ]
}
```

After this POST, the new draft contains 5 variants: the first 4 keep shortUids `"0","1","2","3"` (unchanged), and the new one gets the next available shortUid. **Note that shortUids can have gaps** — if previous aborted drafts consumed shortUids 4-8, the next one might be `"9"`. The server never reuses consumed shortUids.

### Application-side cross-check

If the app has code keyed on variant shortUids (e.g., a `PersonalizeBadge` component with a hardcoded map of `{experienceShortUid}.{variantShortUid} → label`), you must add the new shortUid to that map. Because shortUids can be non-contiguous, don't assume the new one is `N+1` — read it from the POST response or `_cms.variants` and wire it through explicitly.

### Why you can't just edit the active version

- `PUT` to a `status: ACTIVE` version returns `personalize.EXPERIENCES.VERSIONS.CANNOT_UPDATE_LOCKED_VERSION`. You must PAUSE first.
- `PUT { status: "PAUSED" }` with no body is rejected — the server requires the full `variants` array on every version update, even status-only changes. Pass the existing variants with their explicit shortUids.
- Trying to flip a paused version back to `status: "DRAFT"` returns `CANNOT_MARK_VERSION_AS_DRAFT`. Don't try — POST a new version instead.

---

## API Reference

### Create an Audience

```
POST /audiences
x-project-uid: <project_uid>
authtoken: <authtoken>

{
  "name": "<Audience Name>",
  "description": "<description>",
  "definition": {
    "__type": "RuleCombination",
    "combinationType": "AND",
    "rules": [
      {
        "__type": "Rule",
        "attribute": {
          "__type": "CustomAttributeReference",
          "ref": "<attribute_object_id>"
        },
        "attributeMatchCondition": "STRING_EQUALS",
        "attributeMatchOptions": {
          "__type": "StringMatchOptions",
          "value": "<match_value>"
        },
        "invertCondition": false
      }
    ]
  }
}
```

Match conditions: `STRING_EQUALS`, `CONTAINS_SUBSTRING`, `HAS_ANY_VALUE`, `IS_TRUE`, `IS_FALSE`, `NUMBER_LESS_THAN`, `NUMBER_GREATER_THAN`, `NUMBER_EQUAL_TO`, `JSON_MATCH`, `IS_MEMBER_OF`, `BEFORE_TIME`, `AFTER_TIME`, `BETWEEN_TIME`. Preset attributes (no creation needed): `COUNTRY`, `REGION`, `CITY`, `DEVICE_TYPE`, `OPERATING_SYSTEM`, `QUERY_PARAMETERS`, `REFERRER`, `DATE_AND_TIME`.

### Configure Experience Version

```
PUT /experiences/{uid}/versions/{versionUid}
x-project-uid: <project_uid>
authtoken: <authtoken>

{
  "status": "DRAFT",
  "variants": [
    {
      "__type": "SegmentedVariant",
      "name": "<Variant Name>",
      "audiences": ["<native_audience_object_id>"],
      "lyticsAudiences": ["<lytics_audience_uid>"],
      "audienceCombinationType": "OR"
    }
  ]
}
```

Use `audiences` for native Personalize audiences (24-char ObjectId UIDs) and `lyticsAudiences` for Lytics-synced audiences (32-char hex UIDs). Pass an empty array for the unused field. For A/B tests, use `ABTestVariant` with `trafficDistribution` (percentage) instead of audiences.

### Link Variant Group to Content Type

```
PUT /v3/variant_groups/{variant_group_uid}
api_key: <stack_api_key>
authorization: <management_token>

{
  "name": "<Experience Name>",
  "content_types": [{"uid": "<content_type_uid>", "status": "linked"}]
}
```

Both `name` and `content_types` with `status: "linked"` are required. Omitting either returns a misleading `"Name or content types is required"` error.

### Activate Experience

Same endpoint as configure, but set `"status": "ACTIVE"`. Include the full `variants` array — the API replaces the entire version, not patches it.

---

## Gotchas

### Priority between experiences
Multiple active experiences on the same content type are evaluated in priority order. The first experience whose audience matches the visitor wins. Set priority via `PUT /experiences-priority` with an array of experience UIDs in descending priority order. Segmented experiences should generally be higher priority than A/B tests so targeted audiences get specific content before falling through to random assignment.

### Draft vs. Active versions
Each experience has one version at a time. Setting `status: ACTIVE` archives any previously active version. You cannot edit an active version — create a new one instead. Draft experiences do not trigger the Edge SDK.

### Variant group sync is automatic but linkage is not
When you configure an experience version with variants, Personalize auto-creates a variant group in the CMS. But it does **not** auto-link it to any content type. You must explicitly link it via `PUT /v3/variant_groups/{uid}`.

### Deleting an experience leaves orphaned variant groups
Deleting a Personalize experience does **not** delete its CMS variant group or unlink it from the content type. The orphaned group stays linked to the content type, and if you recreate a similar experience a new variant group is created (with `(1)` suffix). Always follow the tear-down sequence below — unlink **before** deleting the experience.

### Tear-down sequence for removing an experience

When removing an experience (or consolidating two experiences into one), do this in order:

```
1. PUT /v3/variant_groups/{variant_group_uid}   body: { name, content_types: [{ uid: "{ct}", status: "unlinked" }] }
2. DELETE /experiences/{uid}                    (Personalize API — can run while experience is still ACTIVE)
```

The `PUT` variant group update requires both `name` **and** `content_types` with `status: "unlinked"` — omitting either returns a misleading `"Name or content types is required"` error. You do not need to pause or deactivate the experience before deleting — `DELETE /experiences/{uid}` works directly on an active experience and returns 204.

Note: on many stacks, `PUT /experiences/{uid}/versions/{versionUid}` with `{ "status": "PAUSED" }` will fail with `CANNOT_UPDATE_LOCKED_VERSION` if the version is locked, so don't try to pause as part of teardown. Just unlink the variant group, then delete.

### The `status` field is required on version updates
Omitting `status` from `PUT /experiences/{uid}/versions/{versionUid}` returns `INVALID_STATUS` and `STATUS_REQUIRED` errors.

### The `variants` array is required on every version update, even status-only changes
`PUT { "status": "PAUSED" }` with no `variants` field returns `VARIANTS_NOT_ARRAY` / `EMPTY_ARRAY` errors. Include the full existing variants array (with explicit shortUids to preserve them) even when you're only changing status.

### Version fetching: use `/versions`, not `/versions/{versionUid}`
`GET /experiences/{uid}/versions/{versionUid}` returns `404 Cannot GET`. The supported way to read a specific version's full variant details is `GET /experiences/{uid}/versions` (which returns an array — read element `[0]`, usually the latest). The top-level `GET /experiences/{uid}` response only includes `referredLyticsAudiences` / `referredAudiences` summaries, not the full variant array.

### shortUids never restart at 0 and are never reused
When you POST a new version, any variant without an explicit `shortUid` gets the next integer after the previous high-water mark. If earlier aborted drafts consumed shortUids 4-8, your next new variant might be shortUid `9`. Expect non-contiguous shortUids in long-lived experiences — don't assume `N+1`.

### Audience fields are required for SegmentedVariant
Every `SegmentedVariant` must include both `audiences` (non-empty array) and `audienceCombinationType`. Omitting either returns `EMPTY_ARRAY` and `NOT_VALID_ENUM` errors.

---

## Failures & Fixes

### Lytics audience UID rejected as invalid ObjectId
- **Tried:** `"audiences": ["c1adaa52abab8914a51ddf93aa7681f7"]` (Lytics 32-char hex UID in the `audiences` field)
- **Error:** `"c1adaa52... is not a valid ObjectId"`
- **Fix:** Use `"lyticsAudiences"` field instead of `"audiences"` for Lytics-synced audiences. Set `"audiences": []`. The `audiences` field only accepts 24-char native Personalize ObjectId UIDs.

### Management token rejected by Personalize API
- **Tried:** `authtoken: <management_token>` on Personalize endpoints
- **Error:** `"You're not allowed in here unless you're logged in."`
- **Fix:** Use a user authtoken from `POST /v3/user-session` or an OAuth token. Management tokens only work for the CMA, not the Personalize API.

### Entry variant rejected — variant doesn't belong to content type
- **Tried:** `PUT /v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}` before linking variant group
- **Error:** `"The Variant 'csXXX' does not belong to the Content Type 'home_page'."`
- **Fix:** Link the variant group first: `PUT /v3/variant_groups/{uid}` with `content_types: [{"uid": "<ct>", "status": "linked"}]`

### Variant group linkage fails with misleading error
- **Tried:** `PUT /v3/variant_groups/{uid}` with `{"content_types": [{"uid": "<content_type>"}]}`
- **Error:** `"Name or content types is required"`
- **Fix:** Include both `name` and `content_types` with the `status` field: `{"name": "...", "content_types": [{"uid": "...", "status": "linked"}]}`

### Bulk publish overwrites base entry with wrong version
- **Tried:** Bulk publish with `"version": 1` for each variant entry (intending variant version 1)
- **Symptom:** Base entry replaced with version 1 content, entire homepage goes blank
- **Root cause:** The `version` field in bulk publish refers to the **base entry version**, not the variant version. Setting it to 1 publishes version 1 of the base entry, overwriting the current live version.
- **Fix:** Use the **current base entry version** (check `_version` from `GET /v3/content_types/{ct}/entries/{entry}`) or omit the `version` field entirely to publish the latest version. Republish the correct base version immediately if this happens.

### Audience creation fails without match options
- **Tried:** Rule with `"attributeMatchCondition": "STRING_EQUALS"` but `"value"` directly on the rule
- **Error:** `"valid matchOptions is required for STRING_EQUALS condition"`
- **Fix:** Use nested `attributeMatchOptions` object: `{"__type": "StringMatchOptions", "value": "..."}`

### Adding a variant to an active experience wipes all existing variants
- **Tried:** `POST /experiences/{uid}/versions` with the 4 existing variants + 1 new variant in the body, none with explicit shortUids
- **Symptom:** Server accepts the POST (201) but assigns brand-new shortUids (4, 5, 6, 7, 8) — the existing variants' CMS variant UIDs stay in the variant group but are no longer referenced by the active version. On activation, all 4 existing personalizations go dark because the new version references empty, freshly-minted variant UIDs.
- **Fix:** Pause the active version first (`PUT { status: "PAUSED", variants: [...existing with explicit shortUids] }`), then `POST /experiences/{uid}/versions` with `status: "DRAFT"` and **explicit `shortUid` values on every existing variant**. New variants omit `shortUid` and get auto-assigned. This preserves the existing `_cms.variants` mapping exactly. See "Adding a Variant to an Existing Experience" above.

### Version GET by versionUid returns 404
- **Tried:** `GET /experiences/{uid}/versions/{versionUid}`
- **Error:** `404 Cannot GET`
- **Fix:** Use `GET /experiences/{uid}/versions` (array response). The per-version GET is not exposed. The top-level `GET /experiences/{uid}` only returns summary fields like `referredLyticsAudiences` — not the full variant array.

### Paused → Draft transition rejected
- **Tried:** `PUT { status: "DRAFT" }` on a version that was just paused
- **Error:** `personalize.EXPERIENCES.VERSIONS.CANNOT_MARK_VERSION_AS_DRAFT`
- **Fix:** Don't try to reuse the paused version. `POST /experiences/{uid}/versions` to create a new DRAFT version. Then activate the new one when ready.

### Bulk publish silently flattens variant payloads
- **Tried:** `POST /v3/bulk/publish` with `variants: [{uid: "cs..."}]` nested in `entries[]`
- **Symptom:** Returns 200 "Your bulk publish request is in progress." Queue shows `type: "entry"` publishing the base entry — variant is never published. `GET /variants/{uid}` stays at `publish_details: []`.
- **Fix:** Use `mcp__contentstack__publish_variants_of_an_entry` with `publish_latest_base: true`. The variants skill has the full rule — never use bulk publish for variants.

---

## End-to-End Playbook: Lytics → GTM → Contentstack Personalize

For a "set up a full new personalized experience" request, here is the full cross-product flow. Each step cross-references the dedicated skill for that surface. Follow this order to avoid the rabbit holes documented in the Failures section.

### 0. Clarify with the user (1 minute)

Before touching anything, use `AskUserQuestion` to confirm:
1. **Target surface** — which page/component, which content type, which fields get swapped per variant
2. **Intent signal** — what user behavior defines the audience (dwell, scroll, click, form submit, etc.)
3. **Existing experience?** — list `GET /experiences` and ask whether to extend an existing one or create a new one (see "Before You Start" above)
4. **Lytics vs native Personalize audience** — Lytics-synced audiences give you behavioral targeting via JStag; native Personalize audiences use Contentstack attributes. For behavioral signals, use Lytics.

### 1. Lytics: create field, mapping, publish, audience

See `lytics-cdp-api` skill. Key endpoints, all on `/v2/*` (never `/api/*` for mutations on Conductor accounts):

```
POST /v2/schema/user/field      — type "bool" (NOT "boolean"), omit mergeop for bool and identity fields
POST /v2/schema/user/mapping    — stream: "default" (so jstag.send picks it up with no stream override)
POST /v2/schema/user/publish    — body: { tag, description } (both required)
POST /v2/segment                — QL: "FILTER field_name = true"; set is_public: true
```

Capture the segment's 32-char hex UID — this is what you pass to Contentstack via `lyticsAudiences`.

**Bootstrap escape hatch:** if you need the segment UID before the field has finished propagating through the Lytics schema (e.g., Contentstack is waiting on it), `POST /api/segment?force=true` bypasses schema validation and still returns a stable UID.

### 2. GTM: wire the intent signal to Lytics

See `lytics-jstag` skill. Before creating anything:

```
mcp__gtm__gtm_list_tags — check if "Lytics CDP - Initialize" already exists
```

If it exists (common on mature stacks), **do not create a duplicate** — it returns `"Found entity with duplicate name."` Reference it via `setupTag` on your downstream event tag. If it doesn't exist, create it on All Pages (`firingTriggerId: ["2147479553"]`) and match the account ID format (hex or numeric) to whatever the stack already uses.

Then create:
- **Trigger** for the page/event that defines the signal (e.g., pageview filtered on `Page Path startsWith /foster`)
- **Tag** (Custom HTML) that waits for the threshold conditions and calls `jstag.send({event: "...", <field>: true, ...})`. Always route through `jstag.send` (not raw `fetch` to `c.lytics.io`) so identity and cookie handling are consistent. Reference the init tag via `setupTag: [{tagName: "Lytics CDP - Initialize", stopOnSetupFailure: true}]`.
- After the `jstag.send`, push a non-`gtm.*` event to `window.dataLayer` if the app's PersonalizeContext listens for dataLayer events to trigger variant recheck (see `contentstack-personalize-variants` skill).

Create a version (`mcp__gtm__gtm_create_version`) and publish it (`mcp__gtm__gtm_publish_version`).

### 3. Contentstack Personalize: configure the experience

Two branches depending on step 0's answer to "existing experience?":

**3a. Extending an existing experience** → use the "Adding a Variant to an Existing Experience" flow above. Pass explicit `shortUid` values for existing variants when POSTing the new draft.

**3b. Creating a new experience** → use the "Flow Overview — New Experience" above. Activate **before** writing variant content so the post-activation `_cms.variants` mapping is stable.

In both cases, pass the Lytics segment UID via `lyticsAudiences: ["..."]` with `audiences: []` and `audienceCombinationType: "OR"`. Do not put Lytics UIDs in the `audiences` field — it returns `"not a valid ObjectId"` (see `contentstack-personalize-variants` skill for the Lytics field rule).

### 4. CMA: variant content

See `contentstack-personalize-variants` skill.

- `PUT /v3/variant_groups/{vg_uid}` body `{ name, content_types: [{ uid, status: "linked" }] }` — link the variant group to the content type
- `PUT /v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}?locale=...` — write variant content using `_change_set`, `_order`, and `_metadata.uid` per the variants skill. **File fields (images) take a plain UID string**, not an object or full asset
- **Publish via `mcp__contentstack__publish_variants_of_an_entry` with `publish_latest_base: true`** — never `/v3/bulk/publish`, which silently flattens to a base-entry publish

### 5. Application-side cross-checks

- If the app hardcodes variant labels keyed on shortUid (e.g., `PersonalizeBadge.tsx`), add the new shortUid to the map
- Verify the middleware and client PersonalizeContext are unchanged — the Edge SDK resolves variants automatically from the visitor's Lytics audience membership

### 6. Verification

- **Publish queue**: `GET /v3/publish-queue` should show a recent `type: "entry_variant"` row with `entry.uid` = your variant UID and `publish_details.status: "success"`
- **CDA**: `curl cdn.contentstack.io/.../entries -H "x-cs-variant-uid: cs_personalize_{expShortUid}_{varShortUid}"` — the response's `publish_details.variants` should reflect your variant
- **End-to-end smoke test**: trigger the signal manually (e.g., stay on the target page long enough), check the Lytics profile receives the field, verify the segment populates, and confirm the homepage swaps its hero

---

## Reference

- [Personalize Management API](https://www.contentstack.com/docs/developers/apis/personalize-management-api)
- [Entry Variants API](https://www.contentstack.com/docs/developers/apis/content-management-api/)
- [OpenAPI Spec](https://personalize-api.contentstack.com/openapi) (download JSON, open in Swagger)
- Sibling skills: `contentstack-personalize-variants` (variant content + publishing), `lytics-cdp-api` (Lytics fields/mappings/segments), `lytics-jstag` (JStag + GTM integration)
