---
name: contentstack-content-modeling
description: >-
  Copy-paste JSON field templates for all 19 Contentstack CMA field types,
  content type structure patterns (singleton page, collection, data type),
  modular blocks, field selection guide, and common mistakes.
  Use when creating or updating content types via the CMA API or MCP tools.
license: MIT
metadata:
  author: contentstack
  version: "1.0"
  source: https://www.contentstack.com/docs/developers/apis/content-management-api/
  last_updated: "2026-04-09"
---

# Contentstack Content Modeling

Copy-paste field templates and structural patterns for creating content types via the CMA API or MCP tools. Templates include the correct `field_metadata` for each field type. Rich Text Editor fields require `"version": 3` in `field_metadata`.

---

## Field Templates

### 1. Single Line Text

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "field_metadata": {
    "description": "{{optional description}}",
    "default_value": "{{optional default}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 2. Multi Line Text (Textarea)

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "field_metadata": {
    "multiline": true,
    "description": "{{optional description}}",
    "default_value": "{{optional default}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 3. Rich Text Editor (HTML)

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "field_metadata": {
    "allow_rich_text": true,
    "description": "{{optional description}}",
    "version": 3
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 4. Markdown

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "field_metadata": {
    "markdown": true,
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 5. JSON Rich Text Editor (JSON RTE)

The modern rich text field. Stores structured JSON instead of HTML.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "json",
  "field_metadata": {
    "rich_text_type": "advanced",
    "description": "{{optional description}}",
    "version": 3
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 6. Number

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "number",
  "field_metadata": {
    "description": "{{optional description}}",
    "default_value": 0
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 7. Boolean

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "boolean",
  "field_metadata": {
    "description": "{{optional description}}",
    "default_value": false
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 8. Date (ISO)

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "isodate",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 9. Select / Dropdown (Single)

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "display_type": "dropdown",
  "enum": {
    "advanced": false,
    "choices": [
      { "value": "{{option_1}}" },
      { "value": "{{option_2}}" },
      { "value": "{{option_3}}" }
    ]
  },
  "field_metadata": {
    "description": "{{optional description}}",
    "default_value": "{{option_1}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 10. Select / Dropdown (Multiple)

Same as single select but with `"multiple": true`. Values are stored as an array.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "display_type": "dropdown",
  "enum": {
    "advanced": false,
    "choices": [
      { "value": "{{option_1}}" },
      { "value": "{{option_2}}" },
      { "value": "{{option_3}}" }
    ]
  },
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": true,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 11. File / Asset

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "file",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

For multiple file uploads, set `"multiple": true`.

### 12. Link

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "link",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

Stores `{ "title": "...", "href": "..." }`. Use for external URLs. For internal page links, a plain text field is simpler.

### 13. Reference (Entry Relationship)

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "reference",
  "reference_to": ["{{target_content_type_uid}}"],
  "field_metadata": {
    "ref_multiple": true,
    "ref_multiple_content_types": false,
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

- `reference_to`: array of content type UIDs this field can reference
- `ref_multiple: true`: allows selecting multiple entries
- `ref_multiple_content_types: true`: allows referencing entries from different content types listed in `reference_to`

### 14. Group (Non-repeating)

A group of fields displayed as a section. Does **not** repeat.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "group",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "schema": [
    {
      "display_name": "Label",
      "uid": "label",
      "data_type": "text",
      "multiple": false,
      "mandatory": false,
      "unique": false,
      "non_localizable": false
    }
  ],
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

### 15. Group (Repeating)

Same structure but `"multiple": true`. Creates an array of group instances — use for lists of structured items (cards, steps, stats, team members).

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "group",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "schema": [
    {
      "display_name": "Title",
      "uid": "title",
      "data_type": "text",
      "field_metadata": { "isTitle": true },
      "multiple": false,
      "mandatory": false,
      "unique": false,
      "non_localizable": false
    },
    {
      "display_name": "Description",
      "uid": "description",
      "data_type": "text",
      "field_metadata": { "multiline": true },
      "multiple": false,
      "mandatory": false,
      "unique": false,
      "non_localizable": false
    }
  ],
  "multiple": true,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

**Tip:** Set `"isTitle": true` on one sub-field so the group instance has a human-readable label in the UI.

### 16. Modular Blocks

A field that holds an ordered list of typed blocks — the backbone of page-builder content types.

```json
{
  "display_name": "Sections",
  "uid": "sections",
  "data_type": "blocks",
  "multiple": true,
  "mandatory": false,
  "unique": false,
  "non_localizable": false,
  "blocks": [
    {
      "title": "Hero",
      "uid": "hero",
      "schema": [
        {
          "display_name": "Heading",
          "uid": "heading",
          "data_type": "text",
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "display_name": "Description",
          "uid": "description",
          "data_type": "text",
          "field_metadata": { "multiline": true },
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        }
      ]
    },
    {
      "title": "CTA Banner",
      "uid": "cta_banner",
      "schema": [
        {
          "display_name": "Heading",
          "uid": "heading",
          "data_type": "text",
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "display_name": "CTA Text",
          "uid": "cta_text",
          "data_type": "text",
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "display_name": "CTA Link",
          "uid": "cta_link",
          "data_type": "text",
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        }
      ]
    }
  ]
}
```

Each block is like a mini content type with its own schema. Blocks do **not** get `field_metadata` at the block level — only their child fields do.

### 17. Global Field

Embeds a reusable, centrally-managed field group. Changes to the global field propagate to all content types that use it.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "global_field",
  "reference_to": "{{global_field_uid}}",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

The global field must already exist. Its schema is managed separately via `POST /v3/global_fields`.

### 18. JSON

A raw JSON field for arbitrary structured data.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "json",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

**Note:** A plain `json` field (without `rich_text_type`) stores arbitrary JSON. A `json` field with `"rich_text_type": "advanced"` is a JSON RTE (template #5).

### 19. Taxonomy

Connects entries to taxonomy terms for classification and filtering.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "taxonomy",
  "taxonomy_uid": "{{taxonomy_uid}}",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "mandatory": false,
  "multiple": true,
  "unique": false,
  "non_localizable": false
}
```

The taxonomy must already exist. Create it via `POST /v3/taxonomies` or the MCP `create_a_taxonomy` tool.

### URL Field (Special)

The built-in URL field is a text field with `"_default": true` in `field_metadata`. Used when `options.is_page` is `true`.

```json
{
  "display_name": "URL",
  "uid": "url",
  "data_type": "text",
  "mandatory": true,
  "field_metadata": {
    "_default": true
  },
  "multiple": false,
  "unique": false,
  "non_localizable": false
}
```

### Multi-value Text (String Array)

A text field with `"multiple": true` stores an array of strings. Use for tags, traits, or any flat list.

```json
{
  "display_name": "{{Display Name}}",
  "uid": "{{uid}}",
  "data_type": "text",
  "field_metadata": {
    "description": "{{optional description}}"
  },
  "multiple": true,
  "mandatory": false,
  "unique": false,
  "non_localizable": false
}
```

---

## Field Selection Guide

| I need... | Use | data_type | Key options |
|---|---|---|---|
| Short text (title, name, slug) | Single Line Text | `text` | `unique: true` for slugs |
| Long text (bio, description) | Multi Line Text | `text` | `multiline: true` |
| Formatted content (articles) | JSON RTE | `json` | `rich_text_type: "advanced"` |
| Legacy HTML content | Rich Text Editor | `text` | `allow_rich_text: true` |
| Developer docs | Markdown | `text` | `markdown: true` |
| Dropdown / enum | Select | `text` | `enum.choices`, `display_type: "dropdown"` |
| Multi-select tags | Select (multiple) | `text` | Same as select + `multiple: true` |
| Flat string array | Multi-value Text | `text` | `multiple: true` (no enum) |
| Integer or decimal | Number | `number` | |
| Yes/no toggle | Boolean | `boolean` | |
| Calendar date | Date | `isodate` | |
| Image or document | File | `file` | `multiple: true` for galleries |
| External URL | Link | `link` | Stores `{ title, href }` |
| Internal page link | Single Line Text | `text` | Plain path string, simpler than Link |
| Related entries | Reference | `reference` | `reference_to: [ct_uid]` |
| Structured card/item | Group (repeating) | `group` | `multiple: true`, add `isTitle` |
| Field section | Group (non-repeating) | `group` | `multiple: false` |
| Page sections | Modular Blocks | `blocks` | Define each block type in `blocks[]` |
| Reusable field set | Global Field | `global_field` | `reference_to: gf_uid` |
| Arbitrary structured data | JSON | `json` | No `rich_text_type` |
| Category/tag tree | Taxonomy | `taxonomy` | `taxonomy_uid` required |

---

## Content Type Structure Templates

### Singleton Page (e.g., Home, About)

One entry per content type. Good for pages with a fixed URL.

```json
{
  "content_type": {
    "title": "{{Page Name}}",
    "uid": "{{page_name}}",
    "schema": [
      {
        "display_name": "Title",
        "uid": "title",
        "data_type": "text",
        "mandatory": true,
        "multiple": false,
        "unique": false,
        "non_localizable": false,
        "field_metadata": {
          "_default": true
        }
      },
      {
        "display_name": "URL",
        "uid": "url",
        "data_type": "text",
        "mandatory": true,
        "field_metadata": {
          "_default": true
        },
        "multiple": false,
        "unique": false,
        "non_localizable": false
      },
      {
        "display_name": "Sections",
        "uid": "sections",
        "data_type": "blocks",
        "multiple": true,
        "mandatory": false,
        "unique": false,
        "non_localizable": false,
        "blocks": []
      }
    ],
    "options": {
      "is_page": true,
      "singleton": true,
      "title": "title"
    }
  }
}
```

Fill the `blocks` array with section types (hero, CTA, stats, etc.).

### Collection (e.g., Blog Post, Product, Event)

Multiple entries, each with a unique URL.

```json
{
  "content_type": {
    "title": "{{Item Name}}",
    "uid": "{{item_name}}",
    "schema": [
      {
        "display_name": "Title",
        "uid": "title",
        "data_type": "text",
        "mandatory": true,
        "field_metadata": {
          "description": "{{Item}} name"
        },
        "multiple": false,
        "unique": false,
        "non_localizable": false
      },
      {
        "display_name": "URL",
        "uid": "url",
        "data_type": "text",
        "mandatory": true,
        "field_metadata": {
          "_default": true
        },
        "multiple": false,
        "unique": false,
        "non_localizable": false
      },
      {
        "display_name": "Slug",
        "uid": "slug",
        "data_type": "text",
        "mandatory": true,
        "unique": true,
        "field_metadata": {
          "description": "URL-friendly identifier"
        },
        "multiple": false,
        "non_localizable": false
      }
    ],
    "options": {
      "is_page": true,
      "singleton": false,
      "title": "title",
      "url_pattern": "/:slug",
      "url_prefix": "/{{items}}/"
    }
  }
}
```

Add content fields after the slug. Set `url_prefix` to the collection's URL path (e.g., `/blog/`, `/products/`).

### Simple Data Type (e.g., Config, Settings, Navigation)

Non-page content type — no URL, no routing. Used for structured data referenced by other entries or fetched directly.

```json
{
  "content_type": {
    "title": "{{Type Name}}",
    "uid": "{{type_name}}",
    "schema": [
      {
        "display_name": "Title",
        "uid": "title",
        "data_type": "text",
        "mandatory": true,
        "field_metadata": {
          "_default": true
        },
        "multiple": false,
        "unique": false,
        "non_localizable": false
      }
    ],
    "options": {
      "is_page": false,
      "singleton": false,
      "title": "title"
    }
  }
}
```

---

## CMA API Endpoints

### Create Content Type

```
POST https://api.contentstack.io/v3/content_types
Headers:
  api_key: {API_KEY}
  authorization: {MANAGEMENT_TOKEN}
  Content-Type: application/json
```

Body: use a structure template from above.

### Update Content Type

```
PUT https://api.contentstack.io/v3/content_types/{content_type_uid}
```

Send the full `content_type` object including all existing fields. Omitting a field from the schema **deletes** it.

### Via MCP

```
mcp__contentstack__create_a_content_type
  content_type_title: "Blog Post"
  content_type_uid: "blog_post"
  content_type_schema: [... field array ...]
```

The `content_type_schema` parameter takes the `schema` array directly (not wrapped in `content_type`).

---

## Content Modeling Decision Guide

Before creating content types, start with wireframes or mockups. Identify content components and their relationships. Break down reusable elements (headers, footers, CTAs) into separate content types or global fields.

### Single vs Multiple

Every content type is either **Single** (one entry) or **Multiple** (many entries).

| Pattern | When to use | Examples |
|---|---|---|
| **Single Webpage** | One-off pages with unique structure | Homepage, About Us, Contact Us |
| **Multiple Webpage** | Stream of entries with the same structure | Blog posts, news articles, products |
| **Single Content Block** | One-off non-page content | Header, footer, navigation menu |
| **Multiple Content Block** | Reusable non-page entries | Authors, categories, testimonials |

**Rule of thumb:** If you'll only ever have one entry, use Single. If you'll create many entries with the same fields, use Multiple.

### Webpage vs Content Block

- **Webpage** (`is_page: true`): Has a URL, represents a routable page. Include the URL field with `_default: true`.
- **Content Block** (`is_page: false`): No URL, not routable. Used for structured data referenced by other entries or fetched directly.

### When to Use Each Field Type

#### Group Fields

Use to organize related fields into a section. Good for bundling fields that belong together.

- **Non-repeating** (`multiple: false`): A single set of related fields (e.g., SEO metadata, address block)
- **Repeating** (`multiple: true`): A list of structured items (e.g., steps, stats, team cards, FAQ items)
- **Nesting**: Groups can nest up to 3 levels. Beyond that, switch to Reference fields.
- **`isTitle`**: Set on one sub-field so repeating group instances have readable labels in the UI

**Use Group when:** The data belongs to the parent entry and doesn't need to be shared across entries.

#### Modular Blocks

Use for dynamic page layouts where editors choose and reorder sections.

- Editors can add, remove, and rearrange blocks without developer help
- Each block type has its own schema (like a mini content type)
- Max 20 blocks per modular blocks field
- Cannot be placed inside a Group field

**Use Modular Blocks when:** Pages need flexible, editor-driven layouts with varying sections.

**Global Fields as Blocks:** When modular block types are reusable across content types, define them as Global Fields and embed them as blocks. This creates templatized, consistent page sections that can be updated centrally. Prefer this over inline block schemas when the same block structure appears in multiple content types.

**Block design principle — abstract, don't duplicate.** Each block should represent a component *type*, not a specific visual variation. Variations come from field values, not duplicate block definitions:

- "Hero image left" / "Hero image right" → one Hero block with a `layout` dropdown
- "CTA with button" / "CTA with form" → one CTA block with optional button and optional form fields
- "Stats bar (3 cols)" / "Stats bar (4 cols)" → one Stats block with a repeating group — count is data, not schema
- "Testimonial single" / "Testimonial carousel" → one Testimonial block with a `display_mode` dropdown

If you have 20+ structurally distinct blocks that can't be merged, the page is trying to do too much. Question the design — a single page type shouldn't need to be an entire website.

**Don't overuse:** Only for essential, widely-used content elements. Overuse creates convoluted structures that are hard to maintain. Stick to flat fields or groups for fixed-schema content.

#### Global Fields

Use when the same set of fields appears across multiple content types.

- Changes to a global field propagate to all content types that use it
- Can be embedded inside Groups or Modular Blocks
- Managed separately via `POST /v3/global_fields`

**Common use cases:** SEO fields, Open Graph metadata, Twitter Card tags, site header/footer config, banner components.

**Use Global Fields when:** You'd otherwise copy-paste the same field group into multiple content types.

#### Reference Fields

Use to link entries across content types. Creates a relationship, not a copy.

| Pattern | Example |
|---|---|
| **Self-referencing** | Product → related Products |
| **Single content type** | Blog Post → Author |
| **Multiple content types** | Brand → Clothes, Shoes, Bags |

**Use Reference when:** Content is genuinely reusable — shared across multiple entries. Authors referenced by many blog posts, categories used across products, etc.

**Don't use Reference for singletons.** If a referenced entry is only used by one parent entry, it shouldn't be a separate content type — hoist those fields into the parent model instead. References add indirection and editorial overhead; that's only justified when the content is actually shared.

**Exception:** A small number of single-use references in a model is fine if the majority of entries in that referenced content type are shared across multiple parents.

**Reference vs Select:** Use Reference for dynamic content relationships (entries that can be created/updated). Use Select for static, predefined choices (status, size, category enums).

#### Rich Text Editor Selection

| Editor | Best for | Output |
|---|---|---|
| **JSON RTE** | Most new content — structured, UI-formatted | JSON (recommended) |
| **HTML RTE** | Legacy content, custom HTML embedding | HTML string |
| **Markdown** | Developer docs, text-heavy content | Markdown string |

Prefer JSON RTE for new projects. HTML RTE and Markdown are for specific use cases.

### Structural Patterns

#### Page Builder (Modular Blocks)

For pages where editors choose and reorder sections:

```
Title (text, mandatory)
URL (text, _default)
Sections (blocks)
  ├─ Hero: heading, description, image, cta_text, cta_link
  ├─ Card Grid: heading, cards[] (group, multiple)
  ├─ Stats Bar: stats[] (group, multiple: value + label)
  ├─ CTA Banner: heading, description, cta_text, cta_link
  └─ ... more block types
```

#### Data Collection (Flat Fields)

For items with a fixed schema — products, team members, events:

```
Title (text, mandatory)
URL (text, _default)
Slug (text, mandatory, unique)
... content fields ...
Images (group, multiple: url, alt, width, height, order)
```

#### Navigation Structures

- **Simple (up to 3 levels):** Group fields with nested sub-groups
- **Deep hierarchies:** Reference fields linking to child entries
- **Example:** API Reference content type with Group containing Title, Description, and Reference to API Call entries

### Anti-pattern: Catch-All Page Content Type

A single "Page" content type with every possible modular block type — hero, CTA, pricing grid, comparison table, testimonials, video gallery, etc. — all in one modular blocks field.

**Why it fails:** Every field inside every block counts toward the content type's field limit (500 on some plans). A catch-all with 25+ block types easily hits this ceiling. Every page also carries the weight of blocks it never uses.

**Fix — split into purpose-built page types:**

Instead of one monolithic "Page", create 3-5 page types that reflect actual site structure:

```
Landing Page  → hero, CTA, stats, testimonials
Article Page  → hero, body (JSON RTE), author ref, related articles
Product Page  → product details, specs, gallery, pricing
Campaign Page → hero, video, form embed, CTA
```

Each page type only carries the blocks it needs, staying well under the field limit.

**Fix — extract heavy blocks into referenced content types:**

For complex, field-heavy sections (e.g., a comparison table with 40+ fields), pull them out of the modular block and into their own content type. Reference them from the page instead. The fields move to the referenced content type's field budget.

```
Before: Page (modular blocks) → all fields inline → hits 500
After:  Page (modular blocks) → lighter blocks inline
        Page → Reference → "Comparison Table" entry (own field budget)
        Page → Reference → "Pricing Grid" entry (own field budget)
```

**Don't extract blocks into references just to dodge the field limit.** If those referenced entries are only used by one parent, they're singletons — and references should be genuinely reusable content. Creating single-use reference entries to work around a limit is a modeling smell, not a fix. If a purpose-built page type still hits the limit after splitting, the page design itself is too complex — consolidate similar blocks (e.g., three CTA variants → one flexible CTA block with optional fields) or simplify the page.

**What doesn't help:**
- **Global Fields** — embedded, not referenced. Fields still count toward the parent's limit.
- **A second modular blocks field** — same content type, same field budget.

### UID Rules

- Use `snake_case` only — no hyphens, no uppercase
- Do not use [reserved keywords](https://www.contentstack.com/docs/developers/create-content-types/restricted-keywords-for-uids)
- Max 64 characters

### Entry Referencing in Code

Do not hardcode Entry UIDs — they change during stack migrations. Reference entries by a unique, immutable field such as Title or a custom slug identifier.

---

## Entry Migration Best Practices

When updating content type schemas (especially restructuring modular blocks or converting inline blocks to Global Fields), existing entry data must be migrated to match.

### Always Read Before Writing

Before updating an entry, **always read the current entry** (or the last known-good version) to capture existing data — especially file/asset fields. File fields store asset UID references, not URLs, and cannot be reconstructed without reading the original.

```
1. GET /v3/content_types/{ct}/entries/{entry_uid}         → capture current data
2. GET /v3/content_types/{ct}/entries/{entry_uid}?version=N → or read a specific version
3. Construct updated entry payload preserving all existing values
4. PUT /v3/content_types/{ct}/entries/{entry_uid}          → update
5. POST /v3/bulk/publish or publish_an_entry               → publish
```

### File/Asset Fields

File fields require a **UID reference** to an uploaded asset, not a URL string.

**Setting a file field in an entry update:**
```json
{
  "image": "bltd5f05152199fdfdc"
}
```

Just pass the asset UID as a string. The API resolves it to the full asset object in the response. You cannot set a file field with a URL — the asset must already be uploaded.

**When migrating entries:**
- Read the existing entry to capture the asset UID from file fields
- Preserve the UID in the updated payload
- If the asset UID is lost, query `GET /v3/assets` to find it by filename

### Block UID Changes

When modular blocks are renamed (e.g., `mission_cta` → `cta_banner`), the entry data keyed under the old block UID is **silently dropped** on the next update. To preserve data:

1. Read the current entry to capture data under the old block UID
2. Re-key the data under the new block UID in the update payload
3. Preserve all `_metadata.uid` values on sections — these are block instance identifiers

### Preserving `_metadata` UIDs

Every modular block instance and repeating group instance has a `_metadata.uid`. When updating entries:

- **Include `_metadata.uid`** on existing blocks/groups to preserve their identity
- **Omit `_metadata`** on new blocks/groups — the API will generate a UID
- Losing `_metadata.uid` can break Personalize variant `_change_set` and `_order` references

### Field Metadata Best Practices

Every field should have a `description` in `field_metadata` — this appears as help text in the Contentstack UI and guides editors.

```json
"field_metadata": {
  "description": "Short one-liner shown on the dog's card and profile"
}
```

**What to include:**
- What the field is for, in plain language
- Format guidance (e.g., "Display age, e.g. '2 years'")
- When to leave it empty (e.g., "Leave empty if purebred")
- Constraints (e.g., "Internal path only, e.g. /dogs")

### Creating Global Fields

Global Fields are created via the CMA API (no MCP tool exists for this):

```
POST https://api.contentstack.io/v3/global_fields
```

```json
{
  "global_field": {
    "title": "Hero",
    "uid": "hero",
    "schema": [
      { "display_name": "Heading", "uid": "heading", "data_type": "text", ... },
      { "display_name": "Description", "uid": "description", "data_type": "text", "field_metadata": { "multiline": true }, ... }
    ]
  }
}
```

### Using Global Fields as Modular Block Types

To reference a Global Field as a block inside a Modular Blocks field, use `reference_to` on the block definition — **without** a `schema` array:

```json
{
  "blocks": [
    { "title": "Hero", "uid": "hero", "reference_to": "hero" },
    { "title": "CTA Banner", "uid": "cta_banner", "reference_to": "cta_banner" },
    { "title": "Custom Block", "uid": "custom", "schema": [ ... ] }
  ]
}
```

**Critical:** A block must have either `reference_to` (Global Field) or `schema` (inline), **never both**. Including both causes: `"You cannot add the 'Schema' and 'Reference to' parameters within the JSON schema of a single block."`

---

## Limitations

| Constraint | Limit |
|---|---|
| Max fields per content type | 100 |
| Max modular blocks per field | 20 |
| Max nesting depth (groups) | 3 levels (use References beyond this) |
| Max content types per stack | Varies by plan |
| UID format | Max 64 chars, lowercase + underscores only |
| Modular Blocks in Groups | Not allowed |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Missing `version: 3` on RTE fields | RTE uses legacy editor, formatting issues | Add `"version": 3` to `field_metadata` on RTE and JSON RTE fields |
| Using HTML RTE for new content | HTML output, hard to render in modern frameworks | Use JSON RTE (`data_type: "json"`, `rich_text_type: "advanced"`) |
| Single-field group instead of `multiple: true` | Unnecessary nesting, clunky editor UX | Set `"multiple": true` directly on the text/number field |
| Missing `isTitle` on repeating group sub-field | Group instances show as "Item 1", "Item 2" in UI | Add `"isTitle": true` to one sub-field's `field_metadata` |
| Omitting fields on content type update (PUT) | Fields silently deleted | Always send the full schema array on update |
| Using `link` field for internal nav | Stores `{ title, href }` — overkill for path strings | Use a plain `text` field for internal paths |
| UID with hyphens or uppercase | API rejects or silently transforms | Use `snake_case` UIDs only |
| Missing `_default: true` on URL field | URL field not recognized as the page URL | Add `"_default": true` to `field_metadata` |
| Block-level `field_metadata` on modular blocks | Ignored — blocks are not fields | Only add `field_metadata` to fields inside blocks |
| Creating a new content type for every list | Content type sprawl, reference overhead | Use repeating groups for lists owned by a single entry |
| Hardcoding Entry UIDs in code | Breaks during stack migrations | Reference by Title or custom slug field |
| Nesting Groups beyond 3 levels | Unwieldy editor UX, maintenance burden | Switch to Reference fields for deep hierarchies |
| Using Modular Blocks for fixed layouts | Unnecessary complexity | Use flat fields or groups for predictable structures |
| Using Select for dynamic relationships | Can't add new options without schema change | Use Reference fields for content that grows |
| Catch-all page with every block type | Hits 500 field limit, every page carries unused blocks | Split into purpose-built page types; extract heavy blocks into referenced content types |
| Writing entry data without reading first | File/asset fields lost, text content overwritten with defaults | Always GET the current entry before PUT — especially for file fields |
| Renaming a block UID without migrating entry data | Data under old block UID silently dropped | Read entry, re-key data under new block UID, update |
| Setting file fields with URLs instead of asset UIDs | API rejects or field is empty | Pass the asset UID string; upload the asset first if needed |
| Including both `schema` and `reference_to` on a block | API error: cannot combine both parameters | Use `reference_to` alone for Global Field blocks, `schema` alone for inline blocks |
| Missing `description` on fields | Editors have no guidance, make formatting mistakes | Add `field_metadata.description` to every field with clear help text |

---

## Reference

- [Content Modeling Best Practices](https://www.contentstack.com/docs/developers/content-modeling/content-modeling-best-practices)
- [Single vs Multiple Content Types](https://www.contentstack.com/docs/developers/create-content-types/single-vs-multiple-content-types)
- [Content Type API](https://www.contentstack.com/docs/developers/apis/content-management-api/#content-types)
- [Field Types Reference](https://www.contentstack.com/docs/developers/create-content-types/field-types/)
- [Modular Blocks](https://www.contentstack.com/docs/developers/create-content-types/modular-blocks/)
- [Global Fields](https://www.contentstack.com/docs/developers/create-content-types/global-fields/)
- [Restricted Keywords for UIDs](https://www.contentstack.com/docs/developers/create-content-types/restricted-keywords-for-uids)
