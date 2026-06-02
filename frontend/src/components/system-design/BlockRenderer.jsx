import {
  Lightbulb,
  Quote,
  Sparkles,
  AlertTriangle,
  Info,
  Target,
  Check,
  X,
  GraduationCap,
  Trophy,
} from "lucide-react";
import CodeTabs from "@/components/CodeTabs.jsx";
import DiagramView from "./DiagramView.jsx";
import { formatInline } from "@/lib/inline.jsx";

const ACCENT = "#d97706";

const CALLOUT = {
  tip: { icon: Lightbulb, color: "#10b981", label: "Tip" },
  warning: { icon: AlertTriangle, color: "#ef4444", label: "Watch out" },
  note: { icon: Info, color: "#0ea5e9", label: "Note" },
  insight: { icon: Sparkles, color: "#8b5cf6", label: "Insight" },
  interview: { icon: Target, color: "#d97706", label: "In the interview" },
  junior: { icon: GraduationCap, color: "#0ea5e9", label: "Junior bar" },
  senior: { icon: Trophy, color: "#f59e0b", label: "Senior bar" },
};

function BlockTitle({ children }) {
  if (!children) return null;
  return <h4 className="mb-3 text-base font-bold tracking-tight">{children}</h4>;
}

function TextBlock({ block }) {
  return (
    <div>
      <BlockTitle>{block.title}</BlockTitle>
      <div className="space-y-3.5">
        {(block.paragraphs || []).map((p, i) => (
          <p key={i} className="leading-relaxed text-[15px] text-[color:rgb(var(--text-muted))]">
            {formatInline(p)}
          </p>
        ))}
      </div>
    </div>
  );
}

function AnalogyBlock({ block }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-5"
      style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0d` }}
    >
      <Quote className="mt-0.5 h-5 w-5 shrink-0" style={{ color: ACCENT }} />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
          {block.title || "Real-world analogy"}
        </div>
        <p className="mt-1 leading-relaxed">{formatInline(block.text)}</p>
      </div>
    </div>
  );
}

function KeyBlock({ block }) {
  return (
    <div className="flex items-start gap-3 rounded-xl surface-sunken p-4">
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          {block.title || "The key idea"}
        </div>
        <p className="mt-1 font-medium">{formatInline(block.text)}</p>
      </div>
    </div>
  );
}

function CalloutBlock({ block }) {
  const meta = CALLOUT[block.variant] || CALLOUT.note;
  const Icon = meta.icon;
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: `${meta.color}44`, backgroundColor: `${meta.color}0d` }}
    >
      <div
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: meta.color }}
      >
        <Icon className="h-4 w-4" /> {block.title || meta.label}
      </div>
      {block.text && (
        <p className="mt-2 text-sm leading-relaxed text-[color:rgb(var(--text-muted))]">
          {formatInline(block.text)}
        </p>
      )}
      {block.items?.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:rgb(var(--text-muted))]">
          {block.items.map((it, i) => (
            <li key={i}>{formatInline(typeof it === "string" ? it : it.detail)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BulletsBlock({ block }) {
  return (
    <div>
      <BlockTitle>{block.title}</BlockTitle>
      <ul className="space-y-2.5">
        {(block.items || []).map((it, i) => {
          const isObj = typeof it === "object" && it !== null;
          return (
            <li key={i} className="flex gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              <span className="text-[15px] leading-relaxed text-[color:rgb(var(--text-muted))]">
                {isObj ? (
                  <>
                    <span className="font-semibold text-[color:rgb(var(--text))]">
                      {formatInline(it.term)}
                    </span>
                    {it.detail ? <> — {formatInline(it.detail)}</> : null}
                  </>
                ) : (
                  formatInline(it)
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StepsBlock({ block }) {
  return (
    <div>
      <BlockTitle>{block.title}</BlockTitle>
      <ol className="space-y-3">
        {(block.items || []).map((s, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-xl border p-4"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              {i + 1}
            </span>
            <div>
              <div className="font-semibold">{formatInline(s.title)}</div>
              {s.detail && (
                <p className="mt-1 text-sm leading-relaxed text-muted">{formatInline(s.detail)}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CompareBlock({ block }) {
  const cols = block.columns || [];
  return (
    <div>
      <BlockTitle>{block.title}</BlockTitle>
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="surface-sunken text-left">
              {cols.map((c, i) => (
                <th key={i} className="px-4 py-2.5 font-semibold">
                  {formatInline(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(block.rows || []).map((row, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "rgb(var(--border))" }}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 align-top leading-relaxed ${
                      j === 0 ? "font-semibold text-[color:rgb(var(--text))]" : "text-muted"
                    }`}
                  >
                    {formatInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && <p className="mt-2 text-xs text-faint">{formatInline(block.caption)}</p>}
    </div>
  );
}

function TradeoffsBlock({ block }) {
  return (
    <div>
      <BlockTitle>{block.title}</BlockTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4" style={{ borderColor: "#10b98144", backgroundColor: "#10b9810a" }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" /> Pros
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {(block.pros || []).map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                <span>{formatInline(p)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: "#ef444444", backgroundColor: "#ef44440a" }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
            <X className="h-4 w-4" /> Cons
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {(block.cons || []).map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                <span>{formatInline(p)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricsBlock({ block }) {
  return (
    <div>
      <BlockTitle>{block.title}</BlockTitle>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
        {(block.items || []).map((row, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-4 px-4 py-2.5"
            style={{
              borderTop: i ? "1px solid rgb(var(--border))" : "none",
              backgroundColor: i % 2 ? "rgb(var(--bg-sunken) / 0.3)" : "transparent",
            }}
          >
            <span className="text-sm text-muted">{formatInline(row.label)}</span>
            <span className="flex items-baseline gap-2 text-right">
              <span className="font-mono text-sm font-semibold" style={{ color: ACCENT }}>
                {row.value}
              </span>
              {row.note && <span className="hidden text-xs text-faint sm:inline">{row.note}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBlock({ block }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(block.items || []).map((s, i) => (
        <div key={i} className="rounded-xl surface-sunken p-4 text-center">
          <div className="text-2xl font-extrabold" style={{ color: ACCENT }}>
            {s.value}
          </div>
          <div className="mt-1 text-xs text-muted">{formatInline(s.label)}</div>
        </div>
      ))}
    </div>
  );
}

function CodeBlockWrap({ block }) {
  const codes = block.codes?.length
    ? block.codes
    : block.source
    ? [{ language: block.language || "text", title: block.title, source: block.source }]
    : [];
  if (!codes.length) return null;
  return (
    <div>
      <BlockTitle>{block.title && !block.codes ? null : block.title}</BlockTitle>
      <CodeTabs blocks={codes} />
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "analogy":
      return <AnalogyBlock block={block} />;
    case "key":
      return <KeyBlock block={block} />;
    case "callout":
      return <CalloutBlock block={block} />;
    case "bullets":
      return <BulletsBlock block={block} />;
    case "steps":
      return <StepsBlock block={block} />;
    case "compare":
      return <CompareBlock block={block} />;
    case "tradeoffs":
      return <TradeoffsBlock block={block} />;
    case "diagram":
      return (
        <DiagramView
          direction={block.direction}
          groups={block.groups}
          legend={block.legend}
          caption={block.caption}
        />
      );
    case "metrics":
      return <MetricsBlock block={block} />;
    case "stat":
      return <StatBlock block={block} />;
    case "code":
      return <CodeBlockWrap block={block} />;
    default:
      return null;
  }
}

export default function BlockRenderer({ blocks = [] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}
