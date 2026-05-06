---
name: lytics-cdp-api
description: >-
  Lytics CDP API for programmatically creating user profile fields, stream-to-field
  mappings, and audience segments. Covers the schema and segment REST APIs with
  correct request formats, QL syntax, and known failure modes.
  Use when creating Lytics fields, mappings, or audiences via API, working with
  the Lytics CDP, or setting up user profile schema programmatically.
license: MIT
metadata:
  author: lytics
  version: "2.1"
  source: https://docs.lytics.com
  last_updated: "2026-04-13"
---

# Lytics CDP API — Fields, Mappings & Audiences

## Auth & Headers

All requests require:
```
Authorization: {API_TOKEN}
Content-Type: application/json
```

Token format: `at.{hash1}.{hash2}` — passed directly as the Authorization header value (no `Bearer` prefix).

**Base URL:** `https://api.lytics.io/v2`

---

## Quick Reference

### 1. Create a Field

```
POST /v2/schema/{table}/field
```

Minimum viable request:
```json
{
  "id": "field_name",
  "type": "string",
  "shortdesc": "Human-readable label",
  "mergeop": "latest",
  "is_identifier": false,
  "is_pii": false
}
```

**Data types:** `string`, `int`, `number`, `bool`, `date`, `[]string`, `[]time`, `ts[]string`, `map[string]string`

⚠️ The API uses `"bool"`, not `"boolean"`. Sending `"type": "boolean"` returns `"Type for Field is not a valid Data Type"`. The Lytics UI labels this "True/False" but the wire type is `bool`.

**Merge operators for strings:** `latest`, `oldest` only. Not `most_recent`.

**Fields that must omit `mergeop` entirely:**
- Identity fields (`is_identifier: true`) — returns `"Identifier Field cannot define a Merge Operation"`
- `bool` fields — returns `"Merge operation 'latest' is invalid for data type 'boolean'. Valid merge operations are: []"` (note the empty brackets — no operator is valid for bool)

Optional fields: `longdesc`, `tags` (string array), `assertions` (email validation, format, length).

### 2. Create a Mapping

```
POST /v2/schema/{table}/mapping
```

Minimum viable request:
```json
{
  "stream": "default",
  "field": "field_name",
  "expr": "field_name"
}
```

The `expr` is an LQL expression. Common patterns:
- Direct map: `"expr": "raw_field_name"` (maps stream field to profile field as-is)
- Email validation: `"expr": "email(email)"` (validates email format before writing)
- Type conversion: `"expr": "tonumber(price)"` (string to number)
- Coalesce: `"expr": "oneof(email_address, emailAddress)"` (first non-null wins)

### 3. Create an Audience (Segment)

```
POST /v2/segment
```

Minimum viable request:
```json
{
  "name": "Audience Name",
  "slug_name": "audience_slug",
  "segment_ql": "FILTER field_name = \"value\"",
  "is_public": true,
  "table": "user"
}
```

Optional: `description`, `tags` (string array).

Set `is_public: true` to make the audience available via the client-side personalize API and `jstag.getSegments()`.

### 4. Read Back

| Resource | Endpoint |
|---|---|
| All fields | `GET /v2/schema/{table}/field` |
| All mappings | `GET /v2/schema/{table}/mapping` |
| Full schema | `GET /v2/schema/{table}` |
| All segments | `GET /v2/segment` |

---

## Segment QL Syntax

This is the most error-prone part. The syntax is **not** standard SQL boolean logic.

### Correct Patterns

```
FILTER field = "value"
FILTER AND (condition1, condition2)
FILTER OR (condition1, condition2)
FILTER OR (EXISTS email, EXISTS email_sha256)
FILTER AND (score_intensity > 50, score_frequency > 30)
FILTER field intersects ("val1", "val2", "val3")
```

### Wrong Patterns (will fail)

```
FILTER field = "value1" OR field = "value2"        -- use FILTER OR (...) instead
FILTER AND field1 = "x" AND field2 = "y"           -- use FILTER AND (cond, cond)
FILTER AND (field1 = "x" AND field2 = "y")         -- commas, not AND inside parens
FILTER field EXISTS                                 -- use EXISTS field (prefix, not postfix)
```

### Operators

| Operator | Example |
|---|---|
| Equals | `field = "value"` |
| Not equals | `field != "value"` |
| Greater/less | `field > 50`, `field <= 20` |
| Exists | `EXISTS field` (prefix keyword) |
| Set membership | `field intersects ("a", "b", "c")` |
| Nested AND/OR | `FILTER AND (cond1, OR (cond2, cond3))` |

---

## Gotchas & Failure Modes

### Merge operator `most_recent` doesn't exist
- **Tried:** `"mergeop": "most_recent"` on a string field
- **Error:** `Merge operation 'most_recent' is invalid for data type 'string'. Valid merge operations are: [latest oldest]`
- **Fix:** Use `"mergeop": "latest"` for strings. The UI says "most recent" but the API value is `latest`.

### Identity fields reject merge operators
- **Tried:** `"mergeop": "latest"` on a field with `"is_identifier": true`
- **Error:** `Identifier Field cannot define a Merge Operation.`
- **Fix:** Omit `mergeop` entirely for identity fields. Lytics handles merge logic internally for identifiers.

### Segment QL `OR` syntax is non-standard
- **Tried:** `FILTER event = "a" OR event = "b"`
- **Error:** `segment fields were invalid against existing schema for table user`
- **Fix:** Use `FILTER OR (event = "a", event = "b")` — the boolean operator wraps the conditions in prefix notation with commas, not infix with keywords.

### `EXISTS` is prefix, not postfix
- **Tried:** `FILTER event EXISTS`
- **Error:** `Invalid filter QL statement.`
- **Fix:** Use `FILTER EXISTS event`

### Fields must be published before segments can reference them
- **Tried:** Creating a segment referencing a draft field
- **Error:** `segment fields were invalid against existing schema for table user`
- **Fix:** Call `POST /v2/schema/user/publish` with `{"tag": "...", "description": "..."}` before creating segments on `/v2/segment`. Both fields are required — omitting either returns `"Publishing schema changes requires a tag and a description."` For a bootstrap escape hatch when you need the segment UID immediately (e.g., for Contentstack Personalize), `POST /api/segment?force=true` bypasses validation and still returns a stable UID.

### Conductor-enabled accounts break the old /api namespace
- **Tried:** `POST /api/schema/user/fieldinfo`, `POST /api/query`, `POST /api/schema/user`
- **Error:** `405 Method Not Allowed`, or `"Endpoint unavailable for accounts with Conductor schema enabled."`
- **Fix:** On Conductor-enabled accounts, all mutations go through the `/v2` namespace. The `/api/*` endpoints are read-only for schema/segments and should only be used for `GET` or the `?force=true` segment escape hatch. If you see 405s on `POST /api/*`, switch to `/v2` immediately instead of probing more endpoints.

### Misleading error messages
The error `segment fields were invalid against existing schema` can mean:
1. The field doesn't exist in the published schema (actual invalid field)
2. The QL syntax is wrong (e.g., infix OR instead of prefix OR)
3. The `EXISTS` keyword is in the wrong position

If you get this error, test with a single known-good field first (e.g., `FILTER score_intensity > 50`) to isolate whether it's a field issue or a syntax issue.

---

## Order of Operations

```
1. Create fields      POST /v2/schema/user/field      (can be parallelized)
2. Create mappings    POST /v2/schema/user/mapping    (can be parallelized, fields must exist)
3. Publish schema     POST /v2/schema/user/publish    (API, not UI-only)
4. Create segments    POST /v2/segment                (fields must be published)
```

Fields and mappings can be created in any order relative to each other — both land in draft. But segments validate against the **published** schema, so step 3 must happen before step 4.

### Publish Schema (API)

```
POST /v2/schema/user/publish
{
  "tag": "my-release-tag",
  "description": "Short description of what changed in this publish"
}
```

Both `tag` and `description` are **required**. Omitting either returns `"Publishing schema changes requires a tag and a description."` The response includes `version_number` and `draft_status: "applied"` confirming the publish landed.

### Bootstrap segment before schema publishes (escape hatch)

If another system urgently needs the segment UID (e.g., Contentstack Personalize needs it wired into `lyticsAudiences` before Lytics finishes processing the new field), the **v1** segment endpoint accepts a `?force=true` query parameter that bypasses schema validation:

```
POST /api/segment?force=true
```

The segment will be created and return a stable UID even if the field isn't in the published schema yet. The segment stays valid once the field is later published, so the UID you hand to Contentstack keeps working. Use only when the alternative is a blocking wait — prefer the `/v2/segment` endpoint after a proper publish for normal flows.

---

## Bulk Operations

The API has no batch endpoint. Create fields/mappings/segments one at a time. Add a small delay (200-300ms) between requests if creating many to avoid rate limiting. ⚠️ No rate limit was hit in a batch of 17 sequential requests, but this may vary by account.

---

## Manual Steps (Cannot Be Automated)

1. **Surface profile fields client-side** — In Lytics Account Settings, configure which user attributes are returned by the `/personalize` endpoint for use in `entityReady` callbacks. This is a UI-only toggle.

**Previously listed as manual but actually API-callable:**
- **Publish schema** — Use `POST /v2/schema/user/publish` with `tag` and `description`. See "Publish Schema (API)" above.
- **Enable API access per audience** — Set `is_public: true` on segment creation or update. No UI step needed.

## Reference

- [Lytics API v2 Documentation](https://docs.lytics.com/reference)
- [Fields & Mappings Guide](https://docs.lytics.com/docs/user-fields)
- [Audiences Documentation](https://docs.lytics.com/docs/audiences)
- [LQL Reference](https://docs.lytics.com/docs/lytics-query-language)
