import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "sum = sum of first k elements",
  "best = sum",
  "for r = k .. n-1:",
  "  sum += a[r]        // add entering element",
  "  sum -= a[r - k]    // remove leaving element",
  "  best = max(best, sum)",
  "return best",
];

function buildFrames(a, k) {
  const frames = [];
  const n = a.length;
  k = Math.max(1, Math.min(k, n));

  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum;

  const windowStates = (l, r, extra = {}) => {
    const states = {};
    for (let i = l; i <= r; i++) states[i] = "window";
    return { ...states, ...extra };
  };

  frames.push({
    array: a,
    states: windowStates(0, k - 1),
    pointers: [
      { index: 0, label: "L", color: "#0ea5e9" },
      { index: k - 1, label: "R", color: "#8b5cf6" },
    ],
    explain: `Build the first window of size k=${k}. Its sum is ${sum}. This is our current best.`,
    line: 0,
    meta: { sum, best },
  });

  for (let r = k; r < n; r++) {
    const l = r - k + 1;
    sum += a[r];
    sum -= a[r - k];
    const prevBest = best;
    best = Math.max(best, sum);
    frames.push({
      array: a,
      states: windowStates(l, r, { [r]: "match", [r - k]: "discard" }),
      pointers: [
        { index: l, label: "L", color: "#0ea5e9" },
        { index: r, label: "R", color: "#8b5cf6" },
      ],
      explain:
        `Slide right: add a[${r}]=${a[r]}, drop a[${r - k}]=${a[r - k]}. ` +
        `Window sum = ${sum}. ` +
        (best > prevBest ? `New best = ${best}!` : `Best stays ${best}.`),
      line: 5,
      meta: { sum, best },
    });
  }

  frames.push({
    array: a,
    states: {},
    pointers: [],
    explain: `Every window was checked in a single pass. Maximum window sum = ${best}.`,
    line: 6,
    meta: { sum, best },
  });

  return frames;
}

export default function SlidingWindowSim() {
  const [input, setInput] = useState({ array: [2, 1, 5, 1, 3, 2, 7, 1], k: 3 });
  const frames = useMemo(() => buildFrames(input.array, input.k), [input]);
  const player = useStepPlayer(frames);

  const apply = (text, scalar) => {
    const arr = parseIntArray(text);
    const k = parseInt(scalar, 10);
    setInput({ array: arr.length ? arr : [1], k: Number.isFinite(k) ? k : 3 });
    player.reset();
  };

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#2563eb"
      pseudocode={PSEUDO}
      inputPanel={
        <ArrayInputBar
          arrayLabel="Array"
          defaultArray="2, 1, 5, 1, 3, 2, 7, 1"
          scalarLabel="Window k"
          defaultScalar="3"
          onApply={apply}
        />
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="window" />
          <LegendItem color="#10b981" label="entering" />
          <LegendItem color="rgb(var(--border-strong))" label="leaving" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-5">
          <ArrayView
            array={player.frame.array}
            states={player.frame.states}
            pointers={player.frame.pointers}
          />
          <div className="flex gap-6 font-mono text-sm">
            <div className="rounded-lg surface-sunken px-4 py-2">
              window sum = <span className="font-bold text-brand-500">{player.frame.meta.sum}</span>
            </div>
            <div className="rounded-lg surface-sunken px-4 py-2">
              best = <span className="font-bold text-emerald-500">{player.frame.meta.best}</span>
            </div>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
