import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "stack = []   // holds indices, values decreasing",
  "for i = 0 .. n-1:",
  "  while stack and a[stack.top] < a[i]:",
  "    ans[stack.pop()] = a[i]   // i is next greater",
  "  stack.push(i)",
  "remaining indices have no greater element → -1",
];

function buildFrames(a) {
  const n = a.length;
  const ans = new Array(n).fill(-1);
  const stack = [];
  const frames = [];
  const push = (i, explain, line, popped) => {
    const states = {};
    stack.forEach((idx) => (states[idx] = "window"));
    if (i < n) states[i] = "active";
    if (popped !== undefined) states[popped] = "match";
    frames.push({ array: a, states, stack: [...stack], ans: [...ans], explain, line });
  };

  push(0, "Next Greater Element: a monotonic (decreasing) stack of indices finds, for each element, the first larger one to its right.", 0);
  for (let i = 0; i < n; i++) {
    push(i, `Consider a[${i}]=${a[i]}. Pop everything smaller — they just found their next greater.`, 2);
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      const idx = stack.pop();
      ans[idx] = a[i];
      push(i, `a[${idx}]=${a[idx]} < ${a[i]} → next greater of index ${idx} is ${a[i]}. Pop it.`, 3, idx);
    }
    stack.push(i);
    push(i, `Push index ${i}. Stack stays decreasing by value.`, 4);
  }
  push(n, `Indices left on the stack have no greater element to the right → -1.`, 5);
  return frames;
}

export default function MonotonicStackSim() {
  const [a, setA] = useState([2, 1, 2, 4, 3, 1]);
  const frames = useMemo(() => buildFrames(a), [a]);
  const player = useStepPlayer(frames);
  const apply = (text) => {
    const arr = parseIntArray(text, { max: 12 });
    setA(arr.length ? arr : [1]);
    player.reset();
  };

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#14b8a6"
      pseudocode={PSEUDO}
      inputPanel={<ArrayInputBar arrayLabel="Array" defaultArray="2, 1, 2, 4, 3, 1" accent="#14b8a6" onApply={apply} />}
      legend={
        <>
          <LegendItem color="#2563eb" label="current i" />
          <LegendItem color="#2563eb22" label="on stack" />
          <LegendItem color="#10b981" label="resolved" />
        </>
      }
    >
      {player.frame && (
        <div className="flex w-full flex-col items-center gap-5">
          <ArrayView array={player.frame.array} states={player.frame.states} />
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-muted">stack (top →)</div>
            <div className="flex gap-1.5">
              <AnimatePresence>
                {player.frame.stack.map((idx) => (
                  <motion.span
                    key={idx}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid h-9 w-9 place-items-center rounded-md bg-brand-500/20 font-mono text-sm font-semibold text-brand-500"
                  >
                    {player.frame.array[idx]}
                  </motion.span>
                ))}
              </AnimatePresence>
              {player.frame.stack.length === 0 && <span className="text-sm text-faint">empty</span>}
            </div>
          </div>
          <div className="font-mono text-xs text-muted">
            answer: [{player.frame.ans.join(", ")}]
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
