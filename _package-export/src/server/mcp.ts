/**
 * MCP server for Agentation.
 * Exposes tools for AI agents to interact with annotations.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  getPendingAnnotations,
  getAnnotation,
  updateAnnotationStatus,
  addThreadMessage,
  getSessionWithAnnotations,
  listSessions,
} from "./store.js";

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
      const sessions = listSessions();
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
      const session = getSessionWithAnnotations(sessionId);
      if (!session) {
        return error(`Session not found: ${sessionId}`);
      }
      return success(session);
    }

    case "agentation_get_pending": {
      const { sessionId } = GetPendingSchema.parse(args);
      const pending = getPendingAnnotations(sessionId);
      return success({
        count: pending.length,
        annotations: pending.map((a) => ({
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
      const annotation = updateAnnotationStatus(annotationId, "acknowledged");
      if (!annotation) {
        return error(`Annotation not found: ${annotationId}`);
      }
      return success({ acknowledged: true, annotationId });
    }

    case "agentation_resolve": {
      const { annotationId, summary } = ResolveSchema.parse(args);
      const annotation = updateAnnotationStatus(annotationId, "resolved", "agent");
      if (!annotation) {
        return error(`Annotation not found: ${annotationId}`);
      }
      if (summary) {
        addThreadMessage(annotationId, "agent", `Resolved: ${summary}`);
      }
      return success({ resolved: true, annotationId, summary });
    }

    case "agentation_dismiss": {
      const { annotationId, reason } = DismissSchema.parse(args);
      const annotation = updateAnnotationStatus(annotationId, "dismissed", "agent");
      if (!annotation) {
        return error(`Annotation not found: ${annotationId}`);
      }
      addThreadMessage(annotationId, "agent", `Dismissed: ${reason}`);
      return success({ dismissed: true, annotationId, reason });
    }

    case "agentation_reply": {
      const { annotationId, message } = ReplySchema.parse(args);
      const annotation = getAnnotation(annotationId);
      if (!annotation) {
        return error(`Annotation not found: ${annotationId}`);
      }
      addThreadMessage(annotationId, "agent", message);
      return success({ replied: true, annotationId, message });
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
 */
export async function startMcpServer(): Promise<void> {
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

  console.error("[MCP] Agentation MCP server started on stdio");
}
