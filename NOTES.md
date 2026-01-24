# Session Notes - MCP Integration Testing

## IMPORTANT: Read this on restart

### Branch
`feature/combined-release` - this is the LOCAL combined branch with MCP server code built in.

### Goal
Test the full MCP integration flow:
1. User adds annotations via the Agentation toolbar on localhost:3001
2. Annotations POST to HTTP server on localhost:4747
3. Claude Code connects to MCP server (stdio) and can read annotations in real-time
4. This enables the SAF (Structured Annotation Format) open standard we're building

### What was broken before
1. The MCP config was set to `npx agentation server` which tries to run the published npm package
2. MCP configs are project-scoped and don't inherit from parent directories
3. **THE BIG ONE**: When Claude Code spawns the MCP server, it crashed because port 4747 was already in use by the manually-started HTTP server. The server tried to start BOTH HTTP and MCP, causing `EADDRINUSE` error.

### What's fixed now
1. MCP config added to BOTH project paths in `~/.claude.json`:
   - `/Users/benjitaylor/Code/agentation`
   - `/Users/benjitaylor/Code/agentation/_package-export/example`

2. Added `--mcp-only` flag to server code that skips HTTP server startup when running as MCP-only mode.

3. MCP config now uses `--mcp-only` flag:
```json
"agentation": {
  "command": "npx",
  "args": [
    "tsx",
    "/Users/benjitaylor/Code/agentation/_package-export/src/server/index.ts",
    "--mcp-only"
  ]
}
```

### After restart, do this:
1. Start the HTTP server manually (for browser):
   ```bash
   cd /Users/benjitaylor/Code/agentation/_package-export
   npx tsx src/server/index.ts &   # HTTP server on 4747
   cd example && pnpm dev          # Website on 3001
   ```
2. Restart Claude Code from this directory
3. Check that you have `mcp__agentation__*` tools available (7 tools)
4. Open http://localhost:3001
5. Add an annotation
6. Use your MCP tools to read the annotation - THIS is the test

### Available MCP tools
- `agentation_list_sessions` - List all active annotation sessions
- `agentation_get_session` - Get a session with all its annotations
- `agentation_get_pending` - Get unacknowledged annotations for a session
- `agentation_acknowledge` - Mark an annotation as acknowledged
- `agentation_resolve` - Mark an annotation as resolved
- `agentation_dismiss` - Dismiss an annotation with a reason
- `agentation_reply` - Add a reply to an annotation's thread

### Key files
- `_package-export/src/server/index.ts` - Main server entry (HTTP + MCP), supports `--mcp-only`
- `_package-export/src/server/http.ts` - HTTP API for browser
- `_package-export/src/server/mcp.ts` - MCP server for Claude Code
- `_package-export/src/server/store.ts` - In-memory annotation storage
- `_package-export/example/src/app/ToolbarProvider.tsx` - Sets endpoint to localhost:4747

### Port mapping
- localhost:3001 = Agentation website/demo
- localhost:4747 = HTTP server (for browser)
- MCP server runs on stdio (no port), spawned by Claude Code with --mcp-only

### Architecture
```
Browser (localhost:3001)
    |
    | POST /sessions/:id/annotations
    v
HTTP Server (localhost:4747)  ← Single source of truth
    ^
    | fetch() calls
    |
MCP Server (stdio, --mcp-only)
    |
    | MCP protocol
    v
Claude Code (mcp__agentation__* tools)
```

**Key insight**: MCP server doesn't have its own store. It fetches from HTTP.
This means browser annotations are immediately visible to MCP tools.
