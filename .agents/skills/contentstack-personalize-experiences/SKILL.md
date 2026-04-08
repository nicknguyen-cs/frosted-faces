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
  version: "1.0"
  source: https://www.contentstack.com/docs/developers/apis/personalize-management-api
  last_updated: "2026-04-08"
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

## Flow Overview

```
1. Create audiences           Personalize API   POST /audiences
2. Create experience          Personalize API   POST /experiences
3. Configure version          Personalize API   PUT  /experiences/{uid}/versions/{versionUid}
   (add variants + map audiences)
4. Link variant group to CT   CMA API           PUT  /v3/variant_groups/{group_uid}
5. Create entry variants      CMA API           PUT  /v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}
6. Publish variants           CMA API           POST /v3/bulk/publish
7. Activate experience        Personalize API   PUT  /experiences/{uid}/versions/{versionUid}  (status: ACTIVE)
8. Set priority               Personalize API   PUT  /experiences-priority
```

Steps 1-3 use the **Personalize Management API**. Steps 4-6 use the **CMA**. Steps 7-8 return to the **Personalize API**.

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

### CDP audience UID incompatibility

Audiences synced from external CDPs (e.g., Lytics) have **32-character hex UIDs** that are not valid MongoDB ObjectIds. The experience version API rejects them with: `"<uid> is not a valid ObjectId"`.

**Workaround:** Create native Personalize audiences that mirror the CDP segments using custom attributes. Native audiences receive 24-character ObjectId UIDs that the API accepts.

---

## Order of Operations

```
Audiences must exist          → before experience version can reference them
Experience must exist         → before version can be configured
Version must have variants    → before CMS syncs variant group + variant UIDs
Variant group must be linked  → before entry variants can be created for that CT
  to the content type
Entry variants must exist     → before they can be published
Variants should be published  → before activating the experience
```

After step 3 (configuring the version), Personalize auto-syncs a variant group and variant UIDs to the CMS. Read the experience via `GET /experiences/{uid}` to find:
- `_cms.variantGroup` — the variant group UID
- `_cms.variants` — map of `shortUid → variantUid` (e.g., `{"0": "csXXX", "1": "csYYY"}`)

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
      "audiences": ["<audience_object_id>"],
      "audienceCombinationType": "OR"
    }
  ]
}
```

For A/B tests, use `ABTestVariant` with `trafficDistribution` (percentage) instead of `audiences`.

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

### The `status` field is required on version updates
Omitting `status` from `PUT /experiences/{uid}/versions/{versionUid}` returns `INVALID_STATUS` and `STATUS_REQUIRED` errors.

### Audience fields are required for SegmentedVariant
Every `SegmentedVariant` must include both `audiences` (non-empty array) and `audienceCombinationType`. Omitting either returns `EMPTY_ARRAY` and `NOT_VALID_ENUM` errors.

---

## Failures & Fixes

### CDP audience UID rejected as invalid ObjectId
- **Tried:** `"audiences": ["c1adaa52abab8914a51ddf93aa7681f7"]` (Lytics 32-char hex UID)
- **Error:** `"c1adaa52... is not a valid ObjectId"`
- **Fix:** Create native Personalize audiences via `POST /audiences` with rule definitions. Native audiences get valid 24-char ObjectId UIDs.

### Management token rejected by Personalize API
- **Tried:** `authtoken: <management_token>` on Personalize endpoints
- **Error:** `"You're not allowed in here unless you're logged in."`
- **Fix:** Use a user authtoken from `POST /v3/user-session` or an OAuth token. Management tokens only work for the CMA, not the Personalize API.

### Entry variant rejected — variant doesn't belong to content type
- **Tried:** `PUT /v3/content_types/{ct}/entries/{entry}/variants/{variant_uid}` before linking variant group
- **Error:** `"The Variant 'csXXX' does not belong to the Content Type 'home_page'."`
- **Fix:** Link the variant group first: `PUT /v3/variant_groups/{uid}` with `content_types: [{"uid": "<ct>", "status": "linked"}]`

### Variant group linkage fails with misleading error
- **Tried:** `PUT /v3/variant_groups/{uid}` with `{"content_types": [{"uid": "home_page"}]}`
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

---

## Reference

- [Personalize Management API](https://www.contentstack.com/docs/developers/apis/personalize-management-api)
- [Entry Variants API](https://www.contentstack.com/docs/developers/apis/content-management-api/)
- [OpenAPI Spec](https://personalize-api.contentstack.com/openapi) (download JSON, open in Swagger)
