import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const NODES = ["A", "B", "C", "D", "E", "F"].map((id) => ({ id, label: id }));
const EDGES = [
  { u: "A", v: "B", w: 4 },
  { u: "A", v: "C", w: 3 },
  { u: "B", v: "C", w: 1 },
  { u: "B", v: "D", w: 2 },
  { u: "C", v: "D", w: 4 },
  { u: "C", v: "E", w: 5 },
  { u: "D", v: "E", w: 7 },
  { u: "D", v: "F", w: 6 },
  { u: "E", v: "F", w: 8 },
];

const PSEUDO = [
  "pq = {(0, start)}; inTree = {}",
  "while pq not empty:",
  "  (w, u) = pop smallest",
  "  if u in tree: continue",
  "  add u; cost += w",
  "  push every edge (u→v) with v not in tree",
];

function adjOf() {
  const adj = {};
  NODES.forEach((n) => (adj[n.id] = []));
  for (const e of EDGES) {
    adj[e.u].push({ to: e.v, w: e.w, key: `${e.u}-${e.v}` });
    adj[e.v].push({ to: e.u, w: e.w, key: `${e.u}-${e.v}` });
  }
  return adj;
}

function buildFrames(start = "A") {
  const adj = adjOf();
  const inTree = {};
  const chosen = {};
  const nodeStates = {};
  let cost = 0;
  const frames = [];
  const pq = [{ w: 0, u: start, key: null }];
  const push = (explain, line, extra = {}) =>
    frames.push({
      nodeStates: { ...nodeStates },
      edgeStates: { ...chosen, ...(extra.edge || {}) },
      explain,
      line,
      cost,
      pq: pq.map((p) => `${p.u}:${p.w}`),
    });

  push(`Grow a tree from ${start}. The priority queue always offers the cheapest edge crossing out of the tree.`, 0);
  let safety = 0;
  while (pq.length && safety++ < 200) {
    pq.sort((a, b) => a.w - b.w);
    const { w, u, key } = pq.shift();
    if (inTree[u]) {
      push(`Cheapest pending edge leads to ${u}, already in the tree → discard.`, 3);
      continue;
    }
    inTree[u] = true;
    nodeStates[u] = "visited";
    cost += w;
    if (key) chosen[key] = "best";
    push(`Add ${u} via the lightest crossing edge (w=${w}). Tree weight = ${cost}.`, 4, key ? { edge: { [key]: "best" } } : {});
    for (const { to, w: ew, key: ek } of adj[u]) {
      if (!inTree[to]) {
        pq.push({ w: ew, u: to, key: ek });
        if (nodeStates[to] !== "visited") nodeStates[to] = "frontier";
      }
    }
    push(`Offer ${u}'s edges to unreached neighbours. PQ now holds the candidate crossing edges.`, 5);
  }
  push(`Minimum spanning tree complete — total weight ${cost}.`, 1);
  return frames;
}

export default function PrimSim() {
  const frames = useMemo(() => buildFrames("A"), []);
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
          <LegendItem color="#10b981" label="in tree" />
          <LegendItem color="#f59e0b" label="reachable" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-3">
          <GraphView nodes={NODES} edges={EDGES} nodeStates={f.nodeStates} edgeStates={f.edgeStates} />
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-muted">PQ:</span>
            {f.pq.length === 0 ? (
              <span className="text-faint">empty</span>
            ) : (
              f.pq.map((x, i) => (
                <span key={i} className="rounded bg-amber-500/20 px-2 py-1 text-amber-600 dark:text-amber-400">
                  {x}
                </span>
              ))
            )}
          </div>
          <div className="rounded-lg surface-sunken px-4 py-1.5 font-mono text-sm">
            tree weight = <span className="font-bold text-emerald-500">{f.cost}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
