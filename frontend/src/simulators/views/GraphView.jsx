import { motion } from "framer-motion";
import { colorFor } from "./palette.js";

// Circular-layout graph renderer. nodes: [{id,label}], edges: [{u,v,w}],
// nodeStates: {id: state}, edgeStates: {"u-v": state}, labels: {id: text}.
export default function GraphView({
  nodes = [],
  edges = [],
  directed = false,
  nodeStates = {},
  edgeStates = {},
  labels = {},
  size = 380,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 44;
  const pos = {};
  nodes.forEach((nd, i) => {
    const ang = (-Math.PI / 2) + (2 * Math.PI * i) / nodes.length;
    pos[nd.id] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
  });

  const edgeKey = (u, v) => `${u}-${v}`;
  const stateOf = (u, v) => edgeStates[edgeKey(u, v)] || edgeStates[edgeKey(v, u)] || "default";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[420px]">
      {directed && (
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="rgb(var(--text-faint))" />
          </marker>
        </defs>
      )}
      {edges.map((e, i) => {
        const a = pos[e.u];
        const b = pos[e.v];
        if (!a || !b) return null;
        const st = stateOf(e.u, e.v);
        const active = st !== "default";
        const c = active ? colorFor(st).bg : "rgb(var(--border-strong))";
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={i}>
            <motion.line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={c}
              strokeWidth={active ? 3.5 : 2}
              markerEnd={directed ? "url(#arrow)" : undefined}
              animate={{ stroke: c }}
            />
            {e.w !== undefined && (
              <g>
                <circle cx={mx} cy={my} r="11" fill="rgb(var(--bg-elev))" stroke="rgb(var(--border))" />
                <text x={mx} y={my} dy="3.5" textAnchor="middle" className="fill-current font-mono text-[10px] font-bold">
                  {e.w}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {nodes.map((nd) => {
        const p = pos[nd.id];
        const c = colorFor(nodeStates[nd.id] || "default");
        return (
          <g key={nd.id}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="19"
              animate={{ fill: c.bg, stroke: c.border }}
              strokeWidth="2.5"
            />
            <text x={p.x} y={p.y} dy="4.5" textAnchor="middle" fontWeight="700" style={{ fill: c.fg }} className="font-mono text-sm">
              {nd.label ?? nd.id}
            </text>
            {labels[nd.id] !== undefined && (
              <g>
                <rect x={p.x - 14} y={p.y - 38} width="28" height="17" rx="5" fill="#2563eb" />
                <text x={p.x} y={p.y - 26} textAnchor="middle" className="font-mono text-[10px] font-bold" fill="#fff">
                  {labels[nd.id]}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
