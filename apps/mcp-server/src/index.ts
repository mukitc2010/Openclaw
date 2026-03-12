import "dotenv/config";

import { createServer } from "./server.js";

async function main() {
  await createServer();
}

main().catch((error) => {
  // Keep stderr output simple for MCP client compatibility.
  console.error("OpenClaw MCP server failed to start", error);
  process.exit(1);
});
