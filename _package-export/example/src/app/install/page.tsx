"use client";

import { Footer } from "../Footer";
import { CodeBlock } from "../components/CodeBlock";

export default function InstallPage() {
  return (
    <>
      <article className="article">
        <header>
          <h1>Installation</h1>
          <p className="tagline">Get started with Agentation in your project</p>
        </header>

        <section>
          <h2>Choose your setup</h2>
          <ul>
            <li><strong>Just want annotations?</strong> &rarr; Basic Setup below (copy-paste to agent)</li>
            <li><strong>Using Claude Code?</strong> &rarr; Add the <code>/agentation</code> skill (auto-setup)</li>
            <li><strong>Building a custom agent?</strong> &rarr; Run MCP server for real-time sync</li>
          </ul>
          <p style={{ fontSize: "0.875rem", color: "rgba(0,0,0,0.5)", marginTop: "0.5rem" }}>
            Most users: Basic + Claude Code skill. Power users: Basic + MCP server.
          </p>
        </section>

        <section>
          <h2>Install the package</h2>
          <CodeBlock code="npm install agentation" language="bash" copyable />
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0,0,0,0.5)",
              marginTop: "0.5rem",
            }}
          >
            Or use yarn, pnpm, or bun.
          </p>
        </section>

        <section>
          <h2>Add to your app</h2>
          <p>
            Add the component anywhere in your React app, ideally at the root
            level. The <code>NODE_ENV</code> check ensures it only loads in
            development.
          </p>
          <CodeBlock
            code={`import { Agentation } from "agentation";

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  );
}`}
            language="tsx"
          />
        </section>

        <section>
          <h2>Claude Code</h2>
          <p>
            If you use Claude Code, you can set up Agentation automatically with the <code>/agentation</code> skill. Install it:
          </p>
          <CodeBlock code="npx add-skill benjitaylor/agentation" language="bash" copyable />
          <p style={{ marginTop: "1rem" }}>
            Then in Claude Code:
          </p>
          <CodeBlock code="/agentation" language="bash" copyable />
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0,0,0,0.5)",
              marginTop: "0.5rem",
            }}
          >
            Detects your framework, installs the package, creates a provider, and wires it into your layout.
          </p>
        </section>

        <section>
          <h2>Agent Integration (Optional)</h2>
          <p>
            Connect Agentation to any AI coding agent that supports{" "}
            <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">MCP</a>.
            This enables real-time annotation syncing and bidirectional communication.
          </p>

          <h3>1. Start the server</h3>
          <p>
            The Agentation server runs two services: an HTTP server that receives
            annotations from the React component, and an MCP server that exposes
            tools for AI agents to read and act on feedback.
          </p>
          <CodeBlock code="npx agentation server" language="bash" copyable />
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0,0,0,0.5)",
              marginTop: "0.5rem",
            }}
          >
            Runs on port 4747 by default. Use <code>--port 8080</code> to change it.
          </p>

          <h3>2. Configure your agent</h3>
          <p>
            Add Agentation as an MCP server in your agent&apos;s config. Example for Claude Code:
          </p>
          <CodeBlock
            code={`// Edit ~/.claude.json (Claude Code's global config)
// Find or create: "projects" → "/absolute/path/to/your/project"
{
  "mcpServers": {
    "agentation": {
      "command": "npx",
      "args": ["agentation", "server"]
    }
  }
}`}
            language="json"
          />

          <h3>3. Connect the component</h3>
          <p>
            Point the React component to your server:
          </p>
          <CodeBlock
            code={`<Agentation
  endpoint="http://localhost:4747"
  onSessionCreated={(sessionId) => {
    console.log("Session started:", sessionId);
  }}
/>`}
            language="tsx"
          />
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(0,0,0,0.5)",
              marginTop: "0.5rem",
            }}
          >
            Annotations are stored locally and synced to the server when connected.
          </p>

          <ul style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.6)", marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
            <li style={{ marginBottom: "0.375rem" }}><strong>Local-first</strong> &mdash; Works offline, syncs when server is available</li>
            <li style={{ marginBottom: "0.375rem" }}><strong>Session continuity</strong> &mdash; Rejoins the same session on page refresh</li>
            <li style={{ marginBottom: "0.375rem" }}><strong>No duplicates</strong> &mdash; Only new annotations are uploaded; existing ones are skipped</li>
            <li><strong>Server authority</strong> &mdash; Agent changes (resolve, dismiss) take precedence on rejoin</li>
          </ul>

          <p
            style={{
              fontSize: "0.8125rem",
              color: "rgba(0,0,0,0.5)",
              marginTop: "0.75rem",
            }}
          >
            This means you can annotate freely, refresh the page, and the agent will see a continuous session
            rather than fragmented duplicates.
          </p>

          <p style={{ marginTop: "1.5rem" }}>
            <strong>Other agents:</strong> Any tool that supports MCP can connect.
            Point your agent&apos;s MCP config to <code>npx agentation server</code> and
            it will have access to annotation tools like <code>agentation_get_pending</code>,{" "}
            <code>agentation_list_sessions</code>, and <code>agentation_resolve</code>.
          </p>
        </section>

        <section>
          <h2>Requirements</h2>
          <ul>
            <li>
              <strong>React 18+</strong> &mdash; Uses modern React features
            </li>
            <li>
              <strong>Client-side only</strong> &mdash; Requires DOM access
            </li>
            <li>
              <strong>Desktop only</strong> &mdash; Not optimized for mobile
              devices
            </li>
            <li>
              <strong>Zero dependencies</strong> &mdash; No runtime deps beyond
              React
            </li>
          </ul>
        </section>

        <section>
          <h2>Props</h2>
          <p>
            All props are optional. The component works with zero configuration.
          </p>

          <h3 style={{ fontSize: "0.9375rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Callbacks</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", width: "35%" }}>
                  <code>onAnnotationAdd</code>
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Fired when an annotation is added
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <code>onAnnotationDelete</code>
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Fired when an annotation is deleted
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <code>onAnnotationUpdate</code>
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Fired when an annotation comment is edited
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <code>onAnnotationsClear</code>
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Fired when all annotations are cleared
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0" }}>
                  <code>onCopy</code>
                </td>
                <td style={{ padding: "0.5rem 0", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Fired when copy button is clicked (receives markdown)
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: "0.9375rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Behavior</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem 0", width: "35%" }}>
                  <code>copyToClipboard</code>
                </td>
                <td style={{ padding: "0.5rem 0", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Auto-copy on add (default: <code style={{ color: "rgba(0,0,0,0.7)" }}>true</code>)
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: "0.9375rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Agent Sync</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", width: "35%" }}>
                  <code>endpoint</code>
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Server URL (e.g., <code style={{ color: "rgba(0,0,0,0.7)" }}>&quot;http://localhost:4747&quot;</code>)
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <code>sessionId</code>
                </td>
                <td style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Join an existing session (optional)
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0" }}>
                  <code>onSessionCreated</code>
                </td>
                <td style={{ padding: "0.5rem 0", color: "rgba(0,0,0,0.5)", textAlign: "right" }}>
                  Fired when new session is created (receives <code style={{ color: "rgba(0,0,0,0.7)" }}>sessionId: string</code>)
                </td>
              </tr>
            </tbody>
          </table>

        </section>

        <section>
          <h2>Security notes</h2>
          <p>
            Agentation runs in your browser and reads DOM content to generate
            feedback. By default, it does <strong>not</strong> send data anywhere &mdash;
            everything stays local until you manually copy and paste.
          </p>
          <ul>
            <li>
              <strong>No external requests</strong> &mdash; all processing is
              client-side by default
            </li>
            <li>
              <strong>Local server only</strong> &mdash; when using the <code>endpoint</code> prop,
              data is sent to your local machine only (localhost)
            </li>
            <li>
              <strong>No data collection</strong> &mdash; nothing is tracked or
              stored remotely
            </li>
            <li>
              <strong>Dev-only</strong> &mdash; use the <code>NODE_ENV</code>{" "}
              check to exclude from production
            </li>
          </ul>
        </section>
      </article>

      <Footer />
    </>
  );
}
