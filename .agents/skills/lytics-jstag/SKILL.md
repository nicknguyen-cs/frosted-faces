---
name: lytics-jstag
description: >-
  Lytics JavaScript Tag (jstag) SDK for behavioral tracking, identity resolution,
  and real-time personalization. Covers jstag.send() for custom events, identity
  linking, profile access via entityReady, content recommendations, declarative
  lx-* attribute tracking, and SPA integration patterns.
  Use when adding Lytics tracking events, identifying users, accessing visitor
  profiles, or implementing content personalization on a website.
license: MIT
metadata:
  author: lytics
  version: "3.1"
  source: https://docs.lytics.com/docs/lytics-javascript-tag
  last_updated: "2026-04-13"
---

# Lytics JavaScript Tag (jstag)

The Lytics JS Tag is the primary SDK for collecting behavioral data from website visitors and delivering real-time personalization. It handles behavioral tracking, identity resolution, profile delivery, and integration handoff.

## Installation

### Script Tag (Recommended)

Paste in your site's `<head>`:

```html
<script type="text/javascript">
  !function(){"use strict";var o=window.jstag||(window.jstag={}),r=[];function n(e){o[e]=function(){for(var n=arguments.length,t=new Array(n),i=0;i<n;i++)t[i]=arguments[i];r.push([e,t])}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("loadEntity"),n("getEntity"),n("on"),n("once"),n("call");o.loadScript=function(n,t,i){var e=document.createElement("script");e.async=!0,e.src=n,e.onload=t,e.onerror=i;var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(e,o)},o.init=function n(t){o.config=t,t.callback?o.loadScript(t.src,function(){var n=window.jstag;for(var e in o.config=t,o)n[e]||(n[e]=o[e]);r.forEach(function(n){n[0]in window.jstag&&window.jstag[n[0]].apply(window.jstag,n[1])}),r=[],"init"in n&&n.init(t),t.callback(n)}):o.loadScript(t.src)},o.init({
    src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js'
  })}();
</script>
```

### Google Tag Manager

1. Create a **Custom HTML** tag in GTM
2. Paste the Lytics JS Tag snippet
3. Trigger on **All Pages**
4. Submit and publish

⚠️ **Check before creating.** Before creating a "Lytics CDP - Initialize" tag, list the existing GTM tags (`mcp__gtm__gtm_list_tags`) — on many stacks this tag already exists. Creating a duplicate returns `"Found entity with duplicate name."` If it exists, reference it via `setupTag: [{tagName: "Lytics CDP - Initialize", stopOnSetupFailure: true}]` on your downstream event tags instead of making a new one.

### Account ID format in the `src` URL

Lytics accepts two forms of account identifier in the `src`:
- **Numeric aid** (e.g., `9671`) — returned as `aid` from `GET /api/account`
- **32-char hex account ID** (e.g., `b9214b8cf4802609216a47c52888e110`) — returned as `id` from `GET /api/account`

Both work, but within a single stack all tags must use the **same form** or identity merging can misbehave. Before writing a new init tag, inspect the existing "Lytics CDP - Initialize" tag (if present) and match its form exactly. The collect API endpoint `c.lytics.io/c/{account_id}/{stream}` accepts either too.

### Next.js (via GTM)

If GTM is already installed in `app/layout.tsx` via `next/script`, the Lytics tag loads automatically through the GTM Custom HTML tag — no additional code-side work needed.

---

## Configuration

```js
jstag.init({
  src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js',
  loadid: true,                    // Cross-domain identity (third-party cookie)
  stream: 'web_main',             // Custom stream name (default: "default")
  sessecs: 1800,                   // Session timeout in seconds
  qsargs: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'],
  cookies: { domain: '.yoursite.com' }  // Cookie domain for subdomain tracking
});
```

### Configuration Options

| Key | Type | Default | Description |
|---|---|---|---|
| `src` | string | — | URL to load the tag from (required, provided by Lytics) |
| `url` | string | `//c.lytics.io` | Collection endpoint URL. **Do not change.** |
| `cid` | string | — | Account ID (auto-set from `src`) |
| `loadid` | boolean | `false` | Enable third-party cookies for cross-domain identity |
| `stream` | string | `"default"` | Data stream name for collected events |
| `sessecs` | integer | `1800` | Session timeout in seconds (30 min) |
| `qsargs` | string[] | `[]` | Query parameters to always collect from the URL |
| `cookies` | object | — | Cookie domain config, e.g., `{ domain: ".site.com" }` |
| `entity` | object | — | Custom identifier config (`byFieldKey`, `byFieldValue`) |
| `pageAnalysis` | object | — | Control automatic page data collection |
| `lx` | object | — | Declarative tracking plugin config |

---

## Data Collection

### Automatically Collected Fields

Every event automatically includes:

| Field | Description |
|---|---|
| `_e` | Event type (`pv` = page view) |
| `_ref` | Referral domain |
| `_tz` | Time zone offset |
| `_ul` | Browser language |
| `_sz` | Display size |
| `_ts` | Timestamp (ms since epoch) |
| `_nmob` | Not mobile (`t` = desktop) |
| `_device` | Device type |
| `url` | Page URL |
| `_uid` | Lytics cookie ID |

### Page Views

Captured automatically on full page loads. For SPAs, call manually:

```js
jstag.pageView();
```

### Custom Events — `jstag.send()`

```js
jstag.send({
  event: "button_clicked",
  button_name: "hero_cta",
  page_section: "homepage"
});
```

#### Signature

```js
jstag.send(STREAM, PAYLOAD, CALLBACK);
```

| Parameter | Type | Description |
|---|---|---|
| `STREAM` | string | Target stream name (optional, overrides config default) |
| `PAYLOAD` | object | The data to send |
| `CALLBACK` | function | Called when the collect request completes |

```js
jstag.send('checkout_events', { event: "cart_updated", item_count: 3 }, function(response) {
  console.log("Event sent:", response);
});
```

### Payload Best Practices

- Use **flat key-value pairs** (no nesting)
- Use **lowercase snake_case** for event names and field keys
- Be specific with event names (`product_viewed` not `click`)

```js
// Good
jstag.send({ event: "product_viewed", product_id: "SKU-123", product_category: "shoes" });

// Bad — nested objects, mixed case
jstag.send({ event: "Product Viewed", order: { id: "ORD-456", total: { value: 129.99 } } });
```

---

## Identity & User Identification

### Anonymous Tracking

On first visit, the JS Tag generates a unique `_uid` stored as a first-party cookie (`seerid`). This links all activity to a single anonymous profile across sessions.

### Identifying Known Users

Send identity data whenever available (login, registration, form submission):

```js
jstag.send({
  event: "login",
  email: "user@example.com",
  userid: "USR-12345",
  first_name: "Jane",
  last_name: "Doe"
});
```

This merges the anonymous cookie-based profile with any existing profile for that email/user ID.

### Custom Entity Identifiers

Use a stronger identifier for authenticated users instead of the cookie:

```js
var user = getAuthenticatedUser();
var config = {
  src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js'
};

if (user && user.id) {
  config.entity = {
    byFieldKey: 'user_id',
    byFieldValue: user.id
  };
} else if (user && user.email) {
  config.entity = {
    byFieldKey: 'email',
    byFieldValue: user.email
  };
}

jstag.init(config);
```

### Cross-Domain Tracking

```js
jstag.init({
  src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js',
  loadid: true
});
```

### Accessing the Anonymous ID

```js
jstag.getid(function(id) {
  console.log("Visitor ID:", id);
});
```

---

## Common Tagging Patterns

### Login / Registration

```js
jstag.send({ event: "login", email: user.email, userid: user.id });
jstag.send({ event: "registration", email: user.email, signup_source: "website", plan: "free" });
```

### Form Submissions

```js
jstag.send({
  event: "newsletter_signup",
  email: email,
  form_name: "footer_newsletter"
});

jstag.send({
  event: "contact_form_submitted",
  email: formData.email,
  name: formData.name,
  inquiry_type: formData.subject
});
```

### E-Commerce

```js
// Product view
jstag.send({ event: "product_viewed", product_id: "SKU-789", product_name: "Running Shoes", product_price: 89.99 });

// Add to cart
jstag.send({ event: "add_to_cart", product_id: "SKU-789", quantity: 1, cart_value: 89.99 });

// Purchase
jstag.send({ event: "purchase_completed", order_id: "ORD-456", order_value: 129.99, currency: "USD", item_count: 2 });
```

### Content Engagement

```js
jstag.send({ event: "search", search_query: "running shoes", results_count: 24 });
jstag.send({ event: "video_played", video_id: "VID-001", video_title: "Product Demo", video_duration: 180 });
jstag.send({ event: "file_downloaded", file_name: "whitepaper.pdf", file_type: "pdf" });
```

### Campaign & UTM Attribution

Capture automatically via config:

```js
jstag.init({
  src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js',
  qsargs: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
});
```

---

## Declarative Tracking with `lx-*` Attributes

Track interactions directly in HTML markup — no JavaScript required.

### Enable the Plugin

```js
jstag.init({
  src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js',
  lx: { disabled: false }
});
```

### Attributes

| Attribute | Description |
|---|---|
| `lx-trigger` | DOM event that triggers collection (`click`, `change`, `submit`, etc.) |
| `lx-send` | Query-string style payload (e.g., `event=signup&plan=free`) |
| `lx-send-*` | Individual payload fields as separate attributes |
| `lx-stream` | Route to a specific stream |

All attributes also work with `data-` prefix (e.g., `data-lx-trigger`).

### Examples

```html
<!-- Button click -->
<button lx-trigger="click" lx-send="event=cta_clicked&button_name=hero_signup">
  Sign Up Now
</button>

<!-- Using individual attributes -->
<button lx-trigger="click" lx-send-event="cta_clicked" lx-send-button_name="hero_signup">
  Sign Up Now
</button>

<!-- Form submission (auto-collects all field values) -->
<form lx-trigger="submit">
  <input name="email" type="email" />
  <input name="signup_source" type="hidden" value="footer_newsletter" />
  <button type="submit">Subscribe</button>
</form>

<!-- Custom stream -->
<button lx-trigger="click" lx-send="event=download&file=whitepaper.pdf" lx-stream="content_engagement">
  Download
</button>
```

### Notes

- Hyphens in `lx-send-*` names convert to dots in payload (`lx-send-user-name` -> `user.name`)
- Uses event delegation — dynamically added elements are tracked automatically
- `lx-trigger="submit"` calls `preventDefault()` — handle form submission separately

---

## Single Page Apps (SPA)

### Route Change Handling

```js
function onRouteChange() {
  jstag.pageView();
  jstag.loadEntity(function(profile) {
    console.log("Profile refreshed:", profile.data);
  });
}
```

### React

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function LyticsPageTracker() {
  const location = useLocation();
  useEffect(() => {
    window.jstag.pageView();
    window.jstag.loadEntity();
  }, [location.pathname]);
  return null;
}
```

### Next.js App Router

For Next.js with App Router, track route changes in a client component:

```tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LyticsPageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.jstag) {
      window.jstag.pageView();
      window.jstag.loadEntity();
    }
  }, [pathname]);
  return null;
}
```

### Widget Refresh Control

Prevent widget flickering on frequent route changes:

```js
jstag.init({
  src: '//c.lytics.io/api/tag/YOUR_ACCOUNT_ID/latest.min.js',
  pathfora: { publish: { listenForProfileChange: true } }
});
```

---

## Accessing Visitor Profiles

### Entity Ready Callback

```js
jstag.call('entityReady', function(profile) {
  var user = profile.data.user;
  console.log("Audiences:", user.segments);
  console.log("Email:", user.email);
});
```

### Profile Data Structure

```json
{
  "data": {
    "user": {
      "email": "user@example.com",
      "segments": ["all", "known_users", "high_value"],
      "first_name": "Jane"
    },
    "experiences": [
      {
        "experience_id": "f53e136b35c498ac944b56a0658ab672",
        "experience_slug": "welcome_offer"
      }
    ]
  }
}
```

### Audience Membership

```js
// Via callback (recommended)
jstag.call('entityReady', function(profile) {
  var audiences = profile.data.user.segments;
  if (audiences.indexOf('high_value') !== -1) {
    showVIPExperience();
  }
});

// Via direct method (only after profile loaded)
jstag.getSegments();

// Via localStorage (zero latency, cached)
var audiences = JSON.parse(localStorage.lytics_segments);
```

### Reloading the Profile

```js
jstag.loadEntity(function(profile) {
  console.log("Profile refreshed:", profile.data);
});
```

---

## Content Recommendations

```js
jstag.recommend(
  { limit: 5, collection: "blog-posts", visited: false, shuffle: true },
  function(recommendations) {
    recommendations.forEach(function(item) {
      console.log("Recommended:", item.title, item.url);
    });
  }
);
```

### Options

| Property | Type | Description |
|---|---|---|
| `limit` | number | Maximum recommendations to return |
| `collection` | string | Target a specific content collection |
| `visited` | boolean | Include/exclude previously visited content |
| `shuffle` | boolean | Randomize order |

### Error Handling

```js
jstag.on("recommend.failure", function(error) {
  console.error("Recommendation error:", error);
  displayFallbackContent();
});
```

---

## Integration Patterns

### Forward Profile to Other Tools

```js
jstag.call('entityReady', function(profile) {
  var user = profile.data.user;
  if (!user) return;

  // Google Analytics 4
  gtag('set', { 'audience_name': user.segments });

  // Any other tool
  yourTool.setUserData({
    lytics_audiences: user.segments,
    lytics_email: user.email
  });
});
```

---

## Data Flow

```
Browser (jstag.send)
    -> /c endpoint (collection)
        -> Data Stream (e.g., "default")
            -> LQL Processing (field mapping, identity resolution)
                -> User Profile (audiences, scores, affinities)
                    -> /personalize endpoint
                        -> Browser (entityReady callback)
```

---

## Quick Reference

### Methods

| Method | Description |
|---|---|
| `jstag.send(data)` | Send custom event data |
| `jstag.send(stream, data, cb)` | Send to specific stream with callback |
| `jstag.pageView()` | Track a page view |
| `jstag.call('entityReady', cb)` | Access visitor profile |
| `jstag.loadEntity(cb)` | Refresh profile and campaigns |
| `jstag.getEntity()` | Get current entity data |
| `jstag.getid(cb)` | Get visitor's anonymous ID |
| `jstag.setid(val)` | Set custom anonymous ID |
| `jstag.getSegments()` | Get audience membership |
| `jstag.recommend(opts, cb)` | Get content recommendations |
| `jstag.on(event, cb)` | Listen for events |
| `jstag.once(event, cb)` | Listen for event (once) |
| `jstag.setCookie(name, val, ttl)` | Set a browser cookie |
| `jstag.getCookie(name)` | Read a browser cookie |
| `jstag.mock()` | Test mode (no real sends) |

### Events

| Event | Description |
|---|---|
| `entityReady` | User profile has loaded |
| `recommend.requested` | Recommendation request initiated |
| `recommend.success` | Recommendations returned |
| `recommend.failure` | Recommendation request failed |

### Cookies & Storage

| Name | Type | Purpose |
|---|---|---|
| `seerid` | Cookie | Lytics anonymous visitor ID (`_uid`) |
| `lytics_segments` | localStorage | Cached audience membership |

---

## Debugging

```js
jstag.config.version          // Tag version
jstag.isLoaded                // True if all resources loaded
jstag.getSegments()           // Current audience membership
jstag.getEntity()             // Full profile data
jstag.getid(id => console.log(id))  // Anonymous visitor ID
```

In the Network tab, filter for `lytics.io`:
- **`/c` endpoint** — collection requests from `jstag.send()`
- **`/personalize` endpoint** — profile fetch requests

---

## Manual Steps (Cannot Be Automated)

1. **Create a Lytics account** — Sign up at lytics.com and get your account ID from Account Settings.

2. **Install the JS Tag** — If using GTM, create a Custom HTML tag in the GTM UI with the Lytics snippet, trigger on All Pages, and publish. This is already done if the GTM container has the "Lytics CDP - Initialize" tag.

3. **Configure streams and LQL** — Custom streams require corresponding LQL statements in the Lytics app to map raw fields to user profile fields. This is done in the Lytics UI under Data > Streams.

4. **Set up audiences** — Create audiences in the Lytics app that will be available via `getSegments()` and the `entityReady` callback. Enable API access for audiences you want surfaced client-side.

5. **Surface profile fields** — In Lytics Account Settings, configure which user attributes are returned by the `/personalize` endpoint (and thus available in `entityReady` callbacks).

6. **Configure content collections** — For `jstag.recommend()`, set up content collections in the Lytics app that define which content is eligible for recommendations.

---

## Troubleshooting

### Tag Not Loading
- Verify `jstag` is defined in the console
- Check that the `src` URL is correct and accessible
- If using GTM, verify the tag is firing (use GTM Preview mode)

### Data Not Being Sent
- Check Network tab for requests to `lytics.io/c`
- Test with `jstag.send({ event: "test" })` in the console
- Verify the stream exists in the Lytics app

### Profile Not Loading
- Check Network tab for `/personalize` requests
- Verify audiences are enabled for API access
- Use `jstag.getEntity()` to inspect current profile data

### Numbers Not Matching Other Tools
- Lytics merges profiles across devices — counts may be lower than cookie-based tools
- Compare same time period, property, and filters
- Account for employee traffic and bots

## Reference

- [Lytics JS Tag Documentation](https://docs.lytics.com/docs/lytics-javascript-tag)
- [Data Upload API](https://docs.lytics.com/reference/dataupload)
- [Personalization API](https://docs.lytics.com/reference/personalization)
- [Lytics App Installation](https://app.lytics.com/connect?view=v3)
