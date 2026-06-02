import { AlertTriangle, Clock, HardDrive } from "lucide-react";
import CodeTabs from "@/components/CodeTabs.jsx";

export default function LogicStep({ data }) {
  if (!data) return <p className="text-muted">Logic breakdown is being written for this lesson.</p>;
  // Support both the new `codes` array (multi-language) and the legacy single `code`.
  const codeBlocks = data.codes?.length ? data.codes : data.code ? [data.code] : [];
  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {(data.steps || []).map((s, i) => (
          <li key={i} className="flex gap-4 rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <div className="font-semibold">{s.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {codeBlocks.length > 0 && <CodeTabs blocks={codeBlocks} />}

      {data.complexity && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-brand-500" /> Time —{" "}
              <span className="font-mono text-brand-600 dark:text-brand-400">{data.complexity.time}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{data.complexity.timeReason}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HardDrive className="h-4 w-4 text-emerald-500" /> Space —{" "}
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{data.complexity.space}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{data.complexity.spaceReason}</p>
          </div>
        </div>
      )}

      {data.pitfalls?.length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: "#f59e0b44", backgroundColor: "#f59e0b0d" }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Common pitfalls
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
