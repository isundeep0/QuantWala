import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import TreeView from "../views/TreeView.jsx";

// Unbalanced tree so the diameter is a clear, non-trivial path.
const TREE = {
  1: { children: [2, 3], x: 0.5, y: 0.12 },
  2: { children: [4, 5], x: 0.3, y: 0.4 },
  3: { children: [6], x: 0.74, y: 0.4 },
  4: { children: [], x: 0.16, y: 0.7 },
  5: { children: [7], x: 0.42, y: 0.7 },
  6: { children: [], x: 0.74, y: 0.7 },
  7: { children: [], x: 0.42, y: 0.95 },
};
const NODES = Object.entries(TREE).map(([id, n]) => ({ id, label: id, x: n.x, y: n.y }));
const EDGES = [];
for (const [id, n] of Object.entries(TREE)) for (const ch of n.children) EDGES.push({ u: id, v: String(ch) });

const PSEUDO = [
  "best = 0",
  "height(node):",
  "  h1, h2 = two largest child heights",
  "  best = max(best, h1 + h2)   // path through node",
  "  return 1 + max(child heights)",
];

function buildFrames() {
  const frames = [];
  const heights = {};
  const states = {};
  const through = {};
  let best = 0;
  const push = (explain, line, extra = {}) =>
    frames.push({ states: { ...states }, labels: { ...heights }, explain, line, best, ...extra });

  push("Diameter = longest path between any two nodes. One DFS computes each node's height and the best path through it.", 0);

  const height = (id) => {
    id = String(id);
    states[id] = "current";
    push(`Enter ${id}; recurse into its children first (post-order).`, 2);
    let h1 = 0;
    let h2 = 0;
    for (const ch of TREE[id].children) {
      const h = height(ch) + 1;
      if (h > h1) {
        h2 = h1;
        h1 = h;
      } else if (h > h2) {
        h2 = h;
      }
    }
    heights[id] = `h=${h1}`;
    if (h1 + h2 > best) {
      best = h1 + h2;
      through[id] = true;
      push(`At ${id}: two deepest branches = ${h1} + ${h2} = ${h1 + h2} edges → new best diameter.`, 3, { highlight: id });
    } else {
      push(`At ${id}: branches ${h1} + ${h2} = ${h1 + h2} ≤ best ${best}. Height of ${id} is ${h1}.`, 4);
    }
    states[id] = "visited";
    return h1;
  };
  height("1");
  push(`The tree's diameter is ${best} edges — the longest root-to-root path between two leaves.`, 0);
  return frames;
}

export default function TreeDiameterSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#10b981"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="computing height" />
          <LegendItem color="#10b981" label="done (badge = height)" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-3">
          <TreeView nodes={NODES} edges={EDGES} nodeStates={f.states} labels={f.labels} />
          <div className="rounded-lg surface-sunken px-4 py-1.5 font-mono text-sm">
            best diameter = <span className="font-bold text-emerald-500">{f.best}</span> edges
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
