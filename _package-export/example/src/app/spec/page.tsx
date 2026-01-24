"use client";

import { useState } from "react";
import { Footer } from "../Footer";
import { Highlight, themes } from "prism-react-renderer";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        padding: "0.375rem",
        background: "transparent",
        border: "none",
        borderRadius: "0.25rem",
        cursor: "pointer",
        color: copied ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)",
        transition: "color 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {copied ? (
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <rect
              x="4.75"
              y="8.75"
              width="10.5"
              height="10.5"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8.75 8.75V6.75a2 2 0 012-2h6.5a2 2 0 012 2v6.5a2 2 0 01-2 2h-2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </>
        )}
      </svg>
    </button>
  );
}

function CodeBlock({
  code,
  language = "typescript",
  copyable = false,
}: {
  code: string;
  language?: string;
  copyable?: boolean;
}) {
  return (
    <div style={{ position: "relative" }}>
      <Highlight theme={themes.github} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre className="code-block" style={{ ...style, background: "transparent" }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      {copyable && <CopyButton text={code.trim()} />}
    </div>
  );
}

export default function SpecPage() {
  return (
    <>
      <article className="article">
        <header>
          <h1>
            Annotation Schema{" "}
            <span
              style={{
                fontFamily: "var(--font-primary)",
                fontSize: "0.5em",
                fontWeight: 500,
                color: "#4a9eff",
                border: "1px solid #4a9eff",
                borderRadius: "9999px",
                padding: "0.15em 0.5em",
                verticalAlign: "middle",
                position: "relative",
                top: "-0.1em",
              }}
            >
              v1.0
            </span>
          </h1>
          <p className="tagline">
            A portable format for structured UI feedback
          </p>
        </header>

        <section>
          <h2>Overview</h2>
          <p>
            The Structured Annotation Format (SAF) is an open schema for capturing
            UI feedback in a way that AI coding agents can reliably parse and act on.
            It bridges the gap between what humans see in a browser and what agents
            need to locate and fix code.
          </p>
          <p>
            This spec defines the annotation object shape. Tools can emit annotations
            in this format, and agents can consume them regardless of how they were created.
          </p>
        </section>

        <section>
          <h2>Design Goals</h2>
          <ul>
            <li><strong>Agent-readable</strong> &mdash; Structured data that LLMs can parse without guessing</li>
            <li><strong>Framework-agnostic</strong> &mdash; Works with any UI, though React gets extra context</li>
            <li><strong>Tool-agnostic</strong> &mdash; Any tool can emit, any agent can consume</li>
            <li><strong>Human-authored</strong> &mdash; Designed for feedback from humans (or automated reviewers)</li>
            <li><strong>Minimal core</strong> &mdash; Few required fields, many optional for richer context</li>
          </ul>
        </section>

        <section>
          <h2>Annotation Object</h2>
          <p>
            An annotation represents a single piece of feedback attached to a UI element.
          </p>

          <h3>Required Fields</h3>
          <CodeBlock
            language="typescript"
            code={`{
  id: string;           // Unique identifier (e.g. "ann_abc123")
  comment: string;      // Human feedback ("Button is misaligned")
  elementPath: string;  // CSS selector path ("body > main > button.cta")
  timestamp: number;    // Unix timestamp (ms)
}`}
          />

          <h3>Recommended Fields</h3>
          <CodeBlock
            language="typescript"
            code={`{
  element: string;      // Tag name ("button", "div", "input")
  url: string;          // Page URL where annotation was created
  boundingBox: {        // Element position at annotation time
    x: number;
    y: number;
    width: number;
    height: number;
  };
}`}
          />

          <h3>Optional Context Fields</h3>
          <CodeBlock
            language="typescript"
            code={`{
  // React-specific (when available)
  reactComponents: string;  // Component tree ("App > Dashboard > Button")

  // Element details
  cssClasses: string;       // Class list ("btn btn-primary disabled")
  computedStyles: string;   // Key CSS properties
  accessibility: string;    // ARIA attributes, role
  nearbyText: string;       // Visible text in/around element
  selectedText: string;     // Text highlighted by user

  // Feedback classification
  intent: "fix" | "change" | "question" | "approve";
  severity: "blocking" | "important" | "suggestion";
}`}
          />

          <h3>Lifecycle Fields</h3>
          <CodeBlock
            language="typescript"
            code={`{
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
  resolvedAt: string;       // ISO timestamp
  resolvedBy: "human" | "agent";
  thread: ThreadMessage[];  // Back-and-forth conversation
}`}
          />
        </section>

        <section>
          <h2>Full TypeScript Definition</h2>
          <CodeBlock
            language="typescript"
            copyable
            code={`type Annotation = {
  // Required
  id: string;
  comment: string;
  elementPath: string;
  timestamp: number;

  // Recommended
  element?: string;
  url?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Optional context
  reactComponents?: string;
  cssClasses?: string;
  computedStyles?: string;
  accessibility?: string;
  nearbyText?: string;
  selectedText?: string;

  // Feedback classification
  intent?: "fix" | "change" | "question" | "approve";
  severity?: "blocking" | "important" | "suggestion";

  // Lifecycle
  status?: "pending" | "acknowledged" | "resolved" | "dismissed";
  resolvedAt?: string;
  resolvedBy?: "human" | "agent";
  thread?: ThreadMessage[];
};

type ThreadMessage = {
  id: string;
  role: "human" | "agent";
  content: string;
  timestamp: number;
};`}
          />
        </section>

        <section>
          <h2>JSON Schema</h2>
          <p>
            For validation in any language:
          </p>
          <CodeBlock
            language="json"
            copyable
            code={`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentation.dev/schema/annotation.v1.json",
  "title": "Annotation",
  "type": "object",
  "required": ["id", "comment", "elementPath", "timestamp"],
  "properties": {
    "id": { "type": "string" },
    "comment": { "type": "string" },
    "elementPath": { "type": "string" },
    "timestamp": { "type": "number" },
    "element": { "type": "string" },
    "url": { "type": "string", "format": "uri" },
    "boundingBox": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" },
        "width": { "type": "number" },
        "height": { "type": "number" }
      },
      "required": ["x", "y", "width", "height"]
    },
    "reactComponents": { "type": "string" },
    "intent": { "enum": ["fix", "change", "question", "approve"] },
    "severity": { "enum": ["blocking", "important", "suggestion"] },
    "status": { "enum": ["pending", "acknowledged", "resolved", "dismissed"] }
  }
}`}
          />
        </section>

        <section>
          <h2>Example Annotation</h2>
          <CodeBlock
            language="json"
            code={`{
  "id": "ann_k8x2m",
  "comment": "Button is cut off on mobile viewport",
  "elementPath": "body > main > .hero-section > button.cta",
  "timestamp": 1705694400000,
  "element": "button",
  "url": "http://localhost:3000/landing",
  "boundingBox": { "x": 120, "y": 480, "width": 200, "height": 48 },
  "reactComponents": "App > LandingPage > HeroSection > CTAButton",
  "cssClasses": "cta btn-primary",
  "nearbyText": "Get Started Free",
  "intent": "fix",
  "severity": "blocking",
  "status": "pending"
}`}
          />
        </section>

        <section>
          <h2>Markdown Output Format</h2>
          <p>
            For pasting into chat-based agents, annotations can be serialized as markdown:
          </p>
          <CodeBlock
            language="markdown"
            code={`## Annotation #1
**Element:** button.cta
**Path:** body > main > .hero-section > button.cta
**React:** App > LandingPage > HeroSection > CTAButton
**Position:** 120px, 480px (200×48px)
**Feedback:** Button is cut off on mobile viewport
**Severity:** blocking`}
          />
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.5rem" }}>
            See <a href="/output">Output Formats</a> for detail level options (Compact → Forensic).
          </p>
        </section>

        <section>
          <h2>Implementations</h2>
          <p>
            Tools that emit or consume this format:
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", marginTop: "0.75rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 500 }}>
                  Agentation (React)
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)", textAlign: "right" }}>
                  Click-to-annotate toolbar for React apps
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 500 }}>
                  Agentation MCP Server
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)", textAlign: "right" }}>
                  Exposes annotations to Claude Code and other MCP clients
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: 500, color: "rgba(0,0,0,0.4)" }}>
                  Your tool here
                </td>
                <td style={{ padding: "0.5rem 0", color: "rgba(0,0,0,0.4)", textAlign: "right" }}>
                  Emit SAF annotations from browser extensions, testing tools, etc.
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Building an Implementation</h2>
          <p>
            To emit SAF-compatible annotations from your tool:
          </p>
          <ol style={{ paddingLeft: "1.25rem" }}>
            <li>Capture the required fields: <code>id</code>, <code>comment</code>, <code>elementPath</code>, <code>timestamp</code></li>
            <li>Add recommended fields for better agent accuracy: <code>element</code>, <code>url</code>, <code>boundingBox</code></li>
            <li>For React apps, traverse the fiber tree to get <code>reactComponents</code></li>
            <li>Output as JSON for MCP/API consumption, or markdown for chat pasting</li>
          </ol>
          <p style={{ marginTop: "0.75rem" }}>
            See the <a href="https://github.com/benjitaylor/agentation">Agentation source</a> for
            reference implementations of element detection and React component traversal.
          </p>
        </section>

        <section>
          <h2>Why This Format?</h2>
          <p>
            Existing agent protocols (MCP, A2A, ACP) standardize tools and messaging, but
            they don&apos;t define a UI feedback grammar. They rely on whatever structured
            context you feed them.
          </p>
          <p>
            SAF fills that gap: a portable wire format specifically for &quot;human points at UI,
            agent needs to find and fix the code.&quot; The first format that ships broadly,
            is simple, and works across agents tends to become the standard.
          </p>
        </section>

        <section>
          <h2>Versioning</h2>
          <p>
            This is <strong>v1.0</strong> of the Structured Annotation Format.
          </p>
          <ul>
            <li>Required fields will not change in v1.x</li>
            <li>New optional fields may be added in minor versions</li>
            <li>Breaking changes require a major version bump</li>
          </ul>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.75rem" }}>
            Schema URL: <code>https://agentation.dev/schema/annotation.v1.json</code>
          </p>
        </section>
      </article>

      <Footer />
    </>
  );
}
