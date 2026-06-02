import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import TreeView from "../views/TreeView.jsx";

// House Robber III: each node holds money; you can't rob a parent and child.
const TREE = {
  1: { val: 3, children: [2, 3], x: 0.5, y: 0.12 },
  2: { val: 4, children: [4], x: 0.3, y: 0.42 },
  3: { val: 5, children: [5, 6], x: 0.72, y: 0.42 },
  4: { val: 1, children: [], x: 0.3, y: 0.74 },
  5: { val: 3, children: [], x: 0.6, y: 0.74 },
  6: { val: 1, children: [], x: 0.86, y: 0.74 },
};
const NODES = Object.entries(TREE).map(([id, n]) => ({ id, label: n.val, x: n.x, y: n.y }));
const EDGES = [];
for (const [id, n] of Object.entries(TREE)) for (const ch of n.children) EDGES.push({ u: id, v: String(ch) });

const PSEUDO = [
  "dfs(node) → (rob, skip)",
  "  rob  = node.val + Σ child.skip",
  "  skip = Σ max(child.rob, child.skip)",
  "answer = max(dfs(root))",
];

function buildFrames() {
  const frames = [];
  const states = {};
  const labels = {};
  const push = (explain, line) => frames.push({ states: { ...states }, labels: { ...labels }, explain, line });

  push("Each node holds money (shown inside). dfs returns two values: best if we ROB this node, or SKIP it.", 0);
  const dfs = (id) => {
    id = String(id);
    states[id] = "current";
    push(`Enter node ${id} ($${TREE[id].val}); solve its children first.`, 0);
    let rob = TREE[id].val;
    let skip = 0;
    for (const ch of TREE[id].children) {
      const [cr, cs] = dfs(ch);
      rob += cs; // can't rob a child if we rob here
      skip += Math.max(cr, cs); // children free to choose
    }
    labels[id] = `${rob}/${skip}`;
    states[id] = "visited";
    push(`Node ${id}: rob = ${TREE[id].val} + Σchild.skip = ${rob}; skip = Σmax(child) = ${skip}.`, 1);
    return [rob, skip];
  };
  const [r, s] = dfs("1");
  push(`Answer = max(rob, skip) at the root = max(${r}, ${s}) = ${Math.max(r, s)} — the most money you can rob.`, 3);
  return frames;
}

export default function TreeDPSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#10b981"
      pseudocode={PSEUDO}
      inputPanel={<div className="text-sm text-muted">Badge above each node shows <span className="font-mono text-[color:rgb(var(--text))]">rob / skip</span> once computed.</div>}
      legend={
        <>
          <LegendItem color="#2563eb" label="computing" />
          <LegendItem color="#10b981" label="solved (rob/skip)" />
        </>
      }
    >
      {player.frame && <TreeView nodes={NODES} edges={EDGES} nodeStates={player.frame.states} labels={player.frame.labels} />}
    </SimulatorShell>
  );
}
