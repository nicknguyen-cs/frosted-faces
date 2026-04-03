---
name: contentstack-mcp
description: >-
  Guide for setting up, authenticating, and configuring the Contentstack MCP
  Server. Covers prerequisites, authentication via OAuth, configuration for
  Claude Desktop, Cursor, and Claude Code (.mcp.json), environment variables,
  GROUPS filtering, and available API tool groups (CMA, CDA, Analytics, Brand
  Kit, Launch, Lytics, Personalize, Developer Hub). Use when configuring or
  troubleshooting the Contentstack MCP Server connection.
license: MIT
metadata:
  author: contentstack
  version: "1.0"
  source: https://www.contentstack.com/docs/developers/automation-hub-guides/contentstack-mcp-server
  last_updated: "2026-03-25"
---

# Contentstack MCP Server Setup & Configuration

This skill documents how to authenticate, configure, and use the Contentstack MCP Server with MCP-compatible clients (Claude Desktop, Cursor, Claude Code).

## What is the Contentstack MCP Server?

The Contentstack MCP Server bridges Contentstack's APIs and AI systems using the Model Context Protocol (MCP). It enables natural language-based content operations.

**Package:** `@contentstack/mcp` ([npm](https://www.npmjs.com/package/@contentstack/mcp))

## Key Capabilities

| Capability | Description |
|---|---|
| Content Operations (CMA) | Create, update, delete, publish, unpublish, retrieve content |
| Content Delivery (CDA) | Fetch published content via Delivery API |
| Analytics API | API usage, CDN usage, device stats, URL tracking, status codes, cache performance, SDK usage |
| Lytics (Data & Insights) | Content classification, audience management, engagement insights |
| Brand Kit | AI-generated brand-consistent content via voice profiles |
| Launch | Deployment management, environment config, deploy hooks, CDN cache revalidation |
| Personalize | Audience segmentation, A/B testing, experience management, engagement analytics |
| Developer Hub | Marketplace app lifecycle: create, update, delete, retrieve apps, manage installations |

## Prerequisites

- A [Contentstack account](https://www.contentstack.com/login)
- Node.js with `npx` available
- An MCP-compatible client (Claude Desktop, Cursor, or Claude Code)

## Step 1: Authenticate

Run this command in your terminal:

```bash
npx @contentstack/mcp --auth -y
```

Follow the interactive prompts:
1. Select **Authorization** action
2. Select **Login**
3. Select your **Contentstack region** (e.g., North America / NA)
4. A browser window opens — authenticate with your Contentstack account and select your Organization
5. You should see a success message in the terminal

**Note:** OAuth authentication is required for CMA, Analytics, Brand Kit, Launch, and Personalize tools.

## Step 2: Configure Your Client

### Claude Code (.mcp.json)

For Claude Code projects, add to your `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "contentstack": {
      "command": "npx",
      "args": ["-y", "@contentstack/mcp"],
      "env": {
        "CONTENTSTACK_API_KEY": "",
        "CONTENTSTACK_DELIVERY_TOKEN": "",
        "CONTENTSTACK_BRAND_KIT_ID": "",
        "CONTENTSTACK_LAUNCH_PROJECT_ID": "",
        "CONTENTSTACK_PERSONALIZE_PROJECT_ID": "",
        "LYTICS_ACCESS_TOKEN": "",
        "GROUPS": ""
      }
    }
  }
}
```

### Claude Desktop

Edit your `claude_desktop_config.json` (Settings > Developer > Edit Config):

```json
{
  "mcpServers": {
    "contentstack": {
      "command": "npx",
      "args": ["-y", "@contentstack/mcp"],
      "env": {
        "CONTENTSTACK_API_KEY": "",
        "CONTENTSTACK_DELIVERY_TOKEN": "",
        "CONTENTSTACK_BRAND_KIT_ID": "",
        "CONTENTSTACK_LAUNCH_PROJECT_ID": "",
        "CONTENTSTACK_PERSONALIZE_PROJECT_ID": "",
        "LYTICS_ACCESS_TOKEN": "",
        "GROUPS": ""
      }
    }
  }
}
```

### Cursor

Settings > MCP > Add Custom MCP, then paste the same JSON structure as above.

## Environment Variables Reference

| Variable | Required For | Notes |
|---|---|---|
| `CONTENTSTACK_API_KEY` | All tools except Lytics | Your stack's API key |
| `CONTENTSTACK_DELIVERY_TOKEN` | CDA tools only | Delivery token for the target environment |
| `CONTENTSTACK_BRAND_KIT_ID` | Brand Kit tools | Found in Brand Kit settings |
| `CONTENTSTACK_LAUNCH_PROJECT_ID` | Launch tools | Found in Launch project settings |
| `CONTENTSTACK_PERSONALIZE_PROJECT_ID` | Personalize tools | Found in Personalize project settings |
| `LYTICS_ACCESS_TOKEN` | Lytics tools | Access token from Lytics/Data & Insights |
| `GROUPS` | Optional | Comma-separated list of API groups to enable |

**Where to find these values:**
- Stack API Key: Stack Settings > API Credentials
- Delivery Token: Settings > Tokens > Delivery Tokens
- Brand Kit ID: Brand Kit settings page
- Launch Project ID: Launch project settings
- Personalize Project ID: Personalize project settings

## GROUPS Configuration

The `GROUPS` variable controls which API tool groups the MCP server exposes.

| Setting | Behavior |
|---|---|
| Not set / empty | Defaults to **CMA tools only** |
| `"all"` | Enables all available tools (~126 tools) |
| `"cma,cda,launch"` | Enables only the specified groups (comma-separated, no spaces) |

### Available Groups

| Group | Auth Method | Required Variables |
|---|---|---|
| `cma` | OAuth | `CONTENTSTACK_API_KEY` |
| `cda` | Token | `CONTENTSTACK_API_KEY`, `CONTENTSTACK_DELIVERY_TOKEN` |
| `analytics` | OAuth | `CONTENTSTACK_API_KEY` |
| `brandkit` | OAuth | `CONTENTSTACK_API_KEY`, `CONTENTSTACK_BRAND_KIT_ID` |
| `launch` | OAuth | `CONTENTSTACK_API_KEY`, `CONTENTSTACK_LAUNCH_PROJECT_ID` |
| `lytics` | Token | `LYTICS_ACCESS_TOKEN` |
| `personalize` | OAuth | `CONTENTSTACK_API_KEY`, `CONTENTSTACK_PERSONALIZE_PROJECT_ID` |
| `developerhub` | OAuth | `CONTENTSTACK_API_KEY` |

### Examples

```json
// CMA only (default)
"GROUPS": ""

// Content management + delivery
"GROUPS": "cma,cda"

// Everything
"GROUPS": "all"

// Content + analytics + personalization
"GROUPS": "cma,cda,analytics,personalize"
```

## Troubleshooting

### Server not starting
- Verify `npx` is available: `npx --version`
- Re-authenticate: `npx @contentstack/mcp --auth -y`
- Check that environment variables are set correctly in your config file

### Tools not appearing
- Check the `GROUPS` variable — if unset, only CMA tools are exposed
- Ensure required environment variables for the group are provided
- Restart your MCP client after config changes

### Authentication errors
- Re-run `npx @contentstack/mcp --auth -y` and complete the browser flow
- Verify you selected the correct Contentstack region
- OAuth tokens may expire — re-authenticate if you get 401 errors

### Wrong region
- Re-authenticate and select the correct region during the login flow
- The region must match where your stack is hosted

## Licensing

The Contentstack MCP Server is open-source under the MIT License.
