/**
 * HTTP server for the Agentation API.
 * Uses native Node.js http module - no frameworks.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "http";
import {
  createSession,
  getSessionWithAnnotations,
  addAnnotation,
  updateAnnotation,
  getAnnotation,
  listSessions,
} from "./store.js";
import type { Annotation } from "../types.js";

// -----------------------------------------------------------------------------
// Request Helpers
// -----------------------------------------------------------------------------

/**
 * Parse JSON body from request.
 */
async function parseBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Send JSON response.
 */
function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

/**
 * Send error response.
 */
function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, status, { error: message });
}

/**
 * Handle CORS preflight.
 */
function handleCors(res: ServerResponse): void {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  });
  res.end();
}

// -----------------------------------------------------------------------------
// Route Handlers
// -----------------------------------------------------------------------------

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: Record<string, string>
) => Promise<void>;

/**
 * POST /sessions - Create a new session.
 */
const createSessionHandler: RouteHandler = async (req, res) => {
  try {
    const body = await parseBody<{ url: string; projectId?: string }>(req);

    if (!body.url) {
      return sendError(res, 400, "url is required");
    }

    const session = createSession(body.url, body.projectId);
    sendJson(res, 201, session);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
};

/**
 * GET /sessions - List all sessions.
 */
const listSessionsHandler: RouteHandler = async (_req, res) => {
  const sessions = listSessions();
  sendJson(res, 200, sessions);
};

/**
 * GET /sessions/:id - Get a session with annotations.
 */
const getSessionHandler: RouteHandler = async (_req, res, params) => {
  const session = getSessionWithAnnotations(params.id);

  if (!session) {
    return sendError(res, 404, "Session not found");
  }

  sendJson(res, 200, session);
};

/**
 * POST /sessions/:id/annotations - Add annotation to session.
 */
const addAnnotationHandler: RouteHandler = async (req, res, params) => {
  try {
    const body = await parseBody<Omit<Annotation, "id" | "sessionId" | "status" | "createdAt">>(req);

    if (!body.comment || !body.element || !body.elementPath) {
      return sendError(res, 400, "comment, element, and elementPath are required");
    }

    const annotation = addAnnotation(params.id, body);

    if (!annotation) {
      return sendError(res, 404, "Session not found");
    }

    sendJson(res, 201, annotation);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
};

/**
 * PATCH /annotations/:id - Update an annotation.
 */
const updateAnnotationHandler: RouteHandler = async (req, res, params) => {
  try {
    const body = await parseBody<Partial<Annotation>>(req);

    // Check if annotation exists
    const existing = getAnnotation(params.id);
    if (!existing) {
      return sendError(res, 404, "Annotation not found");
    }

    const annotation = updateAnnotation(params.id, body);
    sendJson(res, 200, annotation);
  } catch (err) {
    sendError(res, 400, (err as Error).message);
  }
};

/**
 * GET /annotations/:id - Get an annotation.
 */
const getAnnotationHandler: RouteHandler = async (_req, res, params) => {
  const annotation = getAnnotation(params.id);

  if (!annotation) {
    return sendError(res, 404, "Annotation not found");
  }

  sendJson(res, 200, annotation);
};

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

type Route = {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
  paramNames: string[];
};

const routes: Route[] = [
  {
    method: "GET",
    pattern: /^\/sessions$/,
    handler: listSessionsHandler,
    paramNames: [],
  },
  {
    method: "POST",
    pattern: /^\/sessions$/,
    handler: createSessionHandler,
    paramNames: [],
  },
  {
    method: "GET",
    pattern: /^\/sessions\/([^/]+)$/,
    handler: getSessionHandler,
    paramNames: ["id"],
  },
  {
    method: "POST",
    pattern: /^\/sessions\/([^/]+)\/annotations$/,
    handler: addAnnotationHandler,
    paramNames: ["id"],
  },
  {
    method: "PATCH",
    pattern: /^\/annotations\/([^/]+)$/,
    handler: updateAnnotationHandler,
    paramNames: ["id"],
  },
  {
    method: "GET",
    pattern: /^\/annotations\/([^/]+)$/,
    handler: getAnnotationHandler,
    paramNames: ["id"],
  },
];

/**
 * Match a request to a route.
 */
function matchRoute(
  method: string,
  pathname: string
): { handler: RouteHandler; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;

    const match = pathname.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { handler: route.handler, params };
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------

/**
 * Create and start the HTTP server.
 */
export function startHttpServer(port: number): void {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const pathname = url.pathname;
    const method = req.method || "GET";

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return handleCors(res);
    }

    // Health check
    if (pathname === "/health" && method === "GET") {
      return sendJson(res, 200, { status: "ok" });
    }

    // Match route
    const match = matchRoute(method, pathname);
    if (!match) {
      return sendError(res, 404, "Not found");
    }

    try {
      await match.handler(req, res, match.params);
    } catch (err) {
      console.error("Request error:", err);
      sendError(res, 500, "Internal server error");
    }
  });

  server.listen(port, () => {
    console.log(`[HTTP] Agentation server listening on http://localhost:${port}`);
  });
}
