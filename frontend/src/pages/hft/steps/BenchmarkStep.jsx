import { BarChart3, Zap } from "lucide-react";

// Renders a latency / trade-off comparison table. Rows may flag a `best` cell
// (the winning approach) which is highlighted with the section accent.
export default function BenchmarkStep({ data, accent = "#10b981" }) {
  if (!data) return <p className="text-muted">Benchmark data is being assembled for this lesson.</p>;
  const cols = data.columns || ["Approach", "p50", "p99", "Notes"];

  return (
    <div className="space-y-5">
      {data.intro && (
        <div className="flex items-start gap-3 rounded-xl surface-sunken p-4">
          <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
          <p className="text-sm leading-relaxed text-muted">{data.intro}</p>
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
            {(data.rows || []).map((row, i) => {
              const cells = Array.isArray(row) ? row : row.cells;
              const best = !Array.isArray(row) && row.best;
              return (
                <tr
                  key={i}
                  className="border-t"
                  style={{
                    borderColor: "rgb(var(--border))",
                    backgroundColor: best ? `${accent}12` : undefined,
                  }}
                >
                  {cells.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 align-top ${j > 0 && j < cols.length - 1 ? "font-mono text-[13px]" : ""}`}
                    >
                      {j === 0 && best && (
                        <span className="mr-1.5 align-middle" style={{ color: accent }}>
                          ★
                        </span>
                      )}
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.note && <p className="text-xs text-faint">{data.note}</p>}

      {data.takeaway && (
        <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: `${accent}44`, backgroundColor: `${accent}0d` }}>
          <Zap className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
              The takeaway
            </div>
            <p className="mt-1 leading-relaxed">{data.takeaway}</p>
          </div>
        </div>
      )}
    </div>
  );
}
