import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const NODES = ["0", "1", "2", "3", "4"].map((id) => ({ id, label: id }));
// Directed, weighted graph with a negative edge (classic Bellman-Ford example).
const EDGES = [
  { u: "0", v: "1", w: 6 },
  { u: "0", v: "2", w: 7 },
  { u: "1", v: "2", w: 8 },
  { u: "1", v: "3", w: 5 },
  { u: "1", v: "4", w: -4 },
  { u: "2", v: "3", w: -3 },
  { u: "2", v: "4", w: 9 },
  { u: "3", v: "1", w: -2 },
  { u: "4", v: "3", w: 7 },
];

const PSEUDO = [
  "dist[src] = 0, others = ∞",
  "repeat V-1 times:",
  "  for each edge (u,v,w):",
  "    if dist[u] + w < dist[v]:",
  "      dist[v] = dist[u] + w",
  "one more pass → any update = negative cycle",
];

function buildFrames(src = "0") {
  const dist = {};
  NODES.forEach((n) => (dist[n.id] = Infinity));
  dist[src] = 0;
  const frames = [];
  const fmt = (d) => (d === Infinity ? "∞" : String(d));
  const labels = () => Object.fromEntries(NODES.map((n) => [n.id, fmt(dist[n.id])]));
  const nodeStates = () => {
    const s = {};
    for (const n of NODES) s[n.id] = dist[n.id] < Infinity ? "frontier" : "default";
    s[src] = "best";
    return s;
  };
  const push = (explain, line, edgeStates = {}, ns) =>
    frames.push({ labels: labels(), nodeStates: ns || nodeStates(), edgeStates, explain, line, round: roundRef.r });
  const roundRef = { r: 0 };

  push(`Initialize dist[${src}] = 0, all others = ∞. Bellman-Ford relaxes every edge V-1 times.`, 0);

  for (let i = 1; i < NODES.length; i++) {
    roundRef.r = i;
    let changedThisRound = false;
    for (const e of EDGES) {
      const can = dist[e.u] < Infinity;
      const improves = can && dist[e.u] + e.w < dist[e.v];
      const es = { [`${e.u}-${e.v}`]: improves ? "best" : "current" };
      if (improves) {
        const old = dist[e.v];
        dist[e.v] = dist[e.u] + e.w;
        changedThisRound = true;
        push(
          `Round ${i}: relax ${e.u}→${e.v} (w=${e.w}). dist[${e.v}]: ${fmt(old)} → ${dist[e.v]}.`,
          4,
          es,
        );
      } else {
        push(
          `Round ${i}: check ${e.u}→${e.v} (w=${e.w}). ${
            can ? `${dist[e.u]} + ${e.w} ≥ ${fmt(dist[e.v])}, no improvement.` : `${e.u} unreachable, skip.`
          }`,
          3,
          es,
        );
      }
    }
    if (!changedThisRound) {
      push(`Round ${i} made no changes — distances have converged early.`, 1);
      break;
    }
  }
  push(`Final shortest distances from ${src}. A V-th pass with any update would reveal a negative cycle.`, 5);
  return frames;
}

export default function BellmanFordSim() {
  const frames = useMemo(() => buildFrames("0"), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#22c55e"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#10b981" label="source / relaxed" />
          <LegendItem color="#f59e0b" label="reachable" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-3">
          <GraphView
            nodes={NODES}
            edges={EDGES}
            directed
            nodeStates={player.frame.nodeStates}
            edgeStates={player.frame.edgeStates}
            labels={player.frame.labels}
          />
          <div className="rounded-lg surface-sunken px-4 py-1.5 font-mono text-xs text-muted">
            relaxation round: <span className="font-bold text-emerald-500">{player.frame.round}</span> / {NODES.length - 1}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
