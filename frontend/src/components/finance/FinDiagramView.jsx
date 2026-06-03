import { ChevronRight, ChevronDown } from "lucide-react";
import FinIcon from "./FinIcon.jsx";
import { formatInline } from "@/lib/inline.jsx";

const ACCENT = "#14b8a6";

function NodeCard({ node }) {
  const accent = node.accent || ACCENT;
  return (
    <div
      className="group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-transform hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(160deg, ${accent}1f, ${accent}0a)`,
        border: `1px solid ${accent}40`,
        boxShadow: `inset 0 0 12px ${accent}14`,
      }}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ background: `${accent}26`, color: accent }}
      >
        <FinIcon name={node.icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold leading-tight">{node.label}</span>
        {node.sub && <span className="block text-[11px] leading-tight text-muted">{node.sub}</span>}
      </span>
    </div>
  );
}

function Group({ group }) {
  return (
    <div className="flex min-w-[130px] flex-1 flex-col gap-2">
      {group.label && (
        <div className="mb-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-faint">
          {group.label}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {(group.nodes || []).map((n, i) => (
          <NodeCard key={i} node={n} />
        ))}
      </div>
    </div>
  );
}

export default function FinDiagramView({ direction = "lr", groups = [], legend = [], caption }) {
  const isTB = direction === "tb";
  return (
    <figure className="my-2">
      <div
        className="rounded-2xl border p-4 sm:p-6"
        style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--bg-sunken) / 0.4)" }}
      >
        <div
          className={
            isTB
              ? "flex flex-col items-stretch gap-2"
              : "flex flex-col gap-3 md:flex-row md:items-stretch md:gap-1"
          }
        >
          {groups.map((g, i) => (
            <div
              key={i}
              className={
                isTB
                  ? "flex flex-col items-stretch gap-2"
                  : "flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-1"
              }
            >
              <Group group={g} />
              {i < groups.length - 1 && (
                <div
                  className={
                    isTB
                      ? "flex items-center justify-center py-0.5"
                      : "flex shrink-0 items-center justify-center py-0.5 md:px-1"
                  }
                >
                  <ChevronRight
                    className="hidden h-5 w-5 text-faint md:block"
                    style={{ display: isTB ? "none" : undefined }}
                  />
                  <ChevronDown
                    className="h-5 w-5 text-faint md:hidden"
                    style={{ display: isTB ? "block" : undefined }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {legend.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-3 text-[11px] text-muted" style={{ borderColor: "rgb(var(--border))" }}>
            {legend.map((l, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                {formatInline(l)}
              </span>
            ))}
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-faint">{formatInline(caption)}</figcaption>
      )}
    </figure>
  );
}
