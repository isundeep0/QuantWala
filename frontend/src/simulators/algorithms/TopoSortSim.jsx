import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const NODES = ["0", "1", "2", "3", "4", "5"].map((id) => ({ id, label: id }));
// A DAG of "prerequisites": u → v means u must come before v.
const EDGES = [
  { u: "0", v: "1" },
  { u: "0", v: "2" },
  { u: "1", v: "3" },
  { u: "2", v: "3" },
  { u: "2", v: "5" },
  { u: "3", v: "4" },
  { u: "5", v: "4" },
];

const PSEUDO = [
  "compute indegree of every node",
  "queue = nodes with indegree 0",
  "while queue not empty:",
  "  u = pop; append u to order",
  "  for v in adj[u]: indeg[v]--",
  "    if indeg[v] == 0: queue.push(v)",
];

function buildFrames() {
  const adj = {};
  const indeg = {};
  NODES.forEach((n) => {
    adj[n.id] = [];
    indeg[n.id] = 0;
  });
  for (const e of EDGES) {
    adj[e.u].push(e.v);
    indeg[e.v]++;
  }
  const frames = [];
  const order = [];
  const nodeStates = {};
  const labels = () => Object.fromEntries(NODES.map((n) => [n.id, String(indeg[n.id])]));
  const push = (explain, line, q) =>
    frames.push({ nodeStates: { ...nodeStates }, labels: labels(), explain, line, order: [...order], queue: [...q] });

  const q = NODES.filter((n) => indeg[n.id] === 0).map((n) => n.id);
  q.forEach((id) => (nodeStates[id] = "frontier"));
  push("Labels show each node's indegree (number of unmet prerequisites). Seed the queue with all indegree-0 nodes.", 1, q);

  while (q.length) {
    const u = q.shift();
    nodeStates[u] = "current";
    order.push(u);
    push(`Pop ${u} (indegree 0) and append it to the topological order.`, 3, q);
    for (const v of adj[u]) {
      indeg[v]--;
      push(`Remove edge ${u}→${v}: indegree[${v}] becomes ${indeg[v]}.`, 4, q);
      if (indeg[v] === 0) {
        q.push(v);
        nodeStates[v] = "frontier";
        push(`${v} now has no prerequisites left → enqueue it.`, 5, q);
      }
    }
    nodeStates[u] = "visited";
  }
  push(`Topological order: ${order.join(" → ")}. Every edge points forward in this ordering.`, 2, q);
  return frames;
}

export default function TopoSortSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#22c55e"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="emitting" />
          <LegendItem color="#f59e0b" label="indegree 0 (queued)" />
          <LegendItem color="#10b981" label="placed" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-3">
          <GraphView nodes={NODES} edges={EDGES} directed nodeStates={f.nodeStates} labels={f.labels} />
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-muted">queue:</span>
            {f.queue.length ? (
              f.queue.map((x, i) => (
                <span key={i} className="rounded bg-amber-500/20 px-2 py-1 text-amber-600 dark:text-amber-400">
                  {x}
                </span>
              ))
            ) : (
              <span className="text-faint">empty</span>
            )}
            <span className="ml-3 text-muted">order:</span>
            <span className="font-bold text-emerald-500">{f.order.join(" → ") || "—"}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
