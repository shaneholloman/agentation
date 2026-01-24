/**
 * In-memory store for sessions and annotations.
 * Simple Map-based storage for development/local use.
 */

import type {
  Session,
  SessionWithAnnotations,
  Annotation,
  AnnotationStatus,
  ThreadMessage,
} from "../types.js";

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------

const sessions = new Map<string, Session>();
const annotations = new Map<string, Annotation>();

// -----------------------------------------------------------------------------
// Session Functions
// -----------------------------------------------------------------------------

/**
 * Create a new session.
 */
export function createSession(url: string, projectId?: string): Session {
  const id = generateId();
  const session: Session = {
    id,
    url,
    status: "active",
    createdAt: new Date().toISOString(),
    projectId,
  };
  sessions.set(id, session);
  return session;
}

/**
 * Get a session by ID.
 */
export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

/**
 * Get a session with all its annotations.
 */
export function getSessionWithAnnotations(
  id: string
): SessionWithAnnotations | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  const sessionAnnotations = Array.from(annotations.values()).filter(
    (a) => a.sessionId === id
  );

  return {
    ...session,
    annotations: sessionAnnotations,
  };
}

/**
 * Update a session's status.
 */
export function updateSessionStatus(
  id: string,
  status: Session["status"]
): Session | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  session.status = status;
  session.updatedAt = new Date().toISOString();
  return session;
}

/**
 * List all sessions.
 */
export function listSessions(): Session[] {
  return Array.from(sessions.values());
}

// -----------------------------------------------------------------------------
// Annotation Functions
// -----------------------------------------------------------------------------

/**
 * Add an annotation to a session.
 */
export function addAnnotation(
  sessionId: string,
  data: Omit<Annotation, "id" | "sessionId" | "status" | "createdAt">
): Annotation | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const annotation: Annotation = {
    ...data,
    id: generateId(),
    sessionId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  annotations.set(annotation.id, annotation);
  return annotation;
}

/**
 * Get an annotation by ID.
 */
export function getAnnotation(id: string): Annotation | undefined {
  return annotations.get(id);
}

/**
 * Update an annotation's status.
 */
export function updateAnnotationStatus(
  id: string,
  status: AnnotationStatus,
  resolvedBy?: "human" | "agent"
): Annotation | undefined {
  const annotation = annotations.get(id);
  if (!annotation) return undefined;

  annotation.status = status;
  annotation.updatedAt = new Date().toISOString();

  if (status === "resolved" || status === "dismissed") {
    annotation.resolvedAt = new Date().toISOString();
    annotation.resolvedBy = resolvedBy || "agent";
  }

  return annotation;
}

/**
 * Update an annotation with partial data.
 */
export function updateAnnotation(
  id: string,
  data: Partial<Omit<Annotation, "id" | "sessionId" | "createdAt">>
): Annotation | undefined {
  const annotation = annotations.get(id);
  if (!annotation) return undefined;

  Object.assign(annotation, data, { updatedAt: new Date().toISOString() });
  return annotation;
}

/**
 * Add a message to an annotation's thread.
 */
export function addThreadMessage(
  annotationId: string,
  role: "human" | "agent",
  content: string
): Annotation | undefined {
  const annotation = annotations.get(annotationId);
  if (!annotation) return undefined;

  const message: ThreadMessage = {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
  };

  if (!annotation.thread) {
    annotation.thread = [];
  }
  annotation.thread.push(message);
  annotation.updatedAt = new Date().toISOString();

  return annotation;
}

/**
 * Get all pending annotations for a session.
 */
export function getPendingAnnotations(sessionId: string): Annotation[] {
  return Array.from(annotations.values()).filter(
    (a) => a.sessionId === sessionId && a.status === "pending"
  );
}

/**
 * Get all annotations for a session.
 */
export function getSessionAnnotations(sessionId: string): Annotation[] {
  return Array.from(annotations.values()).filter(
    (a) => a.sessionId === sessionId
  );
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Clear all data (useful for testing).
 */
export function clearAll(): void {
  sessions.clear();
  annotations.clear();
}
