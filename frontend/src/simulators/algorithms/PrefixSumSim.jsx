import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "pre[0] = 0",
  "for i = 1 .. n:",
  "  pre[i] = pre[i-1] + a[i-1]",
  "// range sum [l, r] = pre[r+1] - pre[l]",
];

function buildFrames(a, l, r) {
  const n = a.length;
  const pre = new Array(n + 1).fill(0);
  const frames = [];
  const push = (arr, states, explain, line, pointers = []) =>
    frames.push({ array: arr, states, explain, line, pointers });

  push(a, {}, "We'll precompute prefix sums so any range sum is O(1) afterwards.", 0);
  for (let i = 1; i <= n; i++) {
    pre[i] = pre[i - 1] + a[i - 1];
    const states = {};
    for (let k = 0; k < i; k++) states[k] = "window";
    states[i - 1] = "active";
    push(a, states, `pre[${i}] = pre[${i - 1}] + a[${i - 1}] = ${pre[i - 1]} + ${a[i - 1]} = ${pre[i]}.`, 2);
  }

  // show prefix array
  push(pre, Object.fromEntries(pre.map((_, i) => [i, "sorted"])), "Prefix array built. pre[i] = sum of first i elements.", 0);

  // query
  const ll = Math.max(0, Math.min(l, n - 1));
  const rr = Math.max(ll, Math.min(r, n - 1));
  const qStates = {};
  qStates[rr + 1] = "match";
  qStates[ll] = "discard";
  push(pre, qStates, `Range sum [${ll}, ${rr}] = pre[${rr + 1}] - pre[${ll}] = ${pre[rr + 1]} - ${pre[ll]} = ${pre[rr + 1] - pre[ll]}.`, 3);
  return frames;
}

export default function PrefixSumSim() {
  const [input, setInput] = useState({ array: [3, 1, 4, 1, 5, 9, 2, 6], range: [2, 5] });
  const frames = useMemo(() => buildFrames(input.array, input.range[0], input.range[1]), [input]);
  const player = useStepPlayer(frames);
  const apply = (text, scalar) => {
    const arr = parseIntArray(text);
    const [l, r] = (scalar || "2-5").split(/[-,\s]+/).map((x) => parseInt(x, 10));
    setInput({ array: arr.length ? arr : [1], range: [Number.isFinite(l) ? l : 0, Number.isFinite(r) ? r : 0] });
    player.reset();
  };
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#0ea5e9"
      pseudocode={PSEUDO}
      inputPanel={
        <ArrayInputBar arrayLabel="Array" defaultArray="3, 1, 4, 1, 5, 9, 2, 6" scalarLabel="Query l-r" defaultScalar="2-5" accent="#0ea5e9" onApply={apply} />
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="accumulating" />
          <LegendItem color="#10b981" label="pre[r+1]" />
          <LegendItem color="rgb(var(--border-strong))" label="pre[l]" />
        </>
      }
    >
      {player.frame && <ArrayView array={player.frame.array} states={player.frame.states} />}
    </SimulatorShell>
  );
}
