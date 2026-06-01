import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "lo = 0, hi = n - 1",
  "while lo <= hi:",
  "  mid = lo + (hi - lo) / 2",
  "  if a[mid] == target: return mid",
  "  else if a[mid] < target: lo = mid + 1",
  "  else: hi = mid - 1",
  "return -1   // not found",
];

function buildFrames(array, target) {
  const a = [...array].sort((x, y) => x - y);
  const frames = [];
  let lo = 0;
  let hi = a.length - 1;

  const mark = (extra) => {
    const states = {};
    for (let i = 0; i < a.length; i++) {
      if (i < lo || i > hi) states[i] = "discard";
    }
    Object.assign(states, extra.states || {});
    frames.push({
      array: a,
      states,
      pointers: extra.pointers || [],
      explain: extra.explain,
      line: extra.line,
    });
  };

  mark({
    line: 0,
    pointers: [
      { index: lo, label: "lo", color: "#0ea5e9" },
      { index: hi, label: "hi", color: "#8b5cf6" },
    ],
    explain: `Searching for ${target}. The array is sorted, so we can discard half the range each step. Start with lo=0 and hi=${hi}.`,
  });

  let found = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    mark({
      line: 2,
      states: { [mid]: "mid" },
      pointers: [
        { index: lo, label: "lo", color: "#0ea5e9" },
        { index: hi, label: "hi", color: "#8b5cf6" },
        { index: mid, label: "mid", color: "#d97706" },
      ],
      explain: `mid = lo + (hi - lo)/2 = ${mid}. Compare a[${mid}] = ${a[mid]} with target ${target}.`,
    });

    if (a[mid] === target) {
      found = mid;
      mark({
        line: 3,
        states: { [mid]: "found" },
        pointers: [{ index: mid, label: "✓", color: "#10b981" }],
        explain: `a[${mid}] = ${a[mid]} equals the target. Found it at index ${mid} — done!`,
      });
      break;
    } else if (a[mid] < target) {
      mark({
        line: 4,
        states: { [mid]: "discard" },
        pointers: [
          { index: lo, label: "lo", color: "#0ea5e9" },
          { index: hi, label: "hi", color: "#8b5cf6" },
        ],
        explain: `a[${mid}] = ${a[mid]} < ${target}. The answer must be to the right, so move lo to ${mid + 1}.`,
      });
      lo = mid + 1;
    } else {
      mark({
        line: 5,
        states: { [mid]: "discard" },
        pointers: [
          { index: lo, label: "lo", color: "#0ea5e9" },
          { index: hi, label: "hi", color: "#8b5cf6" },
        ],
        explain: `a[${mid}] = ${a[mid]} > ${target}. The answer must be to the left, so move hi to ${mid - 1}.`,
      });
      hi = mid - 1;
    }
  }

  if (found === -1) {
    mark({
      line: 6,
      explain: `lo > hi means the range is empty — ${target} is not in the array. Return -1.`,
    });
  }

  return frames;
}

export default function BinarySearchSim() {
  const [input, setInput] = useState({ array: [1, 3, 4, 7, 9, 11, 15, 20, 24], target: 11 });
  const frames = useMemo(() => buildFrames(input.array, input.target), [input]);
  const player = useStepPlayer(frames);

  const apply = (text, scalar) => {
    const arr = parseIntArray(text);
    const t = parseInt(scalar, 10);
    setInput({ array: arr.length ? arr : [1], target: Number.isFinite(t) ? t : arr[0] ?? 0 });
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
          arrayLabel="Sorted array (auto-sorted)"
          defaultArray="1, 3, 4, 7, 9, 11, 15, 20, 24"
          scalarLabel="Target"
          defaultScalar="11"
          sorted
          onApply={apply}
        />
      }
      legend={
        <>
          <LegendItem color="#0ea5e9" label="lo" />
          <LegendItem color="#8b5cf6" label="hi" />
          <LegendItem color="#f59e0b" label="mid" />
          <LegendItem color="#10b981" label="found" />
        </>
      }
    >
      {player.frame && (
        <ArrayView
          array={player.frame.array}
          states={player.frame.states}
          pointers={player.frame.pointers}
        />
      )}
    </SimulatorShell>
  );
}
