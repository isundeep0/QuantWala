import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "l = 0, r = n - 1",
  "while l < r:",
  "  s = a[l] + a[r]",
  "  if s == target: return (l, r)",
  "  else if s < target: l++   // need bigger",
  "  else: r--                 // need smaller",
];

function buildFrames(arr, target) {
  const a = [...arr].sort((x, y) => x - y);
  const frames = [];
  let l = 0;
  let r = a.length - 1;
  const ptr = () => [
    { index: l, label: "L", color: "#0ea5e9" },
    { index: r, label: "R", color: "#8b5cf6" },
  ];
  const push = (states, explain, line) => frames.push({ array: a, states, pointers: ptr(), explain, line });

  push({ [l]: "lo", [r]: "hi" }, `Sorted array. Looking for a pair summing to ${target}. Start at both ends.`, 0);
  let found = false;
  while (l < r) {
    const s = a[l] + a[r];
    push({ [l]: "lo", [r]: "hi" }, `a[${l}]+a[${r}] = ${a[l]}+${a[r]} = ${s}.`, 2);
    if (s === target) {
      push({ [l]: "found", [r]: "found" }, `${s} == target — pair found at indices ${l} and ${r}!`, 3);
      found = true;
      break;
    } else if (s < target) {
      push({ [l]: "discard" }, `${s} < ${target}: too small → move L right to increase the sum.`, 4);
      l++;
    } else {
      push({ [r]: "discard" }, `${s} > ${target}: too big → move R left to decrease the sum.`, 5);
      r--;
    }
  }
  if (!found) push({}, `Pointers crossed — no pair sums to ${target}.`, 1);
  return frames;
}

export default function TwoPointersSim() {
  const [input, setInput] = useState({ array: [1, 2, 4, 6, 8, 9, 14, 15], target: 13 });
  const frames = useMemo(() => buildFrames(input.array, input.target), [input]);
  const player = useStepPlayer(frames);
  const apply = (text, scalar) => {
    const arr = parseIntArray(text);
    const t = parseInt(scalar, 10);
    setInput({ array: arr.length ? arr : [1], target: Number.isFinite(t) ? t : 0 });
    player.reset();
  };
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#0ea5e9"
      pseudocode={PSEUDO}
      inputPanel={
        <ArrayInputBar
          arrayLabel="Sorted array"
          defaultArray="1, 2, 4, 6, 8, 9, 14, 15"
          scalarLabel="Target sum"
          defaultScalar="13"
          sorted
          accent="#0ea5e9"
          onApply={apply}
        />
      }
      legend={
        <>
          <LegendItem color="#0ea5e9" label="L pointer" />
          <LegendItem color="#8b5cf6" label="R pointer" />
          <LegendItem color="#10b981" label="match" />
        </>
      }
    >
      {player.frame && <ArrayView array={player.frame.array} states={player.frame.states} pointers={player.frame.pointers} />}
    </SimulatorShell>
  );
}
