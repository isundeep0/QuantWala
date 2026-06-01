import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "tails = []   // tails[k] = smallest tail of an LIS of length k+1",
  "for x in a:",
  "  pos = first index in tails with tails[pos] >= x",
  "  if pos == len(tails): tails.push(x)   // extend",
  "  else: tails[pos] = x                  // improve",
  "answer = len(tails)",
];

function lowerBound(arr, x) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function buildFrames(a) {
  const frames = [];
  const tails = [];
  const push = (i, explain, line, tstate = {}) => {
    const states = {};
    if (i >= 0 && i < a.length) states[i] = "active";
    frames.push({ array: a, states, tails: [...tails], tailStates: tstate, explain, line });
  };
  push(-1, "Patience method: keep the smallest possible tail for each achievable LIS length.", 0);
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const pos = lowerBound(tails, x);
    if (pos === tails.length) {
      tails.push(x);
      push(i, `${x}: bigger than all tails → extend the longest chain. tails length now ${tails.length}.`, 3, { [pos]: "found" });
    } else {
      const old = tails[pos];
      tails[pos] = x;
      push(i, `${x}: replaces ${old} at position ${pos} (keeps tails minimal for future growth).`, 4, { [pos]: "swap" });
    }
  }
  push(-1, `Length of Longest Increasing Subsequence = ${tails.length}.`, 5);
  return frames;
}

export default function LISSim() {
  const [a, setA] = useState([10, 9, 2, 5, 3, 7, 101, 18]);
  const frames = useMemo(() => buildFrames(a), [a]);
  const player = useStepPlayer(frames);
  const apply = (text) => {
    const arr = parseIntArray(text, { max: 14 });
    setA(arr.length ? arr : [1]);
    player.reset();
  };
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#f59e0b"
      pseudocode={PSEUDO}
      inputPanel={<ArrayInputBar arrayLabel="Array" defaultArray="10, 9, 2, 5, 3, 7, 101, 18" accent="#f59e0b" onApply={apply} />}
      legend={
        <>
          <LegendItem color="#2563eb" label="current element" />
          <LegendItem color="#10b981" label="extend" />
          <LegendItem color="#ec4899" label="replace" />
        </>
      }
    >
      {player.frame && (
        <div className="flex w-full flex-col items-center gap-5">
          <ArrayView array={player.frame.array} states={player.frame.states} />
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-faint">tails (LIS length = {player.frame.tails.length})</div>
            <ArrayView array={player.frame.tails.length ? player.frame.tails : [" "]} states={player.frame.tailStates} indices={false} cellSize={40} />
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
