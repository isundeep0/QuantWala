import { useState } from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

/* "Latency numbers every low-latency engineer should know" — on a log scale,
   plus a tick-to-trade budget so the abstract nanoseconds become concrete. */

const OPS = [
  { label: "L1 cache reference", ns: 1, note: "≈ 1 ns. A few CPU cycles. Your hot data wants to live here." },
  { label: "Branch mispredict", ns: 3, note: "Flushes the pipeline — why branchless code matters on the hot path." },
  { label: "L2 cache reference", ns: 4, note: "Still cheap. Falling out of L1 already costs ~4×." },
  { label: "Mutex lock/unlock (uncontended)", ns: 17, note: "Uncontended is cheap; contended can cost microseconds." },
  { label: "L3 / last-level cache", ns: 40, note: "Shared across cores. A miss here means a trip to DRAM." },
  { label: "Main memory (DRAM) reference", ns: 100, note: "≈ 100 ns. ~100× slower than L1 — cache misses dominate." },
  { label: "Cross-socket (NUMA) memory", ns: 130, note: "Why you pin threads to the socket that owns their data." },
  { label: "Kernel-bypass NIC (wire→app)", ns: 1000, note: "≈ 1 µs with DPDK/Onload. The syscall path is ~10× worse." },
  { label: "Context switch", ns: 3000, note: "≈ 3 µs. Why HFT busy-polls on isolated cores instead of sleeping." },
  { label: "SSD random read", ns: 16000, note: "≈ 16 µs — never on the hot path." },
  { label: "Same-datacenter round trip", ns: 500000, note: "≈ 0.5 ms. Co-location shrinks this; cross-region is far worse." },
];

const TICK_TO_TRADE = [
  { label: "Photon arrives at NIC", ns: 0, cum: 0 },
  { label: "NIC → app (kernel bypass)", ns: 250, cum: 250 },
  { label: "Parse market-data message", ns: 60, cum: 310 },
  { label: "Update order book", ns: 50, cum: 360 },
  { label: "Strategy computes signal", ns: 80, cum: 440 },
  { label: "Pre-trade risk check", ns: 40, cum: 480 },
  { label: "Encode order → wire", ns: 70, cum: 550 },
  { label: "NIC sends order out", ns: 250, cum: 800 },
];

function fmt(ns) {
  if (ns < 1000) return `${ns} ns`;
  if (ns < 1_000_000) return `${(ns / 1000).toFixed(ns % 1000 ? 1 : 0)} µs`;
  return `${(ns / 1_000_000).toFixed(2)} ms`;
}

const MIN_LOG = 0; // log10(1ns)
const MAX_LOG = Math.log10(500000);

export default function LatencyLadderSim() {
  const [view, setView] = useState("ladder");
  const [active, setActive] = useState(null);
  const accent = "#8b5cf6";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border-strong))" }}>
          {[
            { k: "ladder", label: "Latency ladder" },
            { k: "budget", label: "Tick-to-trade budget" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setView(t.k)}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={view === t.k ? { backgroundColor: accent, color: "#fff" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-faint">Log scale · order-of-magnitude is what matters</span>
      </div>

      {view === "ladder" ? (
        <div className="space-y-1.5">
          {OPS.map((op, i) => {
            const log = Math.log10(op.ns);
            const pct = ((log - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100;
            const isActive = active === i;
            return (
              <button
                key={op.label}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="block w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-52 shrink-0 truncate text-xs sm:text-sm" title={op.label}>
                    {op.label}
                  </div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-md surface-sunken">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-md"
                      style={{
                        background: `linear-gradient(90deg, ${accent}66, ${accent})`,
                        boxShadow: isActive ? `0 0 12px ${accent}aa` : undefined,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, pct)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right font-mono text-xs font-semibold" style={{ color: accent }}>
                    {fmt(op.ns)}
                  </div>
                </div>
              </button>
            );
          })}
          <div className="mt-2 flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}>
            <Gauge className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
            <p className="text-sm leading-relaxed text-muted">
              {active != null ? OPS[active].note : "Hover a bar. The whole game is keeping work in the cheap end of this ladder — L1/L2 — and off the expensive end (DRAM misses, syscalls, the network)."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            A simplified <span className="font-semibold">tick-to-trade</span> path: from a market-data photon hitting
            the NIC to your order leaving it. Elite shops do this in well under a microsecond. Each stage spends part of
            the budget.
          </p>
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
            {TICK_TO_TRADE.filter((s) => s.ns > 0).map((s, i) => {
              const total = TICK_TO_TRADE[TICK_TO_TRADE.length - 1].cum;
              const pct = (s.ns / total) * 100;
              return (
                <div key={s.label} className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0" style={{ borderColor: "rgb(var(--border))" }}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: accent }}>
                    {i + 1}
                  </span>
                  <div className="w-44 shrink-0 truncate text-sm">{s.label}</div>
                  <div className="relative h-5 flex-1 overflow-hidden rounded surface-sunken">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded"
                      style={{ background: `linear-gradient(90deg, ${accent}66, ${accent})` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  </div>
                  <div className="w-20 shrink-0 text-right font-mono text-xs">
                    <span className="font-semibold" style={{ color: accent }}>+{s.ns}</span>
                    <span className="text-faint"> · {s.cum}ns</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between rounded-xl border p-3.5" style={{ borderColor: `${accent}44`, backgroundColor: `${accent}0d` }}>
            <span className="text-sm font-semibold">Total tick-to-trade</span>
            <span className="font-mono text-lg font-bold" style={{ color: accent }}>
              ~{fmt(TICK_TO_TRADE[TICK_TO_TRADE.length - 1].cum)}
            </span>
          </div>
          <p className="text-xs text-faint">
            Illustrative budget for a software path. FPGA "tick-to-trade" can be tens of nanoseconds by doing the parse,
            book, and order encode in hardware on the NIC itself.
          </p>
        </div>
      )}
    </div>
  );
}
