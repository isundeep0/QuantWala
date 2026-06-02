import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const A = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;

const PSEUDO = [
  "for i in 0..n-1:",
  "  if dq.front <= i-k: dq.popFront()   // expire",
  "  while dq and a[dq.back] <= a[i]: dq.popBack()",
  "  dq.pushBack(i)",
  "  if i >= k-1: output a[dq.front]      // window max",
];

function buildFrames() {
  const dq = []; // indices, values decreasing
  const out = [];
  const frames = [];
  const snap = (i, explain, line) => {
    const states = {};
    if (i >= K - 1) for (let w = i - K + 1; w <= i; w++) states[w] = "window";
    states[i] = "active";
    if (dq.length) states[dq[0]] = "best";
    frames.push({ a: A, states, i, dq: [...dq], out: [...out], explain, line });
  };

  snap(0, "Sliding-window maximum. A deque keeps candidate indices with strictly decreasing values; its front is always the window's max.", 0);
  for (let i = 0; i < A.length; i++) {
    if (dq.length && dq[0] <= i - K) {
      const ex = dq.shift();
      snap(i, `Index ${ex} fell out of the window [${i - K + 1}, ${i}] → pop it from the front.`, 1);
    }
    while (dq.length && A[dq[dq.length - 1]] <= A[i]) {
      const popped = dq.pop();
      snap(i, `a[${i}]=${A[i]} ≥ a[${popped}]=${A[popped]} → ${A[popped]} can never be a future max, pop from back.`, 2);
    }
    dq.push(i);
    snap(i, `Push index ${i} (value ${A[i]}). Deque holds indices ${dq.join(", ")}.`, 3);
    if (i >= K - 1) {
      out.push(A[dq[0]]);
      snap(i, `Window [${i - K + 1}, ${i}] complete → max = a[${dq[0]}] = ${A[dq[0]]}.`, 4);
    }
  }
  snap(A.length - 1, `Window maxima: [${out.join(", ")}]. Each index is pushed and popped once → O(n).`, 0);
  return frames;
}

export default function DequeTricksSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#14b8a6"
      pseudocode={PSEUDO}
      inputPanel={<div className="text-sm text-muted">array = <span className="font-mono font-semibold text-[color:rgb(var(--text))]">[{A.join(", ")}]</span>, window k = <span className="font-mono font-semibold text-[color:rgb(var(--text))]">{K}</span></div>}
      legend={
        <>
          <LegendItem color="#2563eb" label="current i" />
          <LegendItem color="#2563eb22" label="window" />
          <LegendItem color="#10b981" label="deque front = max" />
        </>
      }
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-4">
          <ArrayView array={f.a} states={f.states} pointers={[{ index: f.i, label: "i", color: "#14b8a6" }]} cellSize={42} />
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-muted">deque (idx:val):</span>
            {f.dq.length ? (
              f.dq.map((idx, p) => (
                <span key={p} className={`rounded px-2 py-1 ${p === 0 ? "bg-emerald-500 text-white" : "surface-sunken text-muted"}`}>
                  {idx}:{f.a[idx]}
                </span>
              ))
            ) : (
              <span className="text-faint">empty</span>
            )}
          </div>
          <div className="font-mono text-sm">
            <span className="text-muted">maxima: </span>
            <span className="font-bold text-teal-500">[{f.out.join(", ")}]</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
