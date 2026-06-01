import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const N = 7;
const OPS = [
  ["union", 0, 1],
  ["union", 2, 3],
  ["union", 1, 3],
  ["find", 0],
  ["union", 4, 5],
  ["union", 6, 5],
  ["union", 3, 5],
  ["find", 0],
];

const PSEUDO = [
  "find(x):",
  "  if parent[x] != x:",
  "    parent[x] = find(parent[x])  // path compression",
  "  return parent[x]",
  "union(a, b):",
  "  ra, rb = find(a), find(b)",
  "  attach smaller rank under larger (union by rank)",
];

const PALETTE = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#ef4444"];

function buildFrames() {
  const parent = Array.from({ length: N }, (_, i) => i);
  const rank = new Array(N).fill(0);
  const frames = [];

  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const nodes = Array.from({ length: N }, (_, i) => ({ id: String(i), label: String(i) }));
  const snapshot = (explain, line, highlight = []) => {
    const edges = [];
    for (let i = 0; i < N; i++) if (parent[i] !== i) edges.push({ u: String(i), v: String(parent[i]) });
    const roots = {};
    for (let i = 0; i < N; i++) roots[i] = find(i);
    const nodeStates = {};
    for (let i = 0; i < N; i++) {
      const root = roots[i];
      nodeStates[String(i)] = highlight.includes(i) ? "current" : "default";
    }
    // color edges by root component
    const edgeStates = {};
    edges.forEach((e) => {
      const root = roots[Number(e.u)];
      edgeStates[`${e.u}-${e.v}`] = "path";
    });
    frames.push({ edges, nodeStates, edgeStates, explain, line });
  };

  snapshot("Every element starts as its own set (parent points to itself).", 0);

  for (const op of OPS) {
    if (op[0] === "union") {
      const [, a, b] = op;
      const ra = find(a);
      const rb = find(b);
      if (ra === rb) {
        snapshot(`union(${a}, ${b}): already in the same set — nothing to do.`, 4, [a, b]);
        continue;
      }
      if (rank[ra] < rank[rb]) {
        parent[ra] = rb;
      } else if (rank[ra] > rank[rb]) {
        parent[rb] = ra;
      } else {
        parent[rb] = ra;
        rank[ra]++;
      }
      snapshot(`union(${a}, ${b}): merge roots ${ra} and ${rb}, attaching by rank.`, 6, [a, b]);
    } else {
      const [, x] = op;
      const r = find(x);
      snapshot(`find(${x}) = ${r}. Path compression flattens the tree for future speed.`, 2, [x, r]);
    }
  }
  return frames;
}

export default function DSUSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const nodes = Array.from({ length: N }, (_, i) => ({ id: String(i), label: String(i) }));
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#22c55e"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="active in op" />
          <LegendItem color="#8b5cf6" label="parent link" />
        </>
      }
    >
      {player.frame && (
        <GraphView
          nodes={nodes}
          edges={player.frame.edges}
          directed
          nodeStates={player.frame.nodeStates}
          edgeStates={player.frame.edgeStates}
        />
      )}
    </SimulatorShell>
  );
}
