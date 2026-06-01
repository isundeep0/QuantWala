import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = [
  "cur = a[0], best = a[0]",
  "for i = 1 .. n-1:",
  "  cur = max(a[i], cur + a[i])",
  "  best = max(best, cur)",
  "return best",
];

function buildFrames(a) {
  const frames = [];
  let cur = a[0];
  let best = a[0];
  let bestL = 0;
  let bestR = 0;
  let curL = 0;

  frames.push({
    array: a,
    states: { 0: "active" },
    pointers: [{ index: 0, label: "i", color: "#2563eb" }],
    explain: `Start: cur = best = a[0] = ${a[0]}. "cur" is the best subarray sum ending here.`,
    line: 0,
    meta: { cur, best, bestL, bestR },
  });

  for (let i = 1; i < a.length; i++) {
    const extend = cur + a[i];
    const restart = a[i];
    if (restart > extend) {
      cur = restart;
      curL = i;
    } else {
      cur = extend;
    }
    const note =
      restart > extend
        ? `a[${i}]=${a[i]} alone (${restart}) beats extending (${extend}) — restart the subarray here.`
        : `Extend: cur + a[${i}] = ${extend} ≥ a[${i}] — keep growing the subarray.`;
    let line = 2;
    if (cur > best) {
      best = cur;
      bestL = curL;
      bestR = i;
      line = 3;
    }
    const states = {};
    for (let j = curL; j <= i; j++) states[j] = "window";
    states[i] = "active";
    for (let j = bestL; j <= bestR; j++) if (states[j] === undefined) states[j] = "best";

    frames.push({
      array: a,
      states,
      pointers: [{ index: i, label: "i", color: "#2563eb" }],
      explain: `${note} ${cur > best ? "" : `best stays ${best}.`}`.trim(),
      line,
      meta: { cur, best, bestL, bestR },
    });
  }

  const states = {};
  for (let j = bestL; j <= bestR; j++) states[j] = "best";
  frames.push({
    array: a,
    states,
    pointers: [],
    explain: `Maximum subarray sum = ${best} (indices ${bestL}..${bestR}). One pass, O(n).`,
    line: 4,
    meta: { cur, best, bestL, bestR },
  });
  return frames;
}

export default function KadaneSim() {
  const [arr, setArr] = useState([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
  const frames = useMemo(() => buildFrames(arr), [arr]);
  const player = useStepPlayer(frames);

  const apply = (text) => {
    const a = parseIntArray(text, { clampMin: -99, clampMax: 99 });
    setArr(a.length ? a : [1]);
    player.reset();
  };

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#2563eb"
      pseudocode={PSEUDO}
      inputPanel={
        <ArrayInputBar arrayLabel="Array (negatives allowed)" defaultArray="-2, 1, -3, 4, -1, 2, 1, -5, 4" onApply={apply} />
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="current subarray" />
          <LegendItem color="#10b981" label="best subarray" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-5">
          <ArrayView array={player.frame.array} states={player.frame.states} pointers={player.frame.pointers} />
          <div className="flex gap-6 font-mono text-sm">
            <div className="rounded-lg surface-sunken px-4 py-2">
              cur = <span className="font-bold text-brand-500">{player.frame.meta.cur}</span>
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
