#!/usr/bin/env npx tsx
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GoogleAuth } from "google-auth-library";
import { z } from "zod";

const API = "https://tagmanager.googleapis.com/tagmanager/v2";

// Auth
const auth = new GoogleAuth({
  keyFile: process.env.GTM_SERVICE_ACCOUNT_KEY,
  scopes: [
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    "https://www.googleapis.com/auth/tagmanager.publish",
    "https://www.googleapis.com/auth/tagmanager.readonly",
  ],
});

async function gtmFetch(path: string, options?: RequestInit) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`GTM API ${res.status}: ${JSON.stringify(json.error?.message || json)}`);
  }
  return json;
}

// Server
const server = new McpServer({
  name: "gtm",
  version: "1.0.0",
});

// --- Discovery tools ---

server.tool("gtm_list_accounts", "List all GTM accounts", {}, async () => {
  const data = await gtmFetch("/accounts");
  return { content: [{ type: "text", text: JSON.stringify(data.account || [], null, 2) }] };
});

server.tool(
  "gtm_list_containers",
  "List containers in a GTM account",
  { accountId: z.string().describe("GTM account ID") },
  async ({ accountId }) => {
    const data = await gtmFetch(`/accounts/${accountId}/containers`);
    return { content: [{ type: "text", text: JSON.stringify(data.container || [], null, 2) }] };
  }
);

server.tool(
  "gtm_list_workspaces",
  "List workspaces in a container",
  {
    accountId: z.string(),
    containerId: z.string(),
  },
  async ({ accountId, containerId }) => {
    const data = await gtmFetch(`/accounts/${accountId}/containers/${containerId}/workspaces`);
    return { content: [{ type: "text", text: JSON.stringify(data.workspace || [], null, 2) }] };
  }
);

// --- Tags ---

server.tool(
  "gtm_list_tags",
  "List all tags in a workspace",
  {
    workspacePath: z.string().describe("Workspace path, e.g. accounts/123/containers/456/workspaces/3"),
  },
  async ({ workspacePath }) => {
    const data = await gtmFetch(`/${workspacePath}/tags`);
    return { content: [{ type: "text", text: JSON.stringify(data.tag || [], null, 2) }] };
  }
);

server.tool(
  "gtm_create_tag",
  "Create a tag in a workspace. The body is the full GTM tag JSON (name, type, parameter, firingTriggerId, setupTag, tagFiringOption, etc.)",
  {
    workspacePath: z.string().describe("Workspace path"),
    tag: z.string().describe("JSON string of the tag object"),
  },
  async ({ workspacePath, tag }) => {
    const data = await gtmFetch(`/${workspacePath}/tags`, {
      method: "POST",
      body: tag,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "gtm_update_tag",
  "Update an existing tag",
  {
    tagPath: z.string().describe("Tag path, e.g. accounts/123/containers/456/workspaces/3/tags/789"),
    tag: z.string().describe("JSON string of the updated tag object"),
  },
  async ({ tagPath, tag }) => {
    const data = await gtmFetch(`/${tagPath}`, {
      method: "PUT",
      body: tag,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "gtm_delete_tag",
  "Delete a tag",
  {
    tagPath: z.string().describe("Tag path"),
  },
  async ({ tagPath }) => {
    await gtmFetch(`/${tagPath}`, { method: "DELETE" });
    return { content: [{ type: "text", text: "Tag deleted" }] };
  }
);

// --- Triggers ---

server.tool(
  "gtm_list_triggers",
  "List all triggers in a workspace",
  {
    workspacePath: z.string().describe("Workspace path"),
  },
  async ({ workspacePath }) => {
    const data = await gtmFetch(`/${workspacePath}/triggers`);
    return { content: [{ type: "text", text: JSON.stringify(data.trigger || [], null, 2) }] };
  }
);

server.tool(
  "gtm_create_trigger",
  "Create a trigger in a workspace. The body is the full GTM trigger JSON (name, type, filter, customEventFilter, etc.)",
  {
    workspacePath: z.string().describe("Workspace path"),
    trigger: z.string().describe("JSON string of the trigger object"),
  },
  async ({ workspacePath, trigger }) => {
    const data = await gtmFetch(`/${workspacePath}/triggers`, {
      method: "POST",
      body: trigger,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "gtm_delete_trigger",
  "Delete a trigger",
  {
    triggerPath: z.string().describe("Trigger path"),
  },
  async ({ triggerPath }) => {
    await gtmFetch(`/${triggerPath}`, { method: "DELETE" });
    return { content: [{ type: "text", text: "Trigger deleted" }] };
  }
);

// --- Variables ---

server.tool(
  "gtm_list_variables",
  "List all variables in a workspace",
  {
    workspacePath: z.string().describe("Workspace path"),
  },
  async ({ workspacePath }) => {
    const data = await gtmFetch(`/${workspacePath}/variables`);
    return { content: [{ type: "text", text: JSON.stringify(data.variable || [], null, 2) }] };
  }
);

server.tool(
  "gtm_create_variable",
  "Create a variable in a workspace",
  {
    workspacePath: z.string().describe("Workspace path"),
    variable: z.string().describe("JSON string of the variable object"),
  },
  async ({ workspacePath, variable }) => {
    const data = await gtmFetch(`/${workspacePath}/variables`, {
      method: "POST",
      body: variable,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Publishing ---

server.tool(
  "gtm_create_version",
  "Create a version from a workspace (snapshot for publishing)",
  {
    workspacePath: z.string().describe("Workspace path"),
    name: z.string().describe("Version name"),
    notes: z.string().optional().describe("Version notes"),
  },
  async ({ workspacePath, name, notes }) => {
    const data = await gtmFetch(`/${workspacePath}:create_version`, {
      method: "POST",
      body: JSON.stringify({ name, notes: notes || "" }),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "gtm_publish_version",
  "Publish a container version to make it live",
  {
    versionPath: z.string().describe("Version path, e.g. accounts/123/containers/456/versions/7"),
  },
  async ({ versionPath }) => {
    const data = await gtmFetch(`/${versionPath}:publish`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// Start
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main();
