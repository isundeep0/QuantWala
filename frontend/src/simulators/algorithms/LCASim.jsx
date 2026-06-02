import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import TreeView from "../views/TreeView.jsx";

const TREE = {
  1: { left: 2, right: 3, x: 0.5, y: 0.12 },
  2: { left: 4, right: 5, x: 0.28, y: 0.42 },
  3: { left: 6, right: 7, x: 0.72, y: 0.42 },
  4: { x: 0.14, y: 0.74 },
  5: { x: 0.4, y: 0.74 },
  6: { x: 0.6, y: 0.74 },
  7: { x: 0.86, y: 0.74 },
};
const NODES = Object.entries(TREE).map(([id, n]) => ({ id, label: id, x: n.x, y: n.y }));
const EDGES = [];
for (const [id, n] of Object.entries(TREE)) {
  if (n.left) EDGES.push({ u: id, v: String(n.left) });
  if (n.right) EDGES.push({ u: id, v: String(n.right) });
}

const PSEUDO = [
  "lca(node, p, q):",
  "  if !node or node==p or node==q: return node",
  "  L = lca(node.left, p, q)",
  "  R = lca(node.right, p, q)",
  "  if L and R: return node   // split point",
  "  return L or R",
];

function buildFrames(p, q) {
  const frames = [];
  const states = {};
  const push = (explain, line, extra = {}) =>
    frames.push({ states: { ...states, ...(extra.states || {}) }, explain, line, lca: extra.lca });

  states[p] = "active";
  states[q] = "active";
  push(`Find the lowest common ancestor of ${p} and ${q}. DFS returns a target if found in a subtree.`, 0);

  const dfs = (id) => {
    if (!id) return null;
    id = String(id);
    states[id] = "current";
    push(`Enter ${id}.`, 1);
    if (id === p || id === q) {
      states[id] = "path";
      push(`${id} is one of the targets → return it up.`, 1);
      return id;
    }
    const L = dfs(TREE[id].left);
    const R = dfs(TREE[id].right);
    if (L && R) {
      states[id] = "best";
      push(`Both subtrees of ${id} returned a target (left=${L}, right=${R}) → ${id} is the LCA!`, 4, { lca: id });
      return id;
    }
    const ret = L || R;
    states[id] = ret ? "path" : "visited";
    push(ret ? `${id} passes up the found target (${ret}).` : `${id}'s subtrees found nothing → return null.`, 5);
    return ret;
  };
  const ans = dfs("1");
  push(`Lowest common ancestor of ${p} and ${q} is node ${ans}.`, 4, { lca: ans });
  return frames;
}

const LEAVES = ["4", "5", "6", "7"];

export default function LCASim() {
  const [p, setP] = useState("4");
  const [q, setQ] = useState("7");
  const frames = useMemo(() => buildFrames(p, q), [p, q]);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#10b981"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {[["p", p, setP], ["q", q, setQ]].map(([label, val, set]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-muted">{label} =</span>
              {LEAVES.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    set(id);
                    player.reset();
                  }}
                  className={`h-8 w-8 rounded-lg border font-mono text-sm font-semibold ${
                    val === id ? "bg-emerald-500 text-white" : "surface-sunken"
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          ))}
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="visiting" />
          <LegendItem color="#8b5cf6" label="carries a target" />
          <LegendItem color="#10b981" label="LCA" />
        </>
      }
    >
      {player.frame && <TreeView nodes={NODES} edges={EDGES} nodeStates={player.frame.states} />}
    </SimulatorShell>
  );
}
