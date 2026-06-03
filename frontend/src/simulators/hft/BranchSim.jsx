import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

/* Branch prediction: process an array and sum elements >= 128. A 2-bit
   saturating predictor learns the branch. On SORTED data the branch is
   taken in a long run then never — easy to predict (~0 mispredicts). On
   RANDOM data it's a coin flip — ~50% mispredicts, each flushing the pipeline.
   The branchless version removes the branch entirely. */

const N = 32;
const MISPREDICT_NS = 3;
const BASE_NS = 1;

function buildData(mode) {
  const a = Array.from({ length: N }, () => Math.floor(Math.random() * 256));
  if (mode === "sorted") a.sort((x, y) => x - y);
  return a;
}

// 2-bit saturating counter: 0,1 = predict not-taken; 2,3 = predict taken.
function simulate(data, branchless) {
  let state = 1;
  let mispredicts = 0;
  const trace = [];
  for (const v of data) {
    const taken = v >= 128;
    if (branchless) {
      trace.push({ v, taken, mis: false });
      continue;
    }
    const predictTaken = state >= 2;
    const mis = predictTaken !== taken;
    if (mis) mispredicts++;
    state = taken ? Math.min(3, state + 1) : Math.max(0, state - 1);
    trace.push({ v, taken, mis });
  }
  const ns = N * BASE_NS + mispredicts * MISPREDICT_NS;
  return { trace, mispredicts, ns };
}

export default function BranchSim() {
  const [mode, setMode] = useState("random");
  const [branchless, setBranchless] = useState(false);
  const [data, setData] = useState(() => buildData("random"));
  const [revealed, setRevealed] = useState(false);
  const accent = "#8b5cf6";

  const { trace, mispredicts, ns } = useMemo(
    () => simulate(data, branchless),
    [data, branchless],
  );

  const regen = (m) => {
    setMode(m);
    setData(buildData(m));
    setRevealed(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border-strong))" }}>
          {[
            { k: "random", label: "Random data" },
            { k: "sorted", label: "Sorted data" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => regen(t.k)}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={mode === t.k ? { backgroundColor: accent, color: "#fff" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={branchless} onChange={(e) => setBranchless(e.target.checked)} className="accent-violet-500" />
          Branchless version
        </label>
        <button onClick={() => setRevealed(true)} className="btn-primary" style={{ backgroundColor: accent }}>
          <Play className="h-4 w-4" /> Run predictor
        </button>
        <button onClick={() => regen(mode)} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> New data
        </button>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="mb-2 text-xs text-muted">
          <code>if (v &gt;= 128) sum += v;</code> · green = branch outcome predicted correctly, red = mispredict (pipeline flush)
        </div>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-16">
          {trace.map((c, i) => {
            let bg = "rgb(var(--bg-sunken) / 0.5)";
            let color = "rgb(var(--text-faint))";
            if (revealed) {
              if (branchless) {
                bg = `${accent}18`;
                color = accent;
              } else if (c.mis) {
                bg = "#ef444433";
                color = "#ef4444";
              } else {
                bg = "#10b98122";
                color = "#10b981";
              }
            }
            return (
              <motion.div
                key={i}
                initial={false}
                animate={revealed ? { scale: [0.9, 1] } : {}}
                transition={{ delay: revealed ? i * 0.01 : 0 }}
                className="grid aspect-square place-items-center rounded font-mono text-[10px]"
                style={{ background: bg, color, outline: "1px solid rgb(var(--border))" }}
                title={`v=${c.v}, ${c.taken ? "taken" : "not taken"}`}
              >
                {c.v}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Mispredicts", value: branchless ? "0" : revealed ? mispredicts : "—", color: "#ef4444" },
          {
            label: "Mispredict rate",
            value: branchless ? "0%" : revealed ? `${Math.round((mispredicts / N) * 100)}%` : "—",
            color: accent,
          },
          { label: "Est. cost", value: revealed ? `${ns} ns` : "—", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-3 text-center" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-0.5 font-mono text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}>
        <span className="mt-0.5 text-lg leading-none" style={{ color: accent }}>
          ⚡
        </span>
        <p className="text-sm leading-relaxed text-muted">
          Run on <span className="font-semibold">random</span> data: ~50% mispredicts. Switch to{" "}
          <span className="font-semibold">sorted</span> data and re-run: the predictor learns the long run of
          not-taken then taken, dropping near 0%. This is the famous Stack Overflow result — sorting the array first
          makes the same loop run several times faster. Now tick <span className="font-semibold">branchless</span>:
          rewriting it as <code>sum += (v &gt;= 128) * v;</code> removes the branch entirely, so data order stops
          mattering. On the HFT hot path you make the critical branches predictable or eliminate them.
        </p>
      </div>
    </div>
  );
}
