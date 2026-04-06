---
name: contentstack-gtm-integration
description: >-
  Automates Contentstack Personalize + Google Tag Manager integration via the
  GTM API v2. Creates tags (Initialize, Trigger Impressions, Trigger Event,
  Set Attributes, Set UserId), triggers, and variables programmatically instead
  of manual GTM UI work. Also covers code-side integration: Next.js GTM snippet,
  dataLayer pushes, and Personalize Edge SDK setup.
  Use when setting up Personalize experiences with GTM, adding new impression
  or event triggers, or wiring Personalize actions to GTM tags.
license: MIT
metadata:
  author: contentstack
  version: "1.0"
  source: https://www.contentstack.com/docs/personalize/google-tag-manager-integration-with-personalize
  last_updated: "2026-04-06"
---

# Contentstack Personalize + Google Tag Manager Integration

This skill automates the integration of Contentstack Personalize with Google Tag Manager using the GTM API v2. Instead of manually creating tags and triggers in the GTM UI, use this skill to programmatically set up everything via API calls.

## Prerequisites

- Google Cloud project with **Tag Manager API v2** enabled
- OAuth 2.0 credentials (service account or OAuth client) with scopes:
  - `https://www.googleapis.com/auth/tagmanager.edit.containers`
  - `https://www.googleapis.com/auth/tagmanager.publish`
  - `https://www.googleapis.com/auth/tagmanager.readonly`
- GTM container ID (e.g., `GTM-NQZZQM33`)
- Contentstack Personalize project UID
- Access token stored in env var `GTM_ACCESS_TOKEN`

## GTM API v2 Reference

**Base URL:** `https://tagmanager.googleapis.com/tagmanager/v2`

All requests require `Authorization: Bearer {access_token}` header.

### Discovery: Get Account, Container, Workspace

```bash
# 1. List accounts
curl -H "Authorization: Bearer $GTM_ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts"

# 2. List containers (use accountId from above)
curl -H "Authorization: Bearer $GTM_ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/{accountId}/containers"

# 3. List workspaces (use containerId from above)
curl -H "Authorization: Bearer $GTM_ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/{accountId}/containers/{containerId}/workspaces"
```

The `path` field from each response is used as the parent for child operations.  
Example workspace path: `accounts/123456/containers/789012/workspaces/3`

---

## Contentstack Personalize Community Template

The **Contentstack Personalize Actions** template is a community GTM template.  
Gallery link: https://tagmanager.google.com/gallery/#/owners/contentstack/templates/personalize-actions-gtm-template

### Discovering the Template Type ID

Community template tags use `type: "cvt_{id}"` which is not publicly documented. To discover it:

1. **One-time manual step:** In GTM UI, create any tag using the "Contentstack Personalize Actions" template and save it
2. Read it back via API:
   ```bash
   curl -H "Authorization: Bearer $GTM_ACCESS_TOKEN" \
     "https://tagmanager.googleapis.com/tagmanager/v2/{workspacePath}/tags"
   ```
3. Find the tag — its `type` field will be like `cvt_12345678_42`
4. Note the `type` value and `parameter` keys — reuse these for all future API-created tags

### Template Parameter Keys

After the discovery step, the Personalize template parameters typically follow this pattern:

| Parameter Key | Used By | Description |
|---|---|---|
| `action` | All tags | Action type: `init`, `triggerImpressions`, `triggerEvent`, `setAttributes`, `setUserId` |
| `projectUid` | Initialize | Contentstack Personalize project UID |
| `sdkUrl` | Initialize | Personalize Edge SDK URL (usually leave default) |
| `edgeApiUrl` | Initialize | Edge API URL (default: AWS NA) |
| `experienceShortUids` | Trigger Impressions | List of experience short UIDs |
| `eventKey` | Trigger Event | The event key from Personalize |
| `attributes` | Set Attributes | Key-value pairs matching Personalize attribute keys |
| `preserveUserAttributes` | Set UserId | Boolean to preserve attributes on identity change |

---

## Creating Tags via API

### Endpoint

```
POST https://tagmanager.googleapis.com/tagmanager/v2/{workspacePath}/tags
```

### 1. Initialize Tag

This tag sets up the Personalize Edge SDK. It must fire before all other Personalize tags.

```json
{
  "name": "CS Personalize - Initialize",
  "type": "cvt_{TEMPLATE_ID}",
  "parameter": [
    { "type": "template", "key": "action", "value": "init" },
    { "type": "template", "key": "projectUid", "value": "{PERSONALIZE_PROJECT_UID}" },
    { "type": "template", "key": "edgeApiUrl", "value": "https://personalize-edge.contentstack.com" }
  ],
  "firingTriggerId": ["{ALL_PAGES_TRIGGER_ID}"],
  "tagFiringOption": "oncePerLoad"
}
```

### 2. Trigger Impressions Tag

Tracks when a personalized experience is displayed. Must fire after Initialize.

```json
{
  "name": "CS Personalize - {Experience Name} Impression",
  "type": "cvt_{TEMPLATE_ID}",
  "parameter": [
    { "type": "template", "key": "action", "value": "triggerImpressions" },
    {
      "type": "list",
      "key": "experienceShortUids",
      "list": [
        {
          "type": "map",
          "map": [
            { "type": "template", "key": "shortUid", "value": "{EXPERIENCE_SHORT_UID}" }
          ]
        }
      ]
    }
  ],
  "firingTriggerId": ["{PAGE_TRIGGER_ID}"],
  "tagFiringOption": "oncePerLoad",
  "setupTag": [
    {
      "tagName": "CS Personalize - Initialize",
      "stopOnSetupFailure": true
    }
  ]
}
```

### 3. Trigger Event Tag

Records user interactions (clicks, conversions) for Personalize.

```json
{
  "name": "CS Personalize - {Event Name} Event",
  "type": "cvt_{TEMPLATE_ID}",
  "parameter": [
    { "type": "template", "key": "action", "value": "triggerEvent" },
    { "type": "template", "key": "eventKey", "value": "{EVENT_KEY}" }
  ],
  "firingTriggerId": ["{CLICK_TRIGGER_ID}"],
  "tagFiringOption": "oncePerEvent",
  "setupTag": [
    {
      "tagName": "CS Personalize - Initialize",
      "stopOnSetupFailure": true
    }
  ]
}
```

### 4. Set Attributes Tag

Sends user attributes to Personalize for targeted content.

```json
{
  "name": "CS Personalize - Set {Attribute Name}",
  "type": "cvt_{TEMPLATE_ID}",
  "parameter": [
    { "type": "template", "key": "action", "value": "setAttributes" },
    {
      "type": "list",
      "key": "attributes",
      "list": [
        {
          "type": "map",
          "map": [
            { "type": "template", "key": "key", "value": "{ATTRIBUTE_KEY}" },
            { "type": "template", "key": "value", "value": "{ATTRIBUTE_VALUE}" }
          ]
        }
      ]
    }
  ],
  "firingTriggerId": ["{TRIGGER_ID}"],
  "tagFiringOption": "oncePerEvent",
  "setupTag": [
    {
      "tagName": "CS Personalize - Initialize",
      "stopOnSetupFailure": true
    }
  ]
}
```

### 5. Set UserId Tag

Associates a unique identifier when an unknown user logs in.

```json
{
  "name": "CS Personalize - Set UserId",
  "type": "cvt_{TEMPLATE_ID}",
  "parameter": [
    { "type": "template", "key": "action", "value": "setUserId" },
    { "type": "boolean", "key": "preserveUserAttributes", "value": "true" }
  ],
  "firingTriggerId": ["{LOGIN_TRIGGER_ID}"],
  "tagFiringOption": "oncePerEvent",
  "setupTag": [
    {
      "tagName": "CS Personalize - Initialize",
      "stopOnSetupFailure": true
    }
  ]
}
```

---

## Creating Triggers via API

### Endpoint

```
POST https://tagmanager.googleapis.com/tagmanager/v2/{workspacePath}/triggers
```

### Page View Trigger (specific page)

```json
{
  "name": "PV - {Page Name}",
  "type": "pageview",
  "filter": [
    {
      "type": "contains",
      "parameter": [
        { "type": "template", "key": "arg0", "value": "{{Page URL}}" },
        { "type": "template", "key": "arg1", "value": "{URL_PATTERN}" }
      ]
    }
  ]
}
```

### Click Trigger (by element ID)

```json
{
  "name": "Click - {Element Name}",
  "type": "click",
  "filter": [
    {
      "type": "equals",
      "parameter": [
        { "type": "template", "key": "arg0", "value": "{{Click ID}}" },
        { "type": "template", "key": "arg1", "value": "{ELEMENT_ID}" }
      ]
    }
  ]
}
```

### Custom Event Trigger

```json
{
  "name": "CE - {Event Name}",
  "type": "customEvent",
  "customEventFilter": [
    {
      "type": "equals",
      "parameter": [
        { "type": "template", "key": "arg0", "value": "{{_event}}" },
        { "type": "template", "key": "arg1", "value": "{CUSTOM_EVENT_NAME}" }
      ]
    }
  ]
}
```

### Trigger Type Reference

| GTM UI Name | API `type` value |
|---|---|
| Page View | `pageview` |
| DOM Ready | `domReady` |
| Window Loaded | `windowLoaded` |
| Click - All Elements | `click` |
| Click - Just Links | `linkClick` |
| Custom Event | `customEvent` |
| Form Submission | `formSubmission` |

---

## Tag Sequencing

Tags reference other tags **by name** (not ID) in `setupTag` and `teardownTag` arrays.

**Fire Tag B before Tag A** (B is a setup tag for A):
```json
{
  "setupTag": [
    {
      "tagName": "CS Personalize - Initialize",
      "stopOnSetupFailure": true
    }
  ]
}
```

**Important:** The referenced tag must already exist in the workspace. Always create the Initialize tag first.

---

## Publishing

### Step 1: Create a Version

```
POST https://tagmanager.googleapis.com/tagmanager/v2/accounts/{a}/containers/{c}/workspaces/{w}:create_version
```

```json
{
  "name": "v1 - Contentstack Personalize Setup",
  "notes": "Added Personalize init, impression, and event tags"
}
```

### Step 2: Publish the Version

```
POST https://tagmanager.googleapis.com/tagmanager/v2/accounts/{a}/containers/{c}/versions/{versionId}:publish
```

---

## Automation Workflow

The recommended sequence for setting up a new Personalize integration:

```
1. GET  accounts                              → accountId
2. GET  accounts/{a}/containers               → containerId (match by GTM-ID)
3. GET  accounts/{a}/containers/{c}/workspaces → workspaceId
4. POST triggers  (Page View for target page)  → triggerId for impressions
5. POST triggers  (Click for conversion)       → triggerId for events
6. POST triggers  (Custom Event for login)     → triggerId for userId
7. POST tags      (Initialize - fires on All Pages, oncePerLoad)
8. POST tags      (Trigger Impressions - setupTag: Initialize)
9. POST tags      (Trigger Event - setupTag: Initialize)
10. POST tags     (Set UserId - setupTag: Initialize)
11. POST tags     (Set Attributes - setupTag: Initialize)
12. POST create_version
13. POST publish
```

---

## Code-Side: GTM Snippet (Next.js)

The GTM snippet should already be installed in `app/layout.tsx` using `next/script` with the container ID from `NEXT_PUBLIC_GTM_ID`. No additional code-side work is needed — the Personalize Actions template handles SDK initialization, impressions, events, and attributes entirely through GTM. Page View and Click triggers fire natively via GTM's built-in detection.

**Note:** Custom Event triggers (e.g., `is_logged_in` for Set UserId) are the one exception — these require a `dataLayer.push({ event: "event_name" })` from your code to fire.

---

## Troubleshooting

### Tags Not Firing
- Verify triggers have correct conditions (`filter` / `customEventFilter`)
- Check tag sequencing — Initialize must fire first via `setupTag`
- Use GTM Preview mode to debug in real-time

### API Errors
- **403 Forbidden**: Check OAuth scopes and that the service account has access to the GTM container
- **409 Conflict**: Workspace has conflicts with live version — sync first: `POST .../workspaces/{w}:sync`
- **429 Rate Limited**: Add delays between API calls (200-350ms)

### Community Template Not Found
- The `cvt_{id}` type must be discovered by creating one tag manually in GTM UI first
- Read it back via `GET .../tags` to capture the type string and parameter keys

### Data Not Reaching Personalize
- Verify the Personalize project UID is correct
- Check Edge API URL matches your Contentstack region
- Inspect network calls in DevTools for errors to the edge API

## Reference

- [Contentstack Personalize GTM Docs](https://www.contentstack.com/docs/personalize/google-tag-manager-integration-with-personalize)
- [GTM API v2 Reference](https://developers.google.com/tag-platform/tag-manager/api/v2)
- [Contentstack Personalize Actions GTM Template](https://tagmanager.google.com/gallery/#/owners/contentstack/templates/personalize-actions-gtm-template)
- [Reference Next.js + GTM Example](https://github.com/contentstack-personalize-examples/nextjs-example-launch-gtm)
