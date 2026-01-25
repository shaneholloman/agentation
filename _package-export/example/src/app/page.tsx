"use client";

import { useState } from "react";
import Link from "next/link";
import { Footer } from "./Footer";
import { HeroDemo } from "./components/HeroDemo";

// Animated copy/checkmark icon
const IconCopyAnimated = ({ size = 24, copied = false }: { size?: number; copied?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <style>{`
      .copy-icon, .check-icon {
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
    `}</style>
    {/* Copy icon */}
    <g className="copy-icon" style={{ opacity: copied ? 0 : 1, transform: copied ? 'scale(0.8)' : 'scale(1)', transformOrigin: 'center' }}>
      <path
        d="M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
    {/* Checkmark circle */}
    <g className="check-icon" style={{ opacity: copied ? 1 : 0, transform: copied ? 'scale(1)' : 'scale(0.8)', transformOrigin: 'center' }}>
      <path
        d="M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 10L11 14.25L9.25 12.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

function InstallSnippet() {
  const [copied, setCopied] = useState(false);
  const command = "npm install agentation";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="install-snippet"
      title="Copy to clipboard"
    >
      <code>{command}</code>
      <IconCopyAnimated size={14} copied={copied} />
    </button>
  );
}

export default function AgentationDocs() {
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <article className="article">
        <header style={{ position: 'relative' }}>
          <InstallSnippet />
          <h1 style={{ fontSize: '2rem', lineHeight: 1.15, marginBottom: '0.5rem' }}><span className="sketchy-underline">Point at bugs.</span><br />Let AI <span className="pen-underline">fix them.</span></h1>
          <p className="tagline">Agentation turns UI annotations into structured context that AI coding agents can understand and act on. Click any element, add a note, and paste the output into Claude Code, Cursor, or any AI tool.</p>
        </header>

        {/* Animated demo */}
        <HeroDemo />

        <section>
          <h2>How you use it</h2>
          <ol>
            <li>Click the <svg style={{ display: 'inline-block', verticalAlign: '-0.45em', width: '1.5em', height: '1.5em', margin: '0 -0.1em' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 12L5.5 12" /><path d="M18.5 6.75L5.5 6.75" /><path d="M9.25 17.25L5.5 17.25" /><path d="M16 12.75L16.5179 13.9677C16.8078 14.6494 17.3506 15.1922 18.0323 15.4821L19.25 16L18.0323 16.5179C17.3506 16.8078 16.8078 17.3506 16.5179 18.0323L16 19.25L15.4821 18.0323C15.1922 17.3506 14.6494 16.8078 13.9677 16.5179L12.75 16L13.9677 15.4821C14.6494 15.1922 15.1922 14.6494 15.4821 13.9677L16 12.75Z" /></svg> icon in the bottom-right corner to activate</li>
            <li><strong>Hover</strong> over elements to see their names highlighted</li>
            <li><strong>Click</strong> any element to add an annotation</li>
            <li>Write your feedback and click <strong>Add</strong></li>
            <li>Click <svg style={{ display: 'inline-block', verticalAlign: '-0.45em', width: '1.5em', height: '1.5em', margin: '0 -0.1em' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z" /><path d="M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75" /></svg> to copy formatted markdown</li>
            <li>Paste into your agent</li>
          </ol>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.55)', marginTop: '1rem' }}>
            With <Link href="/mcp">MCP</Link>, you can skip the copy-paste entirely. Just add annotations and talk to your agent &mdash; it sees your feedback in real-time and can act on it directly.
          </p>
        </section>

        <section>
          <h2>How agents use it</h2>
          <p>
            Agentation works best with AI tools that have access to your codebase (Claude Code, Cursor, etc.). When you paste the output, agents get:
          </p>
          <ul>
            <li><strong>CSS selectors</strong> to grep your codebase</li>
            <li><strong>React component names</strong> to find the right file</li>
            <li><strong>Computed styles</strong> to understand current appearance</li>
            <li><strong>Your feedback</strong> with intent and priority</li>
          </ul>
          <p>
            Without Agentation, you&rsquo;d have to describe the element (&ldquo;the blue button in the sidebar&rdquo;) and hope the agent guesses right. With Agentation, you give it <code>.sidebar &gt; button.primary</code> and it can grep for that directly.
          </p>
        </section>

        {/* Interactive Demo Section - hidden on mobile since tool is desktop-only */}
        <section className="demo-section hide-on-mobile">
          <h2>Try it</h2>
          <p>
            The toolbar is active on this page. Try annotating these demo elements:
          </p>

          <div className="demo-elements">
            <div className="button-group">
              <button className="demo-button" onClick={() => alert("Primary clicked!")}>
                Primary Button
              </button>
              <button className="demo-button secondary" onClick={() => alert("Secondary clicked!")}>
                Secondary Button
              </button>
            </div>

            <input
              type="text"
              className="demo-input"
              placeholder="Try selecting this text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <div className="demo-card">
              <h3>Example Card</h3>
              <p>
                Click on this card or select this text to create an annotation.
                The output will include the element path and your feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Animation Demo - hidden on mobile since tool is desktop-only */}
        <section className="demo-section hide-on-mobile">
          <h2>Animation pause demo</h2>
          <p>
            Click <svg style={{ display: 'inline-block', verticalAlign: '-0.45em', width: '1.5em', height: '1.5em', margin: '0 -0.1em' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 6L8 18" /><path d="M16 18L16 6" /></svg> in the toolbar to freeze this animation:
          </p>
          <div className="animation-demo">
            <div className="progress-bar-demo">
              <div className="progress-bar" />
            </div>
          </div>
        </section>

        <section>
          <h2>Agents talk back</h2>
          <p>
            With <a href="/mcp">MCP integration</a> and the <a href="/schema">Annotation Format Schema</a>, agents don&rsquo;t just read your annotations &mdash; they can respond to them:
          </p>
          <ul>
            <li><strong>&ldquo;What annotations do I have?&rdquo;</strong> &mdash; List all feedback across pages</li>
            <li><strong>&ldquo;Should this be 24px or 16px?&rdquo;</strong> &mdash; Agent asks for clarification</li>
            <li><strong>&ldquo;Fixed the padding&rdquo;</strong> &mdash; Agent resolves with a summary</li>
            <li><strong>&ldquo;Clear all annotations&rdquo;</strong> &mdash; Dismiss everything at once</li>
          </ul>
          <p>
            Your feedback becomes a conversation, not a one-way ticket into the void.
          </p>
        </section>

        <section>
          <h2>Best practices</h2>
          <ul>
            <li><strong>Be specific</strong> &mdash; &ldquo;Button text unclear&rdquo; is better than &ldquo;fix this&rdquo;</li>
            <li><strong>One issue per annotation</strong> &mdash; easier for the agent to address individually</li>
            <li><strong>Include context</strong> &mdash; mention what you expected vs. what you see</li>
            <li><strong>Use text selection</strong> &mdash; for typos or content issues, select the exact text</li>
            <li><strong>Pause animations</strong> &mdash; to annotate a specific animation frame</li>
          </ul>
        </section>

        <section className="quickstart-links">
          <p><Link href="/mcp" className="styled-link">Set up real-time sync with MCP <span className="arrow">→</span></Link></p>
          <p><Link href="/api" className="styled-link">Build your own integration with the API <span className="arrow">→</span></Link></p>
        </section>

      </article>

      <Footer />
    </>
  );
}
