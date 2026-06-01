import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const SAMPLE = {
  nodes: ["0", "1", "2", "3", "4", "5", "6"].map((id) => ({ id, label: id })),
  adj: {
    0: ["1", "2"],
    1: ["0", "3", "4"],
    2: ["0", "5"],
    3: ["1"],
    4: ["1", "6"],
    5: ["2", "6"],
    6: ["4", "5"],
  },
};

function edgesFromAdj(adj) {
  const seen = new Set();
  const edges = [];
  for (const u of Object.keys(adj)) {
    for (const v of adj[u]) {
      const k = [u, v].sort().join("-");
      if (!seen.has(k)) {
        seen.add(k);
        edges.push({ u, v });
      }
    }
  }
  return edges;
}

const PSEUDO = {
  bfs: [
    "queue = [start]; visited = {start}",
    "while queue not empty:",
    "  u = queue.popFront()",
    "  for v in adj[u]:",
    "    if v not visited:",
    "      visited.add(v); queue.push(v)",
  ],
  dfs: [
    "stack = [start]",
    "while stack not empty:",
    "  u = stack.pop()",
    "  if u visited: continue",
    "  visit(u)",
    "  for v in adj[u]: stack.push(v)",
  ],
};

function buildFrames(mode, adj, start = "0") {
  const frames = [];
  const order = [];
  const visited = new Set();
  const nodeStates = {};
  const push = (explain, line, extra = {}) =>
    frames.push({ nodeStates: { ...nodeStates }, order: [...order], explain, line, ...extra });

  if (mode === "bfs") {
    const q = [start];
    visited.add(start);
    nodeStates[start] = "frontier";
    push(`Start BFS at ${start}. Enqueue it and mark visited.`, 0, { queue: [...q] });
    while (q.length) {
      const u = q.shift();
      nodeStates[u] = "current";
      push(`Dequeue ${u} and explore its neighbours level by level.`, 2, { queue: [...q] });
      for (const v of adj[u] || []) {
        if (!visited.has(v)) {
          visited.add(v);
          q.push(v);
          nodeStates[v] = "frontier";
          push(`Neighbour ${v} is new → mark visited, enqueue.`, 5, { queue: [...q] });
        }
      }
      nodeStates[u] = "visited";
      order.push(u);
    }
  } else {
    const stack = [start];
    push(`Start DFS at ${start}. Push it on the stack.`, 0, { stack: [...stack] });
    while (stack.length) {
      const u = stack.pop();
      if (visited.has(u)) {
        push(`${u} already visited → skip.`, 3, { stack: [...stack] });
        continue;
      }
      visited.add(u);
      nodeStates[u] = "current";
      order.push(u);
      push(`Visit ${u}, then dive into its neighbours (go deep first).`, 4, { stack: [...stack] });
      for (const v of (adj[u] || []).slice().reverse()) {
        if (!visited.has(v)) {
          stack.push(v);
          if (nodeStates[v] !== "visited") nodeStates[v] = "frontier";
        }
      }
      nodeStates[u] = "visited";
    }
  }
  push(`Done. Visit order: ${order.join(" → ")}.`, mode === "bfs" ? 1 : 1);
  return frames;
}

export default function GraphTraversalSim({ mode = "bfs" }) {
  const adj = SAMPLE.adj;
  const edges = useMemo(() => edgesFromAdj(adj), [adj]);
  const [start, setStart] = useState("0");
  const frames = useMemo(() => buildFrames(mode, adj, start), [mode, adj, start]);
  const player = useStepPlayer(frames);

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent={mode === "bfs" ? "#22c55e" : "#10b981"}
      pseudocode={PSEUDO[mode]}
      inputPanel={
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted">Start node</span>
          {SAMPLE.nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setStart(n.id);
                player.reset();
              }}
              className={`h-9 w-9 rounded-lg border font-mono text-sm font-semibold ${
                start === n.id ? "bg-emerald-500 text-white" : "surface-sunken"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="current" />
          <LegendItem color="#f59e0b" label="in queue/stack" />
          <LegendItem color="#10b981" label="visited" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-3">
          <GraphView nodes={SAMPLE.nodes} edges={edges} nodeStates={player.frame.nodeStates} />
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-muted">{mode === "bfs" ? "queue" : "stack"}:</span>
            {(player.frame.queue || player.frame.stack || []).map((x, i) => (
              <span key={i} className="rounded bg-amber-500/20 px-2 py-1 text-amber-600 dark:text-amber-400">
                {x}
              </span>
            ))}
            <span className="ml-3 text-muted">order:</span>
            <span className="text-emerald-500">{player.frame.order.join(" → ") || "—"}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
