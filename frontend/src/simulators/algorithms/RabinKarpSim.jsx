import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const BASE = 31;
const MOD = 1009; // small modulus so hashes are readable

const PSEUDO = [
  "ph = hash(pattern); wh = hash(text[0..m))",
  "power = base^(m-1) mod M",
  "for i in 0..n-m:",
  "  if wh == ph and text[i..i+m)==pat: match",
  "  // roll the window forward in O(1):",
  "  wh = ((wh - text[i]·power)·base + text[i+m]) mod M",
];

const val = (c) => c.charCodeAt(0) - 64; // 'A' -> 1

function buildFrames(text, pat) {
  const n = text.length;
  const m = pat.length;
  const frames = [];
  if (m === 0 || m > n) {
    frames.push({ text: text.split(""), states: {}, pointers: [], wh: 0, ph: 0, explain: "Pattern must be non-empty and no longer than the text.", line: 0, matches: [] });
    return frames;
  }
  let ph = 0;
  let wh = 0;
  let power = 1;
  for (let i = 0; i < m; i++) {
    ph = (ph * BASE + val(pat[i])) % MOD;
    wh = (wh * BASE + val(text[i])) % MOD;
    if (i) power = (power * BASE) % MOD;
  }
  const matches = [];
  const snap = (i, explain, line, hit) => {
    const states = {};
    for (let k = i; k < i + m; k++) states[k] = hit ? "found" : "window";
    matches.forEach((s) => {
      for (let k = s; k < s + m; k++) states[k] = states[k] || "best";
    });
    frames.push({ text: text.split(""), states, pointers: [{ index: i, label: "i", color: "#8b5cf6" }], wh, ph, explain, line, matches: [...matches] });
  };

  snap(0, `Pattern hash ph = ${ph}. First window "${text.slice(0, m)}" hashes to ${wh}. We slide and compare hashes in O(1).`, 0);
  for (let i = 0; i + m <= n; i++) {
    if (wh === ph) {
      const sub = text.slice(i, i + m);
      if (sub === pat) {
        matches.push(i);
        snap(i, `wh == ph (${wh}) and "${sub}" verifies → match at index ${i}!`, 3, true);
      } else {
        snap(i, `Hash collision: wh == ph (${wh}) but "${sub}" ≠ "${pat}". Verification rejects it.`, 3, false);
      }
    } else {
      snap(i, `Window "${text.slice(i, i + m)}" hash ${wh} ≠ pattern hash ${ph}. Skip.`, 3, false);
    }
    if (i + m < n) {
      const dropped = (((wh - (val(text[i]) * power) % MOD) % MOD) + MOD) % MOD;
      wh = (dropped * BASE + val(text[i + m])) % MOD;
    }
  }
  frames.push({
    text: text.split(""),
    states: matches.reduce((acc, s) => {
      for (let k = s; k < s + m; k++) acc[k] = "best";
      return acc;
    }, {}),
    pointers: [],
    wh,
    ph,
    explain: `Done. Matches start at: [${matches.join(", ") || "none"}]. Rolling hash made each shift O(1).`,
    line: 0,
    matches,
  });
  return frames;
}

export default function RabinKarpSim() {
  const [text, setText] = useState("ABRACADABRA");
  const [pat, setPat] = useState("ABR");
  const frames = useMemo(() => buildFrames(text, pat), [text, pat]);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#8b5cf6"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Text</span>
            <input className="input w-64 font-mono uppercase" value={text} maxLength={20} onChange={(e) => { setText(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); player.reset(); }} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">Pattern</span>
            <input className="input w-40 font-mono uppercase" value={pat} maxLength={8} onChange={(e) => { setPat(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); player.reset(); }} />
          </label>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="current window" />
          <LegendItem color="#10b981" label="verified match" />
        </>
      }
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-4 overflow-x-auto">
          <ArrayView array={f.text} states={f.states} pointers={f.pointers} cellSize={34} indices={false} />
          <div className="flex gap-6 font-mono text-sm">
            <div className="rounded-lg surface-sunken px-4 py-2">window hash = <span className="font-bold text-brand-500">{f.wh}</span></div>
            <div className="rounded-lg surface-sunken px-4 py-2">pattern hash = <span className="font-bold text-violet-500">{f.ph}</span></div>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
