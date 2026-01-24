/**
 * Agentation CLI
 *
 * Usage:
 *   npx agentation server [--port 4747]
 */

const command = process.argv[2];

if (command === "server") {
  // Dynamic import to avoid loading server code for other commands
  import("./server/index.js").then(({ startHttpServer, startMcpServer }) => {
    const args = process.argv.slice(3);
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

    startHttpServer(port);
    startMcpServer().catch((err) => {
      console.error("MCP server error:", err);
      process.exit(1);
    });
  });
} else if (command === "help" || command === "--help" || command === "-h" || !command) {
  console.log(`
agentation - Visual feedback for AI coding agents

Usage:
  agentation server [--port <port>]  Start the annotation server (default: 4747)
  agentation help                    Show this help message

Server Mode:
  Starts both an HTTP server and MCP server for collecting annotations.

  The HTTP server receives annotations from the React component.
  The MCP server exposes tools for Claude Code to read/act on annotations.

  Configure Claude Code to use this MCP server:

  ~/.claude/claude_code_config.json:
  {
    "mcpServers": {
      "agentation": {
        "command": "npx",
        "args": ["agentation", "server"]
      }
    }
  }

Examples:
  npx agentation server              Start server on default port 4747
  npx agentation server --port 8080  Start server on port 8080
`);
} else {
  console.error(`Unknown command: ${command}`);
  console.error("Run 'agentation help' for usage information.");
  process.exit(1);
}
