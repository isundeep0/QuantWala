import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const A = [1, 3, 5, 7];
const B = [2, 4, 6, 8, 9];

const PSEUDO = [
  "dummy → tail; while a and b:",
  "  if a.val <= b.val: tail.next = a; a = a.next",
  "  else:              tail.next = b; b = b.next",
  "  tail = tail.next",
  "tail.next = a or b   // attach the rest",
];

function buildFrames() {
  const frames = [];
  let i = 0;
  let j = 0;
  const merged = [];
  const snap = (explain, line, pick) => {
    const sa = {};
    const sb = {};
    for (let k = 0; k < i; k++) sa[k] = "discard";
    for (let k = 0; k < j; k++) sb[k] = "discard";
    if (pick === "a") sa[i] = "best";
    else if (pick === "b") sb[j] = "best";
    else {
      if (i < A.length) sa[i] = "active";
      if (j < B.length) sb[j] = "active";
    }
    frames.push({
      a: A,
      b: B,
      sa,
      sb,
      ai: i < A.length ? i : -1,
      bj: j < B.length ? j : -1,
      merged: [...merged],
      explain,
      line,
    });
  };

  snap("Two sorted lists. A 'tail' pointer always appends the smaller of the two front nodes.", 0);
  while (i < A.length && j < B.length) {
    if (A[i] <= B[j]) {
      snap(`A[${i}]=${A[i]} ≤ B[${j}]=${B[j]} → take ${A[i]} from A.`, 1, "a");
      merged.push(A[i]);
      i++;
    } else {
      snap(`B[${j}]=${B[j]} < A[${i}]=${A[i]} → take ${B[j]} from B.`, 2, "b");
      merged.push(B[j]);
      j++;
    }
    snap(`Appended. Merged so far: [${merged.join(", ")}].`, 3);
  }
  while (i < A.length) {
    merged.push(A[i]);
    i++;
  }
  while (j < B.length) {
    merged.push(B[j]);
    j++;
  }
  snap(`One list is exhausted — attach the remaining nodes directly. Result: [${merged.join(", ")}].`, 4);
  return frames;
}

export default function MergeListsSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#06b6d4"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted">List A = <span className="font-mono font-semibold text-[color:rgb(var(--text))]">{A.join(" → ")}</span></span>
          <span className="text-muted">List B = <span className="font-mono font-semibold text-[color:rgb(var(--text))]">{B.join(" → ")}</span></span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="front of list" />
          <LegendItem color="#10b981" label="chosen this step" />
          <LegendItem color="rgb(var(--bg-sunken))" label="consumed" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-faint">List A</span>
            <ArrayView array={f.a} states={f.sa} pointers={f.ai >= 0 ? [{ index: f.ai, label: "a", color: "#06b6d4" }] : []} cellSize={40} indices={false} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-faint">List B</span>
            <ArrayView array={f.b} states={f.sb} pointers={f.bj >= 0 ? [{ index: f.bj, label: "b", color: "#06b6d4" }] : []} cellSize={40} indices={false} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-faint">Merged</span>
            {f.merged.length ? (
              <ArrayView array={f.merged} states={f.merged.reduce((s, _, k) => ((s[k] = "sorted"), s), {})} cellSize={40} indices={false} />
            ) : (
              <span className="text-sm text-faint">∅</span>
            )}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
