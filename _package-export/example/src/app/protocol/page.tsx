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
      className="copy-button"
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

function ToolName({ children }: { children: string }) {
  return (
    <h3 style={{ fontFamily: "'SF Mono', monospace", fontSize: "0.75rem", letterSpacing: "-0.01em" }}>
      {children}
    </h3>
  );
}

export default function ProtocolPage() {
  return (
    <>
      <article className="article">
        <header>
          <h1>MCP Integration</h1>
          <p className="tagline">
            Connect AI agents to structured annotations via Model Context Protocol
          </p>
        </header>

        <section>
          <h2>Why Structured Feedback?</h2>
          <p>
            When a user clicks a misaligned button to report it, your agent receives the exact
            component path (<code>ProductPage &gt; AddToCartButton</code>), its CSS state,
            bounding box, and what&apos;s wrong &mdash; no guessing from vague chat descriptions.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", marginTop: "1rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.375rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", width: "50%", fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>
                  Chat-based feedback
                </td>
                <td style={{ padding: "0.375rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>
                  Agentation
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.375rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" }}>
                  &quot;The button on the product page is broken&quot;
                </td>
                <td style={{ padding: "0.375rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" }}>
                  Element, path, component, styles, position
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.375rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" }}>
                  Ephemeral &mdash; lost after session
                </td>
                <td style={{ padding: "0.375rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" }}>
                  Persistent until resolved
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.375rem 0", color: "rgba(0,0,0,0.5)" }}>
                  No priority system
                </td>
                <td style={{ padding: "0.375rem 0", color: "rgba(0,0,0,0.5)" }}>
                  Intent + severity for prioritization
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>How It Works</h2>
          <ol style={{ paddingLeft: "1.25rem" }}>
            <li><strong>Reviewer</strong> clicks an element and adds feedback in the browser</li>
            <li><strong>Browser</strong> captures element context and syncs to server (HTTP)</li>
            <li><strong>Agent</strong> polls for pending annotations via MCP</li>
            <li><strong>Agent</strong> acknowledges, fixes the code, then resolves</li>
            <li><strong>Reviewer</strong> sees status update, can reopen if needed</li>
          </ol>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.75rem" }}>
            The reviewer is typically human, but could also be an automated system &mdash;
            enabling multi-agent workflows, automated QA, or CI/CD visual regression feedback.
          </p>
        </section>

        <section>
          <h2>Annotation Lifecycle</h2>
          <p style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "rgba(0,0,0,0.7)" }}>
            pending → acknowledged → resolved | dismissed
          </p>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.5rem" }}>
            Reviewers can reopen resolved annotations if the fix didn&apos;t work.
          </p>
        </section>

        <section>
          <h2>MCP Tools</h2>
          <p>
            Seven tools are available via the <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">Model Context Protocol</a>:
          </p>

          <ToolName>agentation_list_sessions</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            List all active annotation sessions. Use this to discover which pages have feedback.
          </p>
          <CodeBlock
            language="json"
            code={`// Response
{
  "sessions": [
    { "id": "sess_abc", "url": "http://localhost:3000/products", "status": "active" }
  ]
}`}
          />

          <ToolName>agentation_get_session</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            Get a session with all its annotations. Input: <code>sessionId</code>
          </p>

          <ToolName>agentation_get_pending</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            Get annotations waiting for attention. Input: <code>sessionId</code>
          </p>
          <CodeBlock
            language="json"
            code={`// Response
{
  "count": 1,
  "annotations": [{
    "id": "ann_123",
    "comment": "Button is cut off on mobile",
    "element": "button",
    "elementPath": "body > main > .hero > button.cta",
    "reactComponents": "App > LandingPage > HeroSection > Button",
    "intent": "fix",
    "severity": "blocking",
    "nearbyText": "Add to Cart"
  }]
}`}
          />

          <ToolName>agentation_acknowledge</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            Mark as seen. Lets the reviewer know you&apos;re working on it. Input: <code>annotationId</code>
          </p>

          <ToolName>agentation_resolve</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            Mark as done after fixing. Input: <code>annotationId</code>, optional <code>summary</code>
          </p>
          <CodeBlock
            language="json"
            code={`// Request
{ "annotationId": "ann_123", "summary": "Fixed padding on mobile breakpoint" }

// Response
{ "resolved": true, "annotationId": "ann_123", "summary": "Fixed padding..." }`}
          />

          <ToolName>agentation_dismiss</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            Decline to address, with a reason. Input: <code>annotationId</code>, <code>reason</code>
          </p>

          <ToolName>agentation_reply</ToolName>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)" }}>
            Ask a clarifying question or send an update. Input: <code>annotationId</code>, <code>message</code>
          </p>
        </section>

        <section>
          <h2>Annotation Schema</h2>
          <p>
            MCP tools exchange annotations in the <a href="/spec">Structured Annotation Format (SAF)</a>.
            Key fields agents receive:
          </p>
          <CodeBlock
            language="typescript"
            code={`{
  id: string;                 // For acknowledge/resolve calls
  comment: string;            // Human feedback
  elementPath: string;        // CSS selector path
  reactComponents?: string;   // Component tree (when available)
  intent?: "fix" | "change" | "question" | "approve";
  severity?: "blocking" | "important" | "suggestion";
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
}`}
          />
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.5rem" }}>
            See the <a href="/spec">full schema specification</a> for all available fields.
          </p>
        </section>

        <section>
          <h2>Agent Configuration</h2>
          <p>
            Add Agentation as an MCP server in your agent&apos;s config:
          </p>
          <CodeBlock
            language="json"
            copyable
            code={`// In ~/.claude.json under projects.<your-project-path>
{
  "mcpServers": {
    "agentation": {
      "command": "npx",
      "args": ["agentation", "server"]
    }
  }
}`}
          />
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.75rem" }}>
            Works with any MCP-compatible agent. The HTTP server runs on port 4747 by default.
            Use <code>--mcp-only</code> if running the HTTP server separately.
          </p>
        </section>

        <section>
          <h2>Example Workflow</h2>
          <CodeBlock
            language="typescript"
            code={`// 1. Agent checks for feedback
const pending = await agentation_get_pending({ sessionId: "sess_abc" });
// → 1 annotation: "Button is cut off on mobile" (blocking)

// 2. Agent acknowledges
await agentation_acknowledge({ annotationId: "ann_123" });
// Reviewer sees: "Agent is working on this"

// 3. Agent fixes the code
// ... edits Button.tsx to fix mobile padding ...

// 4. Agent resolves
await agentation_resolve({
  annotationId: "ann_123",
  summary: "Added responsive padding for mobile viewports"
});
// Reviewer sees: "Resolved by agent"`}
          />
        </section>

        <section>
          <h2>HTTP API</h2>
          <p>
            The browser component syncs annotations via HTTP. The server exposes:
          </p>
          <ul>
            <li><code>POST /sessions</code> &mdash; Create a new session</li>
            <li><code>POST /annotations</code> &mdash; Add an annotation</li>
            <li><code>GET /health</code> &mdash; Server health check</li>
          </ul>
          <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.55)", marginTop: "0.5rem" }}>
            The React component handles this automatically when you set the <code>endpoint</code> prop.
          </p>
        </section>
      </article>

      <Footer />
    </>
  );
}
