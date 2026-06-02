import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const PSEUDO = [
  "z[0] = 0; l = r = 0",
  "for i in 1..n-1:",
  "  if i < r: z[i] = min(r-i, z[i-l])   // reuse the box",
  "  while i+z[i] < n and s[z[i]]==s[i+z[i]]: z[i]++",
  "  if i+z[i] > r: l = i; r = i+z[i]    // extend box",
];

function buildFrames(s) {
  const n = s.length;
  const z = new Array(n).fill(0);
  const frames = [];
  let l = 0;
  let r = 0;
  const snap = (i, explain, line) => {
    const states = {};
    for (let k = l; k < r; k++) states[k] = "window"; // current Z-box
    if (i >= 0) states[i] = "active";
    const matchLen = i >= 0 ? z[i] : 0;
    for (let k = 0; k < matchLen; k++) states[k] = states[k] || "match";
    frames.push({ chars: s.split(""), states, z: [...z], i, l, r, explain, line });
  };

  snap(-1, `The Z-array: z[i] = length of the longest substring starting at i that matches a prefix of "${s}". The [l,r] "Z-box" caches the last match to skip work.`, 0);
  for (let i = 1; i < n; i++) {
    if (i < r) {
      z[i] = Math.min(r - i, z[i - l]);
      snap(i, `i=${i} is inside the box [${l},${r}). Reuse z[${i - l}]: start z[${i}] = min(${r - i}, ${z[i - l]}) = ${z[i]}.`, 2);
    } else {
      snap(i, `i=${i} is outside any box. Start matching from scratch (z[${i}]=0).`, 1);
    }
    let extended = false;
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
      extended = true;
    }
    if (extended) snap(i, `Extend by comparing s[prefix] with s[i+...]: z[${i}] grows to ${z[i]}.`, 3);
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
      snap(i, `New farthest match → move the Z-box to [${l}, ${r}).`, 4);
    }
  }
  snap(-1, `Final Z = [${z.join(", ")}]. Any z[i] == pattern length signals an occurrence (used for string matching).`, 0);
  return frames;
}

export default function ZAlgorithmSim() {
  const [s, setS] = useState("AABAAAB");
  const frames = useMemo(() => buildFrames(s), [s]);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#8b5cf6"
      pseudocode={PSEUDO}
      inputPanel={
        <label>
          <span className="mb-1 block text-xs font-medium text-muted">String</span>
          <input className="input w-64 font-mono uppercase" value={s} maxLength={18} onChange={(e) => { setS(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); player.reset(); }} />
        </label>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="i (computing)" />
          <LegendItem color="#10b981" label="prefix match" />
          <LegendItem color="#2563eb22" label="Z-box [l,r)" />
        </>
      }
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-4 overflow-x-auto">
          <ArrayView array={f.chars} states={f.states} pointers={f.i >= 0 ? [{ index: f.i, label: "i", color: "#8b5cf6" }] : []} cellSize={36} indices />
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs">
            <span className="text-muted">z:</span>
            {f.z.map((v, i) => (
              <span key={i} className={`grid h-7 w-7 place-items-center rounded ${i === f.i ? "bg-violet-500 text-white" : "surface-sunken text-muted"}`}>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
