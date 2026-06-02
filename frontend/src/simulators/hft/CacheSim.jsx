import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

/* Cache-friendly vs cache-hostile access. A flat array of 64 ints, cache line
   holds 8 ints. Sequential access amortises one DRAM miss over 8 elements;
   random access misses almost every time. The running "cost" makes the 10–100×
   penalty of poor locality visceral. */

const N = 64;
const LINE = 8;
const HIT_NS = 1; // L1
const MISS_NS = 100; // DRAM

function buildOrder(mode) {
  const idx = Array.from({ length: N }, (_, i) => i);
  if (mode === "sequential") return idx;
  if (mode === "strided") {
    const out = [];
    for (let s = 0; s < LINE; s++) for (let i = s; i < N; i += LINE) out.push(i);
    return out;
  }
  // random
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export default function CacheSim() {
  const [mode, setMode] = useState("sequential");
  const [order, setOrder] = useState(() => buildOrder("sequential"));
  const [step, setStep] = useState(-1);
  const accent = "#8b5cf6";

  // Replay the access trace up to `step`, computing per-cell status + totals.
  const { status, hits, misses, ns } = useMemo(() => {
    const cached = new Set(); // resident cache lines
    const status = {}; // index -> 'hit' | 'miss'
    let hits = 0;
    let misses = 0;
    let ns = 0;
    for (let k = 0; k <= step && k < order.length; k++) {
      const i = order[k];
      const line = Math.floor(i / LINE);
      if (cached.has(line)) {
        status[i] = "hit";
        hits++;
        ns += HIT_NS;
      } else {
        status[i] = "miss";
        misses++;
        ns += MISS_NS;
        cached.add(line); // whole line is pulled in
      }
    }
    return { status, hits, misses, ns };
  }, [order, step]);

  const current = step >= 0 && step < order.length ? order[step] : null;
  const done = step >= order.length - 1;
  const total = hits + misses;
  const hitRate = total ? Math.round((hits / total) * 100) : 0;

  const setModeAndReset = (m) => {
    setMode(m);
    setOrder(buildOrder(m));
    setStep(-1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border-strong))" }}>
          {[
            { k: "sequential", label: "Sequential" },
            { k: "strided", label: "Strided" },
            { k: "random", label: "Random" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setModeAndReset(t.k)}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={mode === t.k ? { backgroundColor: accent, color: "#fff" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setStep((s) => Math.min(s + 1, order.length - 1))} disabled={done} className="btn-primary disabled:opacity-40" style={{ backgroundColor: accent }}>
          <Play className="h-4 w-4" /> Access next
        </button>
        <button onClick={() => setStep(order.length - 1)} disabled={done} className="btn-ghost disabled:opacity-40">
          Run all
        </button>
        <button onClick={() => setStep(-1)} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      {/* Memory grid — each row is one cache line (8 ints / 64 bytes). */}
      <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="mb-2 text-xs text-muted">
          64-element array · each row = one 64-byte cache line ·{" "}
          <span className="font-mono" style={{ color: accent }}>blue</span> = pulled into cache as a whole line
        </div>
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: N }, (_, i) => {
            const st = status[i];
            const isCurrent = i === current;
            let bg = "transparent";
            let color = "rgb(var(--text-faint))";
            if (st === "hit") {
              bg = "#10b98122";
              color = "#10b981";
            } else if (st === "miss") {
              bg = `${accent}33`;
              color = accent;
            }
            return (
              <motion.div
                key={i}
                animate={isCurrent ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                className="grid aspect-square place-items-center rounded font-mono text-[10px]"
                style={{
                  background: bg,
                  color,
                  outline: isCurrent ? `2px solid ${accent}` : "1px solid rgb(var(--border))",
                }}
              >
                {i}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Hits (L1)", value: hits, color: "#10b981" },
          { label: "Misses (DRAM)", value: misses, color: accent },
          { label: "Hit rate", value: `${hitRate}%`, color: "rgb(var(--text))" },
          { label: "Est. cost", value: `${ns} ns`, color: "#f59e0b" },
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
          Run all three modes to the end and compare <span className="font-semibold">Est. cost</span>. Sequential
          touches each cache line once (8 misses, 56 hits); random misses almost every access (~64 misses). Same work,
          same data — but a <span className="font-semibold">~10× difference</span> purely from access order. This is why
          HFT code favours flat, contiguous, struct-of-arrays layouts over pointer-chasing.
        </p>
      </div>
    </div>
  );
}
