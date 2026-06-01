import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import TreeView from "../views/TreeView.jsx";

// Fixed sample binary tree (heap-indexed). null = absent.
//            1
//        2       3
//      4   5   6   7
const TREE = {
  1: { val: 1, left: 2, right: 3, x: 0.5, y: 0.15 },
  2: { val: 2, left: 4, right: 5, x: 0.28, y: 0.45 },
  3: { val: 3, left: 6, right: 7, x: 0.72, y: 0.45 },
  4: { val: 4, x: 0.15, y: 0.8 },
  5: { val: 5, x: 0.4, y: 0.8 },
  6: { val: 6, x: 0.6, y: 0.8 },
  7: { val: 7, x: 0.85, y: 0.8 },
};

const NODES = Object.entries(TREE).map(([id, n]) => ({ id, label: n.val, x: n.x, y: n.y }));
const EDGES = [];
for (const [id, n] of Object.entries(TREE)) {
  if (n.left) EDGES.push({ u: id, v: String(n.left) });
  if (n.right) EDGES.push({ u: id, v: String(n.right) });
}

const PSEUDO = {
  preorder: ["dfs(node):", "  if node is null: return", "  visit(node)        // root first", "  dfs(node.left)", "  dfs(node.right)"],
  inorder: ["dfs(node):", "  if node is null: return", "  dfs(node.left)", "  visit(node)        // root in middle", "  dfs(node.right)"],
  postorder: ["dfs(node):", "  if node is null: return", "  dfs(node.left)", "  dfs(node.right)", "  visit(node)        // root last"],
  bfs: ["queue = [root]", "while queue not empty:", "  node = queue.popFront()", "  visit(node)", "  push node.left, node.right"],
};

function buildFrames(mode) {
  const frames = [];
  const order = [];
  const nodeStates = {};
  const push = (explain, line) => frames.push({ nodeStates: { ...nodeStates }, order: [...order], explain, line });

  if (mode === "bfs") {
    const q = ["1"];
    push("BFS visits level by level using a queue. Enqueue the root.", 0);
    while (q.length) {
      const id = q.shift();
      nodeStates[id] = "current";
      order.push(TREE[id].val);
      push(`Visit node ${TREE[id].val}. Enqueue its children.`, 3);
      nodeStates[id] = "visited";
      if (TREE[id].left) q.push(String(TREE[id].left));
      if (TREE[id].right) q.push(String(TREE[id].right));
    }
  } else {
    const lineFor = { preorder: 2, inorder: 3, postorder: 4 }[mode];
    const dfs = (id) => {
      if (!id) return;
      id = String(id);
      nodeStates[id] = "frontier";
      if (mode === "preorder") {
        nodeStates[id] = "current";
        order.push(TREE[id].val);
        push(`Pre-order: visit ${TREE[id].val} before its children.`, lineFor);
      }
      dfs(TREE[id].left);
      if (mode === "inorder") {
        nodeStates[id] = "current";
        order.push(TREE[id].val);
        push(`In-order: visit ${TREE[id].val} between left and right subtrees.`, lineFor);
      }
      dfs(TREE[id].right);
      if (mode === "postorder") {
        nodeStates[id] = "current";
        order.push(TREE[id].val);
        push(`Post-order: visit ${TREE[id].val} after both subtrees.`, lineFor);
      }
      nodeStates[id] = "visited";
    };
    push(`${mode} DFS recursion starting at the root.`, 0);
    dfs("1");
  }
  push(`Traversal order: ${order.join(" → ")}.`, 0);
  return frames;
}

const MODES = [
  ["preorder", "Pre-order"],
  ["inorder", "In-order"],
  ["postorder", "Post-order"],
  ["bfs", "BFS (level)"],
];

export default function TreeTraversalSim() {
  const [mode, setMode] = useState("preorder");
  const frames = useMemo(() => buildFrames(mode), [mode]);
  const player = useStepPlayer(frames);

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#10b981"
      pseudocode={PSEUDO[mode]}
      inputPanel={
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted">Traversal</span>
          {MODES.map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                setMode(k);
                player.reset();
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                mode === k ? "bg-emerald-500 text-white" : "surface-sunken"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="visiting" />
          <LegendItem color="#10b981" label="done" />
        </>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-3">
          <TreeView nodes={NODES} edges={EDGES} nodeStates={player.frame.nodeStates} />
          <div className="font-mono text-sm">
            <span className="text-muted">order: </span>
            <span className="font-bold text-emerald-500">{player.frame.order.join(" → ") || "—"}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
