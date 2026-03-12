import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { PROJECT_ANALYSIS_PROMPT, SYSTEM_PROMPT } from "./prompts.js";
import { listResources, readResource } from "./resources.js";
import { executeTool, toolDefinitions } from "./tools.js";

export async function createServer() {
  const server = new Server(
    {
      name: "openclaw-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments ?? {};
    return executeTool(name, args);
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: listResources(),
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const contents = readResource(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: `${SYSTEM_PROMPT}\n\n${PROJECT_ANALYSIS_PROMPT}\n\n${contents}`,
        },
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  return server;
}
