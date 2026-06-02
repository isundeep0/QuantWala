import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, RotateCcw, Play } from "lucide-react";

/* Single-producer / single-consumer lock-free ring buffer. Producer advances
   `head`, consumer advances `tail`; the buffer is empty when head==tail and
   full when advancing head would hit tail. No locks — only the two indices are
   shared, each written by exactly one thread (hence release/acquire is enough). */

const CAP = 8;

export default function RingBufferSim() {
  const [slots, setSlots] = useState(Array(CAP).fill(null));
  const [head, setHead] = useState(0); // next write
  const [tail, setTail] = useState(0); // next read
  const [count, setCount] = useState(0);
  const [seq, setSeq] = useState(0);
  const [log, setLog] = useState([]);
  const accent = "#8b5cf6";

  const push = (n) => setLog((l) => [n, ...l].slice(0, 5));

  const produce = () => {
    if (count >= CAP) {
      push("Buffer FULL — producer must wait (or drop). head can't pass tail.");
      return;
    }
    const v = seq + 1;
    setSeq(v);
    setSlots((s) => {
      const c = [...s];
      c[head] = v;
      return c;
    });
    push(`Producer wrote ${v} at slot ${head}, then published head=${(head + 1) % CAP}.`);
    setHead((head + 1) % CAP);
    setCount((c) => c + 1);
  };

  const consume = () => {
    if (count <= 0) {
      push("Buffer EMPTY — consumer spins (busy-poll) until head moves.");
      return;
    }
    const v = slots[tail];
    setSlots((s) => {
      const c = [...s];
      c[tail] = null;
      return c;
    });
    push(`Consumer read ${v} from slot ${tail}, then published tail=${(tail + 1) % CAP}.`);
    setTail((tail + 1) % CAP);
    setCount((c) => c - 1);
  };

  const reset = () => {
    setSlots(Array(CAP).fill(null));
    setHead(0);
    setTail(0);
    setCount(0);
    setSeq(0);
    setLog([]);
  };

  const angleFor = (i) => (i / CAP) * 360 - 90;
  const R = 96;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={produce} className="btn-primary" style={{ backgroundColor: "#10b981" }}>
          <Plus className="h-4 w-4" /> Produce
        </button>
        <button onClick={consume} className="btn-primary" style={{ backgroundColor: "#0ea5e9" }}>
          <Minus className="h-4 w-4" /> Consume
        </button>
        <button
          onClick={() => {
            produce();
            setTimeout(produce, 120);
            setTimeout(produce, 240);
          }}
          className="btn-ghost"
        >
          <Play className="h-4 w-4" /> Burst ×3
        </button>
        <button onClick={reset} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        {/* Circular buffer */}
        <div className="relative grid place-items-center rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))", minHeight: 260 }}>
          <div className="relative" style={{ width: 240, height: 240 }}>
            {slots.map((v, i) => {
              const a = (angleFor(i) * Math.PI) / 180;
              const x = 120 + R * Math.cos(a);
              const y = 120 + R * Math.sin(a);
              const filled = v != null;
              const isHead = i === head;
              const isTail = i === tail;
              return (
                <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
                  <motion.div
                    animate={{ scale: filled ? 1 : 0.92 }}
                    className="grid h-11 w-11 place-items-center rounded-xl font-mono text-sm font-bold"
                    style={{
                      background: filled ? `${accent}22` : "rgb(var(--bg-sunken) / 0.5)",
                      color: filled ? accent : "rgb(var(--text-faint))",
                      outline: filled ? `1.5px solid ${accent}` : "1px solid rgb(var(--border))",
                    }}
                  >
                    {filled ? v : i}
                  </motion.div>
                  {(isHead || isTail) && (
                    <div className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold">
                      {isHead && <span className="text-emerald-500">head▲</span>}
                      {isHead && isTail && <span className="text-faint"> </span>}
                      {isTail && <span className="text-sky-500">tail▼</span>}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xs text-muted">in use</div>
              <div className="font-mono text-2xl font-bold" style={{ color: accent }}>
                {count}/{CAP}
              </div>
            </div>
          </div>
        </div>

        {/* Event log */}
        <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="mb-2 text-xs font-semibold text-muted">What just happened</div>
          {log.length === 0 ? (
            <p className="text-xs text-faint">
              Produce and consume to move the head and tail. The producer only writes <code>head</code>; the consumer
              only writes <code>tail</code>. Because each index has exactly one writer, you never need a lock — just the
              right memory ordering on publish.
            </p>
          ) : (
            <div className="space-y-1.5">
              {log.map((l, i) => (
                <motion.div
                  key={`${l}-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1 - i * 0.15, x: 0 }}
                  className="text-xs leading-relaxed text-muted"
                >
                  {l}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}>
        <span className="mt-0.5 text-lg leading-none" style={{ color: accent }}>
          ⚡
        </span>
        <p className="text-sm leading-relaxed text-muted">
          Fill it up until you hit <span className="font-semibold">FULL</span>, then drain to{" "}
          <span className="font-semibold">EMPTY</span>. The producer publishes the new <code>head</code> with a{" "}
          <span className="font-mono">store-release</span>; the consumer reads it with a{" "}
          <span className="font-mono">load-acquire</span> — that pairing guarantees the consumer sees the written data
          before it sees the moved index. This is the core of the LMAX Disruptor and almost every HFT inter-thread queue.
        </p>
      </div>
    </div>
  );
}
