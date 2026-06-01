import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const PSEUDO = [
  "build lps[] = longest proper prefix = suffix",
  "i = 0 (text), j = 0 (pattern)",
  "while i < n:",
  "  if text[i] == pat[j]: i++, j++",
  "    if j == m: match at i - m; j = lps[j-1]",
  "  else if j > 0: j = lps[j-1]   // skip, no restart",
  "  else: i++",
];

function buildLps(p) {
  const lps = new Array(p.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < p.length) {
    if (p[i] === p[len]) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else lps[i++] = 0;
  }
  return lps;
}

function buildFrames(text, pat) {
  const lps = buildLps(pat);
  const frames = [];
  let i = 0;
  let j = 0;
  const n = text.length;
  const m = pat.length;
  const matches = [];

  const snap = (explain, line) => {
    const tStates = {};
    const pStates = {};
    if (i < n) tStates[i] = "active";
    if (j < m) pStates[j] = "active";
    for (let k = 0; k < j; k++) {
      tStates[i - j + k] = "match";
      pStates[k] = "match";
    }
    matches.forEach((s) => {
      for (let k = 0; k < m; k++) tStates[s + k] = tStates[s + k] || "best";
    });
    frames.push({ text: text.split(""), pat: pat.split(""), tStates, pStates, shift: i - j, lps, explain, line, matches: [...matches] });
  };

  snap("KMP precomputes lps[] so on a mismatch the pattern slides smartly — text pointer never goes back.", 0);
  while (i < n) {
    if (text[i] === pat[j]) {
      snap(`Match: text[${i}]='${text[i]}' == pat[${j}]. Advance both.`, 3);
      i++;
      j++;
      if (j === m) {
        matches.push(i - m);
        j = lps[j - 1];
        snap(`Full pattern matched ending at index ${i - 1} (start ${i - m}). Jump j to lps = ${j}.`, 4);
      }
    } else if (j > 0) {
      const nj = lps[j - 1];
      snap(`Mismatch at pat[${j}]. Use lps[${j - 1}]=${nj}: slide pattern without moving i.`, 5);
      j = nj;
    } else {
      snap(`Mismatch with j=0 → advance text pointer i.`, 6);
      i++;
    }
  }
  snap(`Done. Matches start at: [${matches.join(", ") || "none"}].`, 0);
  return frames;
}

export default function KMPSim() {
  const [text, setText] = useState("ABABDABACDABABCABAB");
  const [pat, setPat] = useState("ABABCABAB");
  const frames = useMemo(() => buildFrames(text, pat), [text, pat]);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#8b5cf6"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Text</span>
            <input className="input w-64 font-mono uppercase" value={text} maxLength={26} onChange={(e) => { setText(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); player.reset(); }} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Pattern</span>
            <input className="input w-44 font-mono uppercase" value={pat} maxLength={14} onChange={(e) => { setPat(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); player.reset(); }} />
          </label>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="comparing" />
          <LegendItem color="#10b981" label="matched prefix" />
        </>
      }
    >
      {player.frame && (
        <div className="flex w-full flex-col items-center gap-4 overflow-x-auto">
          <div>
            <div className="mb-1 text-xs text-faint">text</div>
            <ArrayView array={player.frame.text} states={player.frame.tStates} cellSize={34} indices={false} />
          </div>
          <div style={{ marginLeft: player.frame.shift * 37 }}>
            <div className="mb-1 text-xs text-faint">pattern (aligned at shift {player.frame.shift})</div>
            <ArrayView array={player.frame.pat} states={player.frame.pStates} cellSize={34} indices={false} />
          </div>
          <div className="font-mono text-xs text-muted">lps = [{player.frame.lps.join(", ")}]</div>
        </div>
      )}
    </SimulatorShell>
  );
}
