import { motion } from "framer-motion";
import { colorFor } from "./palette.js";

// Renders a segment tree. nodes: [{id, lo, hi, val, lazy, x, y}] with x,y in [0,1].
// edges: [{u,v}]. states: {id: stateKey}. showLazy renders a lazy-tag badge.
export default function SegTreeView({ nodes = [], edges = [], states = {}, width = 560, height = 300, showLazy = false }) {
  const pos = {};
  nodes.forEach((n) => (pos[n.id] = { x: n.x * width, y: n.y * height }));
  const W = 58;
  const H = 34;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[660px]">
      {edges.map((e, i) => {
        const a = pos[e.u];
        const b = pos[e.v];
        if (!a || !b) return null;
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(var(--border-strong))" strokeWidth="2" />;
      })}
      {nodes.map((n) => {
        const p = pos[n.id];
        const c = colorFor(states[n.id] || "default");
        return (
          <g key={n.id}>
            <motion.rect x={p.x - W / 2} y={p.y - H / 2} width={W} height={H} rx="7" animate={{ fill: c.bg, stroke: c.border }} strokeWidth="2" />
            <text x={p.x} y={p.y - 1} textAnchor="middle" style={{ fill: c.fg }} className="font-mono text-[13px] font-bold">
              {n.val}
            </text>
            <text x={p.x} y={p.y + 11} textAnchor="middle" style={{ fill: c.fg }} className="font-mono text-[8.5px] opacity-80">
              [{n.lo},{n.hi}]
            </text>
            {showLazy && n.lazy ? (
              <g>
                <circle cx={p.x + W / 2 - 3} cy={p.y - H / 2 + 1} r="8.5" fill="#f59e0b" />
                <text x={p.x + W / 2 - 3} y={p.y - H / 2 + 4} textAnchor="middle" className="font-mono text-[8px] font-bold" fill="#fff">
                  +{n.lazy}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// Builds a segment-tree node map over array `a`. Returns { nodes, edges, maxDepth }.
export function buildSegTree(a) {
  const n = a.length;
  const nodes = {};
  let maxDepth = 0;
  const rec = (id, lo, hi, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    const node = { id, lo, hi, depth, left: null, right: null, val: 0, lazy: 0 };
    nodes[id] = node;
    if (lo === hi) {
      node.val = a[lo];
    } else {
      const mid = (lo + hi) >> 1;
      node.left = 2 * id;
      node.right = 2 * id + 1;
      rec(2 * id, lo, mid, depth + 1);
      rec(2 * id + 1, mid + 1, hi, depth + 1);
      node.val = nodes[2 * id].val + nodes[2 * id + 1].val;
    }
  };
  rec(1, 0, n - 1, 0);
  const edges = [];
  for (const id in nodes) {
    const nd = nodes[id];
    nd.x = ((nd.lo + nd.hi) / 2 + 0.5) / n;
    nd.y = 0.12 + (maxDepth ? nd.depth / maxDepth : 0) * 0.76;
    if (nd.left) edges.push({ u: String(id), v: String(nd.left) });
    if (nd.right) edges.push({ u: String(id), v: String(nd.right) });
  }
  return { nodes, edges, maxDepth };
}
