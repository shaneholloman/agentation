/**
 * MCP server for Agentation.
 * Exposes tools for AI agents to interact with annotations.
 *
 * This server fetches data from the HTTP API (single source of truth)
 * rather than maintaining its own store.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

let httpBaseUrl = "http://localhost:4747";

/**
 * Set the HTTP server URL that this MCP server will fetch from.
 */
export function setHttpBaseUrl(url: string): void {
  httpBaseUrl = url;
}

// -----------------------------------------------------------------------------
// HTTP Client
// -----------------------------------------------------------------------------

async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${httpBaseUrl}${path}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function httpPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${httpBaseUrl}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${httpBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// -----------------------------------------------------------------------------
// Tool Schemas
// -----------------------------------------------------------------------------

const GetPendingSchema = z.object({
  sessionId: z.string().describe("The session ID to get pending annotations for"),
});

const AcknowledgeSchema = z.object({
  annotationId: z.string().describe("The annotation ID to acknowledge"),
});

const ResolveSchema = z.object({
  annotationId: z.string().describe("The annotation ID to resolve"),
  summary: z.string().optional().describe("Optional summary of how it was resolved"),
});

const DismissSchema = z.object({
  annotationId: z.string().describe("The annotation ID to dismiss"),
  reason: z.string().describe("Reason for dismissing this annotation"),
});

const ReplySchema = z.object({
  annotationId: z.string().describe("The annotation ID to reply to"),
  message: z.string().describe("The reply message"),
});

const GetSessionSchema = z.object({
  sessionId: z.string().describe("The session ID to get"),
});

// -----------------------------------------------------------------------------
// Tool Definitions
// -----------------------------------------------------------------------------

const TOOLS = [
  {
    name: "agentation_list_sessions",
    description: "List all active annotation sessions",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "agentation_get_session",
    description: "Get a session with all its annotations",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: {
          type: "string",
          description: "The session ID to get",
        },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "agentation_get_pending",
    description:
      "Get all pending (unacknowledged) annotations for a session. Use this to see what feedback the human has given that needs attention.",
    inputSchema: {
      type: "object" as const,
      properties: {
        sessionId: {
          type: "string",
          description: "The session ID to get pending annotations for",
        },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "agentation_acknowledge",
    description:
      "Mark an annotation as acknowledged. Use this to let the human know you've seen their feedback and will address it.",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: {
          type: "string",
          description: "The annotation ID to acknowledge",
        },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "agentation_resolve",
    description:
      "Mark an annotation as resolved. Use this after you've addressed the feedback. Optionally include a summary of what you did.",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: {
          type: "string",
          description: "The annotation ID to resolve",
        },
        summary: {
          type: "string",
          description: "Optional summary of how it was resolved",
        },
      },
      required: ["annotationId"],
    },
  },
  {
    name: "agentation_dismiss",
    description:
      "Dismiss an annotation. Use this when you've decided not to address the feedback, with a reason why.",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: {
          type: "string",
          description: "The annotation ID to dismiss",
        },
        reason: {
          type: "string",
          description: "Reason for dismissing this annotation",
        },
      },
      required: ["annotationId", "reason"],
    },
  },
  {
    name: "agentation_reply",
    description:
      "Add a reply to an annotation's thread. Use this to ask clarifying questions or provide updates to the human.",
    inputSchema: {
      type: "object" as const,
      properties: {
        annotationId: {
          type: "string",
          description: "The annotation ID to reply to",
        },
        message: {
          type: "string",
          description: "The reply message",
        },
      },
      required: ["annotationId", "message"],
    },
  },
];

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Session = {
  id: string;
  url: string;
  status: string;
  createdAt: string;
};

type Annotation = {
  id: string;
  sessionId: string;
  comment: string;
  element: string;
  elementPath: string;
  url?: string;
  intent?: string;
  severity?: string;
  timestamp?: number;
  nearbyText?: string;
  reactComponents?: string;
  status: string;
};

type SessionWithAnnotations = Session & {
  annotations: Annotation[];
};

type PendingResponse = {
  count: number;
  annotations: Annotation[];
};

// -----------------------------------------------------------------------------
// Tool Handlers
// -----------------------------------------------------------------------------

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function success(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function error(message: string): ToolResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

async function handleTool(name: string, args: unknown): Promise<ToolResult> {
  switch (name) {
    case "agentation_list_sessions": {
      const sessions = await httpGet<Session[]>("/sessions");
      return success({
        sessions: sessions.map((s) => ({
          id: s.id,
          url: s.url,
          status: s.status,
          createdAt: s.createdAt,
        })),
      });
    }

    case "agentation_get_session": {
      const { sessionId } = GetSessionSchema.parse(args);
      try {
        const session = await httpGet<SessionWithAnnotations>(`/sessions/${sessionId}`);
        return success(session);
      } catch (err) {
        if ((err as Error).message.includes("404")) {
          return error(`Session not found: ${sessionId}`);
        }
        throw err;
      }
    }

    case "agentation_get_pending": {
      const { sessionId } = GetPendingSchema.parse(args);
      const response = await httpGet<PendingResponse>(`/sessions/${sessionId}/pending`);
      return success({
        count: response.count,
        annotations: response.annotations.map((a) => ({
          id: a.id,
          comment: a.comment,
          element: a.element,
          elementPath: a.elementPath,
          url: a.url,
          intent: a.intent,
          severity: a.severity,
          timestamp: a.timestamp,
          nearbyText: a.nearbyText,
          reactComponents: a.reactComponents,
        })),
      });
    }

    case "agentation_acknowledge": {
      const { annotationId } = AcknowledgeSchema.parse(args);
      try {
        await httpPatch(`/annotations/${annotationId}`, { status: "acknowledged" });
        return success({ acknowledged: true, annotationId });
      } catch (err) {
        if ((err as Error).message.includes("404")) {
          return error(`Annotation not found: ${annotationId}`);
        }
        throw err;
      }
    }

    case "agentation_resolve": {
      const { annotationId, summary } = ResolveSchema.parse(args);
      try {
        await httpPatch(`/annotations/${annotationId}`, {
          status: "resolved",
          resolvedBy: "agent",
        });
        if (summary) {
          await httpPost(`/annotations/${annotationId}/thread`, {
            role: "agent",
            content: `Resolved: ${summary}`,
          });
        }
        return success({ resolved: true, annotationId, summary });
      } catch (err) {
        if ((err as Error).message.includes("404")) {
          return error(`Annotation not found: ${annotationId}`);
        }
        throw err;
      }
    }

    case "agentation_dismiss": {
      const { annotationId, reason } = DismissSchema.parse(args);
      try {
        await httpPatch(`/annotations/${annotationId}`, {
          status: "dismissed",
          resolvedBy: "agent",
        });
        await httpPost(`/annotations/${annotationId}/thread`, {
          role: "agent",
          content: `Dismissed: ${reason}`,
        });
        return success({ dismissed: true, annotationId, reason });
      } catch (err) {
        if ((err as Error).message.includes("404")) {
          return error(`Annotation not found: ${annotationId}`);
        }
        throw err;
      }
    }

    case "agentation_reply": {
      const { annotationId, message } = ReplySchema.parse(args);
      try {
        await httpPost(`/annotations/${annotationId}/thread`, {
          role: "agent",
          content: message,
        });
        return success({ replied: true, annotationId, message });
      } catch (err) {
        if ((err as Error).message.includes("404")) {
          return error(`Annotation not found: ${annotationId}`);
        }
        throw err;
      }
    }

    default:
      return error(`Unknown tool: ${name}`);
  }
}

// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------

/**
 * Create and start the MCP server on stdio.
 * @param baseUrl - Optional HTTP server URL to fetch from (default: http://localhost:4747)
 */
export async function startMcpServer(baseUrl?: string): Promise<void> {
  if (baseUrl) {
    setHttpBaseUrl(baseUrl);
  }

  const server = new Server(
    {
      name: "agentation",
      version: "0.0.1",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      return await handleTool(name, args);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return error(message);
    }
  });

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`[MCP] Agentation MCP server started on stdio (HTTP: ${httpBaseUrl})`);
}
