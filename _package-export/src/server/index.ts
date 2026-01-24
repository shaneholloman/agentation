#!/usr/bin/env node
/**
 * Agentation Server
 *
 * Runs both:
 * - HTTP server for the React component to POST annotations
 * - MCP server for Claude Code to read and act on annotations
 *
 * Usage:
 *   npx agentation server [--port 4747]
 *   agentation server [--port 4747]
 */

import { startHttpServer } from "./http.js";
import { startMcpServer } from "./mcp.js";

// Re-export for programmatic use
export { startHttpServer } from "./http.js";
export { startMcpServer } from "./mcp.js";
export * from "./store.js";

// -----------------------------------------------------------------------------
// CLI Argument Parsing
// -----------------------------------------------------------------------------

function parseArgs(): { port: number } {
  const args = process.argv.slice(2);
  let port = 4747;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      const parsed = parseInt(args[i + 1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
        port = parsed;
      }
      i++;
    }
  }

  return { port };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const { port } = parseArgs();

  // Start HTTP server (for browser clients)
  startHttpServer(port);

  // Start MCP server (for Claude Code via stdio)
  await startMcpServer();
}

// Only run if this is the main module (CLI entry point)
// Check if we're being run directly vs imported
const isMainModule = process.argv[1]?.includes("server") ||
                     process.argv[1]?.endsWith("agentation");

if (isMainModule) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
