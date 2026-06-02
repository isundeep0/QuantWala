import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const NODES = ["0", "1", "2", "3", "4", "5", "6"].map((id) => ({ id, label: id }));
const EDGES = [
  { u: "0", v: "1" },
  { u: "1", v: "2" },
  { u: "2", v: "0" }, // SCC {0,1,2}
  { u: "2", v: "3" },
  { u: "3", v: "4" },
  { u: "4", v: "5" },
  { u: "5", v: "3" }, // SCC {3,4,5}
  { u: "6", v: "4" }, // 6 is its own SCC
];

const PSEUDO = [
  "Pass 1: DFS on G, push nodes by finish time",
  "Pass 2: process nodes in reverse finish order",
  "  DFS on the reversed graph Gᵀ",
  "  each DFS tree = one strongly connected component",
];

function buildAdj(edges) {
  const adj = {};
  NODES.forEach((n) => (adj[n.id] = []));
  for (const e of edges) adj[e.u].push(e.v);
  return adj;
}

function buildFrames() {
  const adj = buildAdj(EDGES);
  const radj = buildAdj(EDGES.map((e) => ({ u: e.v, v: e.u })));
  const frames = [];
  const nodeStates = {};
  const order = [];
  const visited = {};
  const push = (explain, line) => frames.push({ nodeStates: { ...nodeStates }, explain, line, order: [...order] });

  push("Kosaraju runs two DFS passes. First pass: explore G and record nodes in order of finishing time.", 0);
  const dfs1 = (u) => {
    visited[u] = true;
    nodeStates[u] = "current";
    push(`Pass 1 — enter ${u}.`, 0);
    for (const v of adj[u]) if (!visited[v]) dfs1(v);
    nodeStates[u] = "visited";
    order.push(u);
    push(`Pass 1 — finish ${u}; push it onto the finish-order stack.`, 0);
  };
  for (const n of NODES) if (!visited[n.id]) dfs1(n.id);

  push(`Finish order (bottom→top of stack): [${order.join(", ")}]. Now reverse every edge and process nodes top-down.`, 1);
  for (const n of NODES) nodeStates[n.id] = "default";

  const comp = {};
  let c = 0;
  const dfs2 = (u, label) => {
    comp[u] = label;
    nodeStates[u] = `comp${label % 5}`;
    push(`Pass 2 — assign ${u} to component #${label}.`, 2);
    for (const v of radj[u]) if (comp[v] === undefined) dfs2(v, label);
  };
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i];
    if (comp[u] === undefined) {
      push(`Pass 2 — start a new component from ${u} (highest unfinished node).`, 1);
      dfs2(u, c);
      c++;
    }
  }
  push(`Found ${c} strongly connected components — each color is a maximal mutually-reachable group.`, 3);
  return frames;
}

export default function SCCSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#22c55e"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="visiting" />
          <LegendItem color="#10b981" label="component (colored)" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-3">
          <GraphView nodes={NODES} edges={EDGES} directed nodeStates={player.frame.nodeStates} />
          <div className="font-mono text-xs text-muted">
            finish stack: <span className="text-emerald-500">[{player.frame.order.join(", ")}]</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
