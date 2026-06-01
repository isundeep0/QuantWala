import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import BarsView from "../views/BarsView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = {
  merge: [
    "mergeSort(l, r):",
    "  if l == r: return",
    "  m = (l + r) / 2",
    "  mergeSort(l, m); mergeSort(m+1, r)",
    "  merge two halves into sorted order",
  ],
  quick: [
    "quickSort(l, r):",
    "  if l >= r: return",
    "  pivot = a[r]",
    "  partition: smaller left, larger right",
    "  place pivot; recurse on both sides",
  ],
  counting: [
    "find max value M",
    "count[v] += 1 for each value v",
    "prefix-sum the counts",
    "place each value at its counted slot",
  ],
};

function mergeFrames(input) {
  const a = [...input];
  const frames = [];
  const push = (states, explain, line) =>
    frames.push({ array: [...a], states: { ...states }, line, explain });

  push({}, "Merge sort splits the array in half repeatedly, then merges sorted halves.", 0);

  function sort(l, r) {
    if (l >= r) return;
    const m = (l + r) >> 1;
    const seg = {};
    for (let i = l; i <= r; i++) seg[i] = "window";
    push(seg, `Divide [${l}..${r}] at midpoint ${m}.`, 2);
    sort(l, m);
    sort(m + 1, r);
    // merge
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0;
    let j = 0;
    let k = l;
    while (i < left.length && j < right.length) {
      const states = {};
      for (let t = l; t <= r; t++) states[t] = "window";
      states[k] = "compare";
      if (left[i] <= right[j]) {
        a[k] = left[i++];
      } else {
        a[k] = right[j++];
      }
      push(states, `Merge [${l}..${r}]: pick the smaller front element into position ${k}.`, 4);
      k++;
    }
    while (i < left.length) {
      a[k++] = left[i++];
    }
    while (j < right.length) {
      a[k++] = right[j++];
    }
    const done = {};
    for (let t = l; t <= r; t++) done[t] = "sorted";
    push(done, `Segment [${l}..${r}] is now sorted.`, 4);
  }
  sort(0, a.length - 1);
  const all = {};
  for (let i = 0; i < a.length; i++) all[i] = "sorted";
  push(all, `Fully sorted in O(n log n) time, O(n) extra space.`, 4);
  return frames;
}

function quickFrames(input) {
  const a = [...input];
  const frames = [];
  const push = (states, explain, line) =>
    frames.push({ array: [...a], states: { ...states }, line, explain });

  push({}, "Quick sort picks a pivot and partitions values around it, then recurses.", 0);

  function sort(l, r) {
    if (l >= r) {
      if (l === r) push({ [l]: "sorted" }, `Single element at ${l} is sorted.`, 1);
      return;
    }
    const pivot = a[r];
    let i = l;
    push({ [r]: "pivot" }, `Choose pivot = a[${r}] = ${pivot}. Partition [${l}..${r}].`, 2);
    for (let j = l; j < r; j++) {
      const states = { [r]: "pivot", [j]: "compare", [i]: "min" };
      push(states, `Compare a[${j}]=${a[j]} with pivot ${pivot}.`, 3);
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        push({ [r]: "pivot", [i]: "swap", [j]: "swap" }, `a[${j}] < pivot → swap into the "smaller" region at ${i}.`, 3);
        i++;
      }
    }
    [a[i], a[r]] = [a[r], a[i]];
    push({ [i]: "sorted" }, `Place pivot at its final index ${i}. Everything left is smaller.`, 4);
    sort(l, i - 1);
    sort(i + 1, r);
  }
  sort(0, a.length - 1);
  const all = {};
  for (let i = 0; i < a.length; i++) all[i] = "sorted";
  push(all, "Sorted! Average O(n log n); worst case O(n²) with bad pivots.", 4);
  return frames;
}

function countingFrames(input) {
  const a = [...input].map((x) => Math.max(0, x));
  const frames = [];
  const M = Math.max(0, ...a);
  const count = new Array(M + 1).fill(0);
  const push = (states, explain, line, extra) =>
    frames.push({ array: [...a], states: { ...states }, line, explain, count: [...count], ...extra });

  push({}, `Counting sort: tally how many times each value 0..${M} occurs.`, 0);
  for (let i = 0; i < a.length; i++) {
    count[a[i]]++;
    push({ [i]: "active" }, `count[${a[i]}] += 1 (saw value ${a[i]}).`, 1);
  }
  const out = [];
  for (let v = 0; v <= M; v++) {
    for (let c = 0; c < count[v]; c++) out.push(v);
  }
  for (let i = 0; i < out.length; i++) a[i] = out[i];
  const all = {};
  for (let i = 0; i < a.length; i++) all[i] = "sorted";
  push(all, `Emit values in order using the counts. O(n + M) time — no comparisons!`, 3);
  return frames;
}

const BUILDERS = { merge: mergeFrames, quick: quickFrames, counting: countingFrames };

export default function SortingSim({ algo = "merge" }) {
  const [arr, setArr] = useState([5, 2, 8, 1, 9, 3, 7, 4]);
  const frames = useMemo(() => BUILDERS[algo](arr), [arr, algo]);
  const player = useStepPlayer(frames);

  const apply = (text) => {
    const a = parseIntArray(text, { max: 14, clampMin: 0, clampMax: 99 });
    setArr(a.length ? a : [1]);
    player.reset();
  };

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#2563eb"
      pseudocode={PSEUDO[algo]}
      inputPanel={<ArrayInputBar arrayLabel="Array" defaultArray="5, 2, 8, 1, 9, 3, 7, 4" onApply={apply} />}
      legend={
        <>
          <LegendItem color="#f59e0b" label="compare" />
          <LegendItem color="#ec4899" label="swap" />
          <LegendItem color="#ef4444" label="pivot" />
          <LegendItem color="#10b981" label="sorted" />
        </>
      }
    >
      {player.frame && <BarsView array={player.frame.array} states={player.frame.states} />}
    </SimulatorShell>
  );
}
