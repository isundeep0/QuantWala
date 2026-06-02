import { useState } from "react";
import CodeBlock from "./CodeBlock.jsx";

const LANG_LABEL = { cpp: "C++", python: "Python", java: "Java", js: "JavaScript" };

// Renders one or more code snippets with a language switcher.
// `blocks` is [{ language, title, source }]. Falls back gracefully to a single
// block. Remembers the user's language preference across lessons via localStorage.
export default function CodeTabs({ blocks = [] }) {
  const valid = blocks.filter((b) => b && b.source);
  const stored = typeof window !== "undefined" ? window.localStorage.getItem("qw:lang") : null;
  const initial = Math.max(
    0,
    valid.findIndex((b) => b.language === stored),
  );
  const [idx, setIdx] = useState(initial === -1 ? 0 : initial);

  if (valid.length === 0) return null;
  if (valid.length === 1) {
    const b = valid[0];
    return <CodeBlock code={b.source} language={b.language || "cpp"} title={b.title} />;
  }

  const active = valid[Math.min(idx, valid.length - 1)];

  const pick = (i, lang) => {
    setIdx(i);
    try {
      window.localStorage.setItem("qw:lang", lang);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        {valid.map((b, i) => {
          const isActive = i === Math.min(idx, valid.length - 1);
          return (
            <button
              key={b.language + i}
              onClick={() => pick(i, b.language)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive ? "bg-brand-600 text-white" : "surface-sunken text-muted hover:text-[color:rgb(var(--text))]"
              }`}
            >
              {LANG_LABEL[b.language] || b.language}
            </button>
          );
        })}
      </div>
      <CodeBlock code={active.source} language={active.language || "cpp"} title={active.title} />
    </div>
  );
}
