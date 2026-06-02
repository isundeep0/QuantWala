import React from "react";

// Lightweight inline formatter for lesson copy. Supports a tiny, safe subset of
// markdown so content authors can emphasise text without raw HTML:
//   **bold**      -> <strong>
//   `code`        -> <code> (monospace pill)
//   *italic*      -> <em>
// Everything else renders as plain text. Returns an array of React nodes.
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

export function formatInline(text) {
  if (text == null) return null;
  if (typeof text !== "string") return text;
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[color:rgb(var(--text))]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md px-1.5 py-0.5 font-mono text-[0.85em] surface-sunken"
          style={{ border: "1px solid rgb(var(--border))" }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function Inline({ children }) {
  return <>{formatInline(children)}</>;
}
