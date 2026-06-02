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
  "sort edges by weight",
  "for each edge (u,v,w):",
  "  if find(u) != find(v):     // no cycle",
  "    union(u,v); add edge",
  "    if used == V-1: stop",
];

function buildFrames() {
  const sorted = [...EDGES].sort((a, b) => a.w - b.w);
  const parent = Object.fromEntries(NODES.map((n) => [n.id, n.id]));
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const frames = [];
  const chosen = {};
  let cost = 0;
  let used = 0;
  const edgeStates = () => ({ ...chosen });
  const push = (explain, line, extra = {}) =>
    frames.push({ edgeStates: { ...edgeStates(), ...(extra.edgeStates || {}) }, explain, line, cost, used, sorted, cursor: extra.cursor ?? -1 });

  push(`Sort all ${EDGES.length} edges by weight. Greedily add the lightest edge that doesn't form a cycle.`, 0);
  for (let idx = 0; idx < sorted.length; idx++) {
    const e = sorted[idx];
    const ru = find(e.u);
    const rv = find(e.v);
    const key = `${e.u}-${e.v}`;
    if (ru !== rv) {
      parent[ru] = rv;
      chosen[key] = "best";
      cost += e.w;
      used++;
      push(`Edge ${e.u}–${e.v} (w=${e.w}): endpoints in different trees → add it. MST cost = ${cost}.`, 3, { cursor: idx });
      if (used === NODES.length - 1) {
        push(`Used ${used} edges = V-1. The spanning tree is complete with total weight ${cost}.`, 4, { cursor: idx });
        break;
      }
    } else {
      push(`Edge ${e.u}–${e.v} (w=${e.w}): both endpoints already connected → skip (would create a cycle).`, 2, {
        cursor: idx,
        edgeStates: { [key]: "discard" },
      });
    }
  }
  return frames;
}

export default function KruskalSim() {
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
          <LegendItem color="#10b981" label="in MST" />
          <LegendItem color="rgb(var(--bg-sunken))" label="rejected (cycle)" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-3">
          <GraphView nodes={NODES} edges={EDGES} nodeStates={{}} edgeStates={f.edgeStates} />
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[11px]">
            {f.sorted.map((e, i) => (
              <span
                key={i}
                className={`rounded px-1.5 py-1 ${
                  i === f.cursor
                    ? "bg-emerald-500 text-white"
                    : f.edgeStates[`${e.u}-${e.v}`] === "best"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "surface-sunken text-muted"
                }`}
              >
                {e.u}{e.v}:{e.w}
              </span>
            ))}
          </div>
          <div className="rounded-lg surface-sunken px-4 py-1.5 font-mono text-sm">
            MST weight = <span className="font-bold text-emerald-500">{f.cost}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
