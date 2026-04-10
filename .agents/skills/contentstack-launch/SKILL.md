---
name: contentstack-launch
description: >-
  Contentstack Launch API for managing projects, environments, deployments,
  deploy hooks, and CDN cache revalidation. Covers the REST API and MCP tools
  for Git-based and file-upload deployments, environment variable management,
  deployment logs, server logs, and cache purging strategies.
  Use when deploying to Contentstack Launch, managing environments or env vars,
  triggering builds, reading deployment/server logs, invalidating CDN cache,
  or setting up deploy hooks.
license: MIT
metadata:
  author: contentstack
  version: "1.0"
  source: https://www.contentstack.com/docs/developers/apis/launch-api
  last_updated: "2026-04-08"
---

# Contentstack Launch — Projects, Deployments & CDN

## Auth

| Method | Headers |
|---|---|
| **OAuth (recommended)** | `Authorization: Bearer <token>` |
| **Authtoken** | `authtoken: <token>` + `organization_uid: <org_uid>` |

OAuth scopes: `launch:manage` (full access), `launch.projects:read`, `launch.projects:write`, `launch.projects:delete`.

**Base URL:** `https://launch-api.contentstack.com` (AWS NA). Regional variants: `eu-`, `au-`, `azure-na-`, `azure-eu-`, `gcp-na-`, `gcp-eu-` prefixes.

Rate limit: 10 requests/second/organization.

---

## MCP Tools Available

The Contentstack MCP (`launch` group) covers most Launch operations:

| Action | MCP Tool |
|---|---|
| List/get/create/update/delete projects | `get_all_projects`, `create_a_project`, etc. |
| List/get/create/update/delete environments | `get_all_environments`, `create_an_environment`, etc. |
| Create deployment, get latest live | `create_deployment`, `get_latest_live_deployment` |
| Deployment & server logs | `get_deployment_logs`, `get_server_logs` |
| CDN cache revalidation | `revalidate_cdn_cache` |
| Deploy hooks (CRUD + trigger) | `get_deploy_hooks`, `create_deploy_hook`, `trigger_deploy_hook` |
| File upload signed URLs | `get_signed_upload_url_project`, `_environment`, `_deployment` |

Use MCP tools when possible. Fall back to REST API for batch operations or when MCP tools don't expose a needed parameter.

---

## Quick Reference

### Create a Git-Based Project

```
POST /projects

{
  "name": "<project_name>",
  "projectType": "GITPROVIDER",
  "environment": {
    "name": "production",
    "frameworkPreset": "NEXTJS",
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "gitBranch": "main",
    "autoDeployOnPush": true,
    "environmentVariables": [
      { "key": "CONTENTSTACK_API_KEY", "value": "<value>" }
    ]
  },
  "repository": {
    "repositoryName": "<repo_name>",
    "username": "<github_username>",
    "repositoryUrl": "<repo_url>",
    "gitProviderMetadata": {
      "gitProvider": "GitHub"
    }
  }
}
```

Git providers: `"GitHub"`, `"ExternalGitProvider"`.

### Create a File Upload Project

```
1. GET  /projects/upload/signed_url          → uploadUrl, uploadUid
2. POST uploadUrl  (upload ZIP with form fields from response)
3. POST /projects  with projectType: "FILEUPLOAD", fileUpload: { uploadUid }
```

The signed URL expires in 10 minutes.

### Trigger a Deployment

```
POST /projects/{project_uid}/environments/{environment_uid}/deployments

# Git-based: specify commit
{ "commitHash": "<sha>" }

# File upload: use previously uploaded file
{}

# File upload: new file
{ "uploadUid": "<upload_uid>" }
```

With `autoDeployOnPush: true`, Git pushes trigger deployments automatically.

---

## Environment Variables

Set env vars when creating or updating an environment:

```
PUT /projects/{project_uid}/environments/{environment_uid}

{
  "environmentVariables": [
    { "key": "CONTENTSTACK_API_KEY", "value": "<value>" },
    { "key": "NEXT_PUBLIC_SITE_URL", "value": "https://example.com" }
  ]
}
```

**`NEXT_PUBLIC_` vars require a full rebuild** — they're inlined at build time. Changing them via API and redeploying is not enough; a new build must run.

---

## CDN Cache Revalidation

Three strategies — use one per request:

```
POST /projects/{project_uid}/environments/{environment_uid}/revalidate-cdn-cache
```

**By path (exact or prefix):**
```json
{
  "cachePath": {
    "path": "/blog",
    "isPrefix": true
  }
}
```
`isPrefix: true` purges `/blog` and all nested routes (`/blog/post-1`, etc.).

**By cache tags:**
```json
{ "cacheTags": ["blog", "homepage"] }
```

**By hostname:**
```json
{ "hostnames": ["www.example.com"] }
```

Check usage limits:
```
GET /usage-analytics/revalidate-cdn-cache
→ { currentCacheRevalidations, maxCacheRevalidations, usageReset }
```

---

## Deploy Hooks

Deploy hooks trigger deployments via webhook URL (no auth needed). Useful for CMS publish webhooks.

| Action | MCP Tool |
|---|---|
| List hooks | `get_deploy_hooks` |
| Create hook | `create_deploy_hook` |
| Update hook | `update_deploy_hook` |
| Delete hook | `delete_deploy_hook` |
| Trigger hook | `trigger_deploy_hook` |

Common pattern: create a deploy hook in Launch, then configure a Contentstack webhook to call it on entry publish.

---

## Deployment & Server Logs

### Build Logs

```
GET /projects/{p}/environments/{e}/deployments/{d}/logs/deployment-logs
```

Optional `timestamp` query param (ISO 8601) to fetch logs from a specific point. Log entries include `stage` field: `INSTALLING_DEPENDENCIES`, `BUILD`, etc.

### Server Logs (Runtime)

```
GET /projects/{p}/environments/{e}/deployments/{d}/logs/server-logs?startTime={ms}&endTime={ms}
```

Both `startTime` and `endTime` are required (milliseconds since epoch). Returns runtime logs from the deployed application.

---

## Framework Presets

| Preset | Build Command | Output Directory |
|---|---|---|
| `NEXTJS` | `npm run build` | `.next` |
| `GATSBY` | `npm run build` | `public` |
| `NUXTJS` | `npm run build` | `.output` |
| `ANGULAR` | `npm run build` | `dist/<project>` |
| `REACT` | `npm run build` | `build` |
| `VUE` | `npm run build` | `dist` |
| `HTML` | — | `.` |

⚠️ Preset list may vary — check Launch UI for the current set.

---

## Order of Operations

```
1. Create project (with initial environment)  POST /projects
2. Add env vars to environment                PUT  /projects/{p}/environments/{e}
3. Trigger deployment                         POST /projects/{p}/environments/{e}/deployments
4. Monitor build logs                         GET  .../deployment-logs
5. Set up deploy hook (optional)              MCP: create_deploy_hook
6. Configure CMS webhook to trigger hook      Contentstack UI
```

For additional environments (staging, preview):
```
1. Create environment                         POST /projects/{p}/environments
2. Set env vars + branch                      (included in create payload)
3. First deployment triggers automatically
```

---

## Gotchas

### Password protection
Environments support password protection via `passwordProtection: { isEnabled: true, username, password }` on update. Useful for staging/preview environments.

### Lytics integration toggle
`hasLyticsEnabled: boolean` on environment update controls whether the Lytics tag is automatically injected. Only available if Lytics is connected to the stack.

### Cache priming
`isCachePrimingEnabled: boolean` — when enabled, Launch pre-warms the CDN cache after deployment. Can increase deployment duration.

### Environment name conflicts
Creating an environment with a name that already exists returns `409 Conflict`. Environment names must be unique within a project.

### Git provider auth
Git-based project creation with `GITPROVIDER` requires a connected Git account in Launch. This connection is established in the Launch UI and cannot be automated via API.

### File upload flow
The signed URL response includes `fields` (form fields) and `headers` that must be included in the upload request. The `method` field tells you whether to use POST or PUT. Missing these causes silent upload failures.

---

## Reference

- [Launch API Documentation](https://www.contentstack.com/docs/developers/apis/launch-api)
- [OpenAPI Spec](https://launch-api.contentstack.com/openapi) (download JSON, open in Swagger)
- [Launch Guides](https://www.contentstack.com/docs/developers/launch)
