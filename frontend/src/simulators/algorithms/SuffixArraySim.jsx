import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const PSEUDO = [
  "rank[i] = s[i]; sort suffixes by 1 char",
  "for k = 1, 2, 4, ... < n:",
  "  key(i) = (rank[i], rank[i+k] or -1)",
  "  sort suffix indices by key",
  "  recompute ranks from the new order",
  "stop when every suffix has a unique rank",
];

function buildFrames(s) {
  const n = s.length;
  let sa = Array.from({ length: n }, (_, i) => i);
  let rank = s.split("").map((c) => c.charCodeAt(0));
  const frames = [];
  const snap = (k, explain) => frames.push({ order: [...sa], rank: [...rank], k, s, explain });

  // initial sort by first character
  sa.sort((a, b) => rank[a] - rank[b]);
  snap(1, `Start by sorting all ${n} suffixes by their first character. Ranks come from the leading char.`);

  for (let k = 1; k < n; k <<= 1) {
    const key = (i) => [rank[i], i + k < n ? rank[i + k] : -1];
    const cmp = (a, b) => {
      const ka = key(a);
      const kb = key(b);
      return ka[0] !== kb[0] ? ka[0] - kb[0] : ka[1] - kb[1];
    };
    sa.sort(cmp);
    const tmp = new Array(n).fill(0);
    for (let i = 1; i < n; i++) tmp[sa[i]] = tmp[sa[i - 1]] + (cmp(sa[i - 1], sa[i]) < 0 ? 1 : 0);
    rank = tmp;
    snap(k * 2, `Compare first ${Math.min(k * 2, n)} chars: sort by (rank[i], rank[i+${k}]), then renumber ranks. Suffixes are now ordered by their ${Math.min(k * 2, n)}-char prefixes.`);
    if (Math.max(...rank) === n - 1) break; // all unique
  }
  snap(n, `Suffix array = [${sa.join(", ")}]. Reading the suffixes in this order gives them sorted lexicographically.`);
  return frames;
}

export default function SuffixArraySim() {
  const [s, setS] = useState("BANANA");
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
          <input className="input w-56 font-mono uppercase" value={s} maxLength={12} onChange={(e) => { setS(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); player.reset(); }} />
        </label>
      }
      legend={
        <>
          <LegendItem color="#8b5cf6" label="compared prefix" />
          <LegendItem color="#10b981" label="rank" />
        </>
      }
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-2">
          <div className="mb-1 font-mono text-xs text-muted">comparing first {Math.min(f.k, f.s.length)} char(s) of each suffix</div>
          <div className="flex w-full max-w-[420px] flex-col gap-1.5">
            {f.order.map((idx, row) => {
              const suffix = f.s.slice(idx);
              const hi = Math.min(f.k, suffix.length);
              return (
                <div key={idx} className="flex items-center gap-3 rounded-lg surface-sunken px-3 py-1.5">
                  <span className="w-6 font-mono text-xs text-faint">{row}</span>
                  <span className="w-8 font-mono text-xs text-muted">i={idx}</span>
                  <span className="flex-1 font-mono text-sm tracking-wide">
                    <span className="font-bold text-violet-500">{suffix.slice(0, hi)}</span>
                    <span className="text-muted">{suffix.slice(hi)}</span>
                  </span>
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    rank {f.rank[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
