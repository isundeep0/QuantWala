import { AlertTriangle, Clock, HardDrive, StickyNote } from "lucide-react";
import CodeTabs from "@/components/CodeTabs.jsx";

export default function DeepDiveStep({ data, accent = "#10b981" }) {
  if (!data) return <p className="text-muted">The deep dive is being written for this lesson.</p>;
  const codeBlocks = data.codes?.length ? data.codes : data.code ? [data.code] : [];

  return (
    <div className="space-y-6">
      {data.intro && <p className="leading-relaxed text-[15px] text-muted">{data.intro}</p>}

      {data.steps?.length > 0 && (
        <ol className="space-y-3">
          {data.steps.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {i + 1}
              </span>
              <div>
                <div className="font-semibold">{s.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {codeBlocks.length > 0 && <CodeTabs blocks={codeBlocks} />}

      {data.notes?.length > 0 && (
        <div className="space-y-3">
          {data.notes.map((n, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border p-4"
              style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0a` }}
            >
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
              <div>
                {n.title && <div className="text-sm font-semibold">{n.title}</div>}
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{n.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.complexity && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" style={{ color: accent }} /> {data.complexity.timeLabel || "Time"} —{" "}
              <span className="font-mono" style={{ color: accent }}>{data.complexity.time}</span>
            </div>
            {data.complexity.timeReason && (
              <p className="mt-2 text-sm text-muted">{data.complexity.timeReason}</p>
            )}
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HardDrive className="h-4 w-4 text-emerald-500" /> {data.complexity.spaceLabel || "Space"} —{" "}
              <span className="font-mono text-emerald-500">{data.complexity.space}</span>
            </div>
            {data.complexity.spaceReason && (
              <p className="mt-2 text-sm text-muted">{data.complexity.spaceReason}</p>
            )}
          </div>
        </div>
      )}

      {data.pitfalls?.length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: "#f59e0b44", backgroundColor: "#f59e0b0d" }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Common pitfalls &amp; gotchas
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {data.pitfalls.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
