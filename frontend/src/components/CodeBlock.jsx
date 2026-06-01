import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Lightweight, dependency-free syntax highlighter for C++ / Python / pseudo.
// Tokenizes a small grammar — good enough for teaching snippets without
// pulling in a heavy highlighting library.
const KEYWORDS = {
  cpp: [
    "alignas","atomic","auto","bool","break","case","char","class","const","constexpr",
    "continue","default","delete","do","double","else","enum","explicit","extern","false",
    "float","for","friend","if","inline","int","long","mutable","namespace","new","noexcept",
    "nullptr","operator","private","protected","public","register","return","short","signed",
    "sizeof","static","static_cast","reinterpret_cast","struct","switch","template","this",
    "throw","true","typedef","typename","union","unsigned","using","virtual","void","volatile",
    "while","include","define","std","vector","string","size_t","uint64_t","int64_t",
  ],
  python: [
    "and","as","assert","async","await","break","class","continue","def","del","elif","else",
    "except","False","finally","for","from","global","if","import","in","is","lambda","None",
    "nonlocal","not","or","pass","raise","return","True","try","while","with","yield","self",
    "print","range","len","int","float","str","list","dict","set","tuple",
  ],
};

function highlight(code, lang) {
  const kw = new Set(KEYWORDS[lang] || []);
  const lines = code.replace(/\n$/, "").split("\n");
  return lines.map((line, li) => {
    const tokens = [];
    // Split keeping delimiters; capture strings & comments first.
    const regex =
      /(\/\/.*$|#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+\.?\d*\b|[A-Za-z_]\w*|\s+|.)/g;
    let m;
    let key = 0;
    while ((m = regex.exec(line)) !== null) {
      const t = m[0];
      let cls = "";
      if (/^(\/\/|#)/.test(t)) cls = "text-faint italic";
      else if (/^["']/.test(t)) cls = "text-emerald-500";
      else if (/^\d/.test(t)) cls = "text-amber-500";
      else if (kw.has(t)) cls = "text-brand-500 font-semibold";
      else if (/^[A-Za-z_]\w*$/.test(t)) {
        // function call if followed by '('
        const rest = line.slice(regex.lastIndex);
        if (/^\s*\(/.test(rest)) cls = "text-sky-400";
      }
      tokens.push(
        cls ? (
          <span key={key++} className={cls}>
            {t}
          </span>
        ) : (
          <span key={key++}>{t}</span>
        ),
      );
    }
    return (
      <div key={li} className="table-row">
        <span className="table-cell select-none pr-4 text-right font-mono text-[11px] text-faint">
          {li + 1}
        </span>
        <span className="table-cell whitespace-pre">{tokens}</span>
      </div>
    );
  });
}

export default function CodeBlock({ code = "", language = "cpp", title }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--bg-sunken))" }}
      >
        <span className="font-mono text-xs text-muted">{title || language}</span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:surface"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed"
        style={{ backgroundColor: "rgb(var(--bg-elev))" }}
      >
        <code className="table w-full">{highlight(code, language)}</code>
      </pre>
    </div>
  );
}
