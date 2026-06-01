import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const PSEUDO = [
  "update(i, delta):           // 1-indexed",
  "  while i <= n:",
  "    tree[i] += delta",
  "    i += i & (-i)           // next responsible node",
  "query(i):  // prefix sum 1..i",
  "  while i > 0:",
  "    sum += tree[i]; i -= i & (-i)",
];

function buildFrames(values, ops) {
  const n = values.length;
  const tree = new Array(n + 1).fill(0);
  const frames = [];
  const lowbit = (x) => x & -x;

  const push = (states, explain, line, treeSnapshot) =>
    frames.push({ tree: treeSnapshot ? [...tree] : [...tree], states, explain, line });

  const update = (i, delta, initial) => {
    while (i <= n) {
      tree[i] += delta;
      const states = { [i]: "active" };
      frames.push({ tree: [...tree], states, explain: `${initial ? "Insert" : "Update"} value ${delta} at index ${i}: tree[${i}] += ${delta}. Jump by lowbit(${i})=${lowbit(i)} → ${i + lowbit(i)}.`, line: 3 });
      i += lowbit(i);
    }
  };

  frames.push({ tree: [...tree], states: {}, explain: "Fenwick Tree (BIT): each slot stores a partial sum covering lowbit(i) elements. Indices are 1-based.", line: 0 });

  // build
  for (const [idx, val] of ops.build) update(idx, val, true);

  // a query
  for (const q of ops.query) {
    let i = q;
    let sum = 0;
    const visited = [];
    while (i > 0) {
      sum += tree[i];
      visited.push(i);
      const states = {};
      visited.forEach((v) => (states[v] = "match"));
      states[i] = "current";
      frames.push({ tree: [...tree], states, explain: `query(${q}): add tree[${i}]=${tree[i]} (running sum ${sum}). Drop lowbit → ${i - lowbit(i)}.`, line: 5 });
      i -= lowbit(i);
    }
    const states = {};
    visited.forEach((v) => (states[v] = "match"));
    frames.push({ tree: [...tree], states, explain: `Prefix sum of first ${q} elements = ${sum} (only ${visited.length} slots touched — O(log n)).`, line: 4 });
  }
  return frames;
}

export default function FenwickSim() {
  const values = [0, 3, 2, -1, 6, 5, 4, -3, 3];
  const ops = useMemo(
    () => ({
      build: [
        [1, 3],
        [2, 2],
        [3, -1],
        [4, 6],
        [5, 5],
        [6, 4],
        [7, -3],
        [8, 3],
      ],
      query: [6],
    }),
    [],
  );
  const frames = useMemo(() => buildFrames(values, ops), [ops]);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#ec4899"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="current index" />
          <LegendItem color="#10b981" label="summed slot" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-faint">tree[1..n] (index 0 unused)</div>
          <ArrayView array={player.frame.tree} states={player.frame.states} />
        </div>
      )}
    </SimulatorShell>
  );
}
