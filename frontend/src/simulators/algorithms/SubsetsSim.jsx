import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";
import ArrayInputBar from "../lib/ArrayInputBar.jsx";
import { parseIntArray } from "../lib/parse.js";

const PSEUDO = {
  subsets: [
    "dfs(i, cur):",
    "  if i == n: output cur; return",
    "  dfs(i+1, cur)            // exclude a[i]",
    "  dfs(i+1, cur + [a[i]])   // include a[i]",
  ],
  permutations: [
    "dfs(cur, used):",
    "  if cur.size == n: output cur; return",
    "  for i in 0..n-1:",
    "    if not used[i]:",
    "      used[i]=1; dfs(cur+[a[i]], used); used[i]=0",
  ],
};

function subsetFrames(a) {
  const frames = [];
  const results = [];
  const cur = [];
  const push = (i, explain, line, chosen = []) => {
    const states = {};
    chosen.forEach((idx) => (states[idx] = "match"));
    if (i < a.length) states[i] = "active";
    frames.push({ array: a, states, cur: [...cur], results: results.map((r) => [...r]), explain, line });
  };

  const dfs = (i, chosen) => {
    if (i === a.length) {
      results.push([...cur]);
      push(i, `Reached the end — record subset {${cur.join(", ") || "∅"}}.`, 1, chosen);
      return;
    }
    push(i, `At index ${i}: first branch — exclude a[${i}]=${a[i]}.`, 2, chosen);
    dfs(i + 1, chosen);
    cur.push(a[i]);
    push(i, `Now include a[${i}]=${a[i]}. Current set: {${cur.join(", ")}}.`, 3, [...chosen, i]);
    dfs(i + 1, [...chosen, i]);
    cur.pop();
  };
  push(0, "Build every subset by choosing include/exclude for each element.", 0);
  dfs(0, []);
  push(a.length, `Done — generated all ${results.length} = 2^${a.length} subsets.`, 1);
  return frames;
}

function permFrames(a) {
  const frames = [];
  const results = [];
  const cur = [];
  const used = new Array(a.length).fill(false);
  const push = (explain, line) => {
    const states = {};
    a.forEach((_, i) => (states[i] = used[i] ? "discard" : "default"));
    frames.push({ array: a, states, cur: [...cur], results: results.map((r) => [...r]), explain, line });
  };
  const dfs = () => {
    if (cur.length === a.length) {
      results.push([...cur]);
      push(`Full permutation [${cur.join(", ")}] — record it.`, 1);
      return;
    }
    for (let i = 0; i < a.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(a[i]);
      push(`Pick a[${i}]=${a[i]} (unused). Current: [${cur.join(", ")}].`, 4);
      dfs();
      used[i] = false;
      cur.pop();
    }
  };
  push("Generate permutations by picking each unused element in turn.", 0);
  dfs();
  push(`Done — ${results.length} permutations.`, 1);
  return frames;
}

export default function SubsetsSim({ variant = "subsets" }) {
  const [a, setA] = useState(variant === "permutations" ? [1, 2, 3] : [1, 2, 3]);
  const frames = useMemo(() => (variant === "permutations" ? permFrames(a) : subsetFrames(a)), [a, variant]);
  const player = useStepPlayer(frames);

  const apply = (text) => {
    const arr = parseIntArray(text, { max: variant === "permutations" ? 4 : 5 });
    setA(arr.length ? arr : [1]);
    player.reset();
  };

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#ef4444"
      pseudocode={PSEUDO[variant]}
      inputPanel={
        <ArrayInputBar
          arrayLabel={`Elements (${variant === "permutations" ? "≤4" : "≤5"} for clarity)`}
          defaultArray={a.join(", ")}
          accent="#ef4444"
          onApply={apply}
        />
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="current index" />
          <LegendItem color="#10b981" label="included" />
        </>
      }
    >
      {player.frame && (
        <div className="flex w-full flex-col items-center gap-4">
          <ArrayView array={player.frame.array} states={player.frame.states} />
          <div className="rounded-lg surface-sunken px-4 py-2 font-mono text-sm">
            current: <span className="font-bold text-red-500">[{player.frame.cur.join(", ")}]</span>
          </div>
          <div className="flex max-h-28 w-full flex-wrap justify-center gap-1.5 overflow-y-auto">
            <AnimatePresence>
              {player.frame.results.map((r, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-md bg-emerald-500/15 px-2 py-1 font-mono text-xs text-emerald-600 dark:text-emerald-400"
                >
                  {`{${r.join(",") || "∅"}}`}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
