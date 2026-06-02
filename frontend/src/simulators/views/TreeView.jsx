import { motion } from "framer-motion";
import { colorFor } from "./palette.js";

// Generic tree renderer. nodes: [{id,x,y,label}] with x,y in [0,1] fractions.
// edges: [{u,v}]. nodeStates: {id: state}. edgeStates: {"u-v": state}.
// labels: {id: text} renders a small badge above the node.
export default function TreeView({
  nodes = [],
  edges = [],
  nodeStates = {},
  edgeStates = {},
  labels = {},
  width = 460,
  height = 300,
}) {
  const pos = {};
  nodes.forEach((n) => (pos[n.id] = { x: n.x * width, y: n.y * height }));
  const edgeColor = (e) => {
    const st = edgeStates[`${e.u}-${e.v}`] || edgeStates[`${e.v}-${e.u}`];
    return st ? colorFor(st).bg : "rgb(var(--border-strong))";
  };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[520px]">
      {edges.map((e, i) => {
        const a = pos[e.u];
        const b = pos[e.v];
        if (!a || !b) return null;
        const active = Boolean(edgeStates[`${e.u}-${e.v}`] || edgeStates[`${e.v}-${e.u}`]);
        return (
          <motion.line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            animate={{ stroke: edgeColor(e) }}
            strokeWidth={active ? 4 : 2}
          />
        );
      })}
      {nodes.map((n) => {
        const p = pos[n.id];
        const c = colorFor(nodeStates[n.id] || "default");
        return (
          <g key={n.id}>
            <motion.circle cx={p.x} cy={p.y} r="18" animate={{ fill: c.bg, stroke: c.border }} strokeWidth="2.5" />
            <text x={p.x} y={p.y} dy="4.5" textAnchor="middle" fontWeight="700" style={{ fill: c.fg }} className="font-mono text-sm">
              {n.label}
            </text>
            {labels[n.id] !== undefined && (
              <g>
                <rect x={p.x - 22} y={p.y - 40} width="44" height="17" rx="5" fill="#10b981" />
                <text x={p.x} y={p.y - 28} textAnchor="middle" className="font-mono text-[10px] font-bold" fill="#fff">
                  {labels[n.id]}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
