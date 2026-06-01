import { cn } from "@/lib/cn.js";

export default function Pseudocode({ lines = [], activeLine = -1, accent = "#2563eb" }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
      <div
        className="flex items-center gap-2 border-b px-3 py-2 text-xs font-semibold text-muted"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        Pseudocode
      </div>
      <pre className="overflow-x-auto p-2 font-mono text-[12.5px] leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 rounded-md px-2 py-0.5 transition-colors",
              i === activeLine && "font-semibold",
            )}
            style={
              i === activeLine
                ? { backgroundColor: `${accent}1f`, color: "rgb(var(--text))" }
                : undefined
            }
          >
            <span className="select-none text-faint">{String(i + 1).padStart(2, " ")}</span>
            <span className="whitespace-pre text-muted" style={i === activeLine ? { color: "rgb(var(--text))" } : undefined}>
              {line}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
