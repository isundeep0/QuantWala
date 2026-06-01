import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GraphView from "../views/GraphView.jsx";

const NODES = ["A", "B", "C", "D", "E", "F"].map((id) => ({ id, label: id }));
const EDGES = [
  { u: "A", v: "B", w: 4 },
  { u: "A", v: "C", w: 2 },
  { u: "C", v: "B", w: 1 },
  { u: "B", v: "D", w: 5 },
  { u: "C", v: "D", w: 8 },
  { u: "C", v: "E", w: 10 },
  { u: "D", v: "E", w: 2 },
  { u: "D", v: "F", w: 6 },
  { u: "E", v: "F", w: 3 },
];

const PSEUDO = [
  "dist[start] = 0, others = ∞",
  "PQ = {(0, start)}",
  "while PQ not empty:",
  "  u = node with smallest dist (pop)",
  "  for (v, w) in adj[u]:",
  "    if dist[u] + w < dist[v]:",
  "      dist[v] = dist[u] + w; push v",
];

function buildAdj() {
  const adj = {};
  for (const n of NODES) adj[n.id] = [];
  for (const e of EDGES) {
    adj[e.u].push([e.v, e.w]);
    adj[e.v].push([e.u, e.w]);
  }
  return adj;
}

function buildFrames(start = "A") {
  const adj = buildAdj();
  const dist = {};
  const done = {};
  NODES.forEach((n) => (dist[n.id] = Infinity));
  dist[start] = 0;
  const frames = [];
  const fmt = (d) => (d === Infinity ? "∞" : String(d));
  const labels = () => Object.fromEntries(NODES.map((n) => [n.id, fmt(dist[n.id])]));
  const nodeStates = () => {
    const s = {};
    for (const n of NODES) s[n.id] = done[n.id] ? "visited" : dist[n.id] < Infinity ? "frontier" : "default";
    return s;
  };
  const push = (explain, line, ns) =>
    frames.push({ labels: labels(), nodeStates: ns || nodeStates(), explain, line });

  push(`Initialize: dist[${start}] = 0, every other node = ∞.`, 0);

  while (true) {
    let u = null;
    let best = Infinity;
    for (const n of NODES) {
      if (!done[n.id] && dist[n.id] < best) {
        best = dist[n.id];
        u = n.id;
      }
    }
    if (u === null) break;
    done[u] = true;
    const ns = nodeStates();
    ns[u] = "current";
    push(`Pick the unfinished node with the smallest dist: ${u} (dist=${fmt(dist[u])}). It is now final.`, 3, ns);

    for (const [v, w] of adj[u]) {
      if (done[v]) continue;
      if (dist[u] + w < dist[v]) {
        const old = dist[v];
        dist[v] = dist[u] + w;
        const ns2 = nodeStates();
        ns2[u] = "current";
        ns2[v] = "path";
        push(`Relax edge ${u}→${v} (w=${w}): ${fmt(old)} → ${dist[v]}. Found a shorter path.`, 6, ns2);
      }
    }
  }
  push(`All shortest distances finalized from ${start}.`, 2);
  return frames;
}

export default function DijkstraSim() {
  const frames = useMemo(() => buildFrames("A"), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#22c55e"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="popped (settling)" />
          <LegendItem color="#8b5cf6" label="relaxed" />
          <LegendItem color="#f59e0b" label="reachable" />
          <LegendItem color="#10b981" label="finalized" />
        </>
      }
    >
      {player.frame && (
        <GraphView nodes={NODES} edges={EDGES} nodeStates={player.frame.nodeStates} labels={player.frame.labels} />
      )}
    </SimulatorShell>
  );
}
