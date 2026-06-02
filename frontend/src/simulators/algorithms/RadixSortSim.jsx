import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const INPUT = [170, 45, 75, 90, 802, 24, 2, 66];

const PSEUDO = [
  "for exp = 1, 10, 100, ... up to max:",
  "  buckets[0..9] = []",
  "  for x in a: buckets[(x / exp) % 10].push(x)",
  "  a = concat(buckets[0], ..., buckets[9])   // stable",
];

function buildFrames() {
  let a = [...INPUT];
  const mx = Math.max(...a);
  const frames = [];
  const snap = (buckets, active, explain, line, digit) =>
    frames.push({ a: [...a], buckets: buckets.map((b) => [...b]), active, explain, line, digit });

  snap(Array.from({ length: 10 }, () => []), -1, "LSD radix sort: stably sort by the ones digit, then tens, then hundreds. Each pass uses 10 buckets.", 0);
  for (let exp = 1; mx / exp >= 1; exp *= 10) {
    const place = exp === 1 ? "ones" : exp === 10 ? "tens" : "hundreds";
    const buckets = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < a.length; i++) {
      const d = Math.floor(a[i] / exp) % 10;
      buckets[d].push(a[i]);
      snap(buckets, i, `${place} digit of ${a[i]} is ${d} → drop it into bucket ${d}.`, 2, exp);
    }
    a = [].concat(...buckets);
    snap(buckets, -1, `Collect buckets 0→9 in order: array is now [${a.join(", ")}], sorted by its ${place} digit.`, 3, exp);
  }
  snap(Array.from({ length: 10 }, () => []), -1, `All digit positions processed → fully sorted: [${a.join(", ")}].`, 0);
  return frames;
}

export default function RadixSortSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#2563eb"
      pseudocode={PSEUDO}
      inputPanel={<div className="text-sm text-muted">array = <span className="font-mono font-semibold text-[color:rgb(var(--text))]">[{INPUT.join(", ")}]</span></div>}
      legend={
        <>
          <LegendItem color="#f59e0b" label="element being bucketed" />
          <LegendItem color="#10b981" label="sorted output" />
        </>
      }
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-5">
          <ArrayView array={f.a} states={f.active >= 0 ? { [f.active]: "mid" } : {}} pointers={f.active >= 0 ? [{ index: f.active, label: "x", color: "#f59e0b" }] : []} cellSize={46} indices={false} />
          <div className="grid w-full max-w-[560px] grid-cols-10 gap-1.5">
            {f.buckets.map((b, d) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-faint">{d}</span>
                <div className="flex min-h-[60px] w-full flex-col items-center gap-1 rounded-lg surface-sunken p-1">
                  {b.map((v, i) => (
                    <span key={i} className="w-full rounded bg-brand-500/15 py-0.5 text-center font-mono text-[10px] text-brand-600 dark:text-brand-400">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
