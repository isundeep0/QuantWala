import { Zap } from "lucide-react";

export default function DryRunStep({ data }) {
  if (!data) return <p className="text-muted">A dry run walkthrough is being written for this lesson.</p>;
  const cols = data.columns || ["Step", "State", "Note"];
  return (
    <div className="space-y-5">
      {data.input && (
        <div className="rounded-xl surface-sunken p-4 font-mono text-sm">
          <span className="text-faint">input&nbsp;</span>
          {data.input}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="surface-sunken text-left">
              {cols.map((c, i) => (
                <th key={i} className="px-4 py-2.5 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.rows || []).map((row, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "rgb(var(--border))" }}>
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 py-2.5 align-top ${j === 1 ? "font-mono text-[13px]" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.clickMoment && (
        <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "#10b98144", backgroundColor: "#10b9810d" }}>
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              The moment it clicks
            </div>
            <p className="mt-1 leading-relaxed">{data.clickMoment}</p>
          </div>
        </div>
      )}
    </div>
  );
}
